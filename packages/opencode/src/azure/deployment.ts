/**
 * Azure Deployment Service
 * Handles deployment of Azure Functions infrastructure using Bicep templates
 */

import { ResourceManagementClient } from "@azure/arm-resources"
import { AzureAuth } from "./auth"
import { AzureLogger } from "./logger"
import { readFile } from "fs/promises"
import { resolve, join } from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export interface DeploymentOptions {
  subscriptionId: string
  resourceGroupName: string
  location: string
  templateFile: string
  parametersFile?: string
  verbose?: boolean
}

export interface DeploymentResult {
  success: boolean
  deploymentName: string
  resourceGroupName: string
  resources: string[]
  outputs: Record<string, any>
  duration: number
  error?: Error
}

export class AzureDeployment {
  /**
   * Deploy infrastructure using Bicep template
   */
  static async deploy(options: DeploymentOptions): Promise<DeploymentResult> {
    const startTime = Date.now()
    AzureLogger.setVerbose(options.verbose || false)

    try {
      // Validate authentication
      AzureLogger.startOperation("authentication", "Validation de l'authentification Azure")
      await AzureAuth.validate()
      const credential = AzureAuth.getCredential()
      AzureLogger.completeOperation("authentication")

      // Set subscription
      AzureLogger.startOperation("subscription", `Configuration de l'abonnement: ${options.subscriptionId}`)
      await AzureAuth.setSubscription(options.subscriptionId)
      AzureLogger.completeOperation("subscription")

      // Create resource group if it doesn't exist
      AzureLogger.startOperation("resource-group", `Vérification du resource group: ${options.resourceGroupName}`)
      const client = new ResourceManagementClient(credential, options.subscriptionId)

      try {
        await client.resourceGroups.get(options.resourceGroupName)
        AzureLogger.info(`Resource group existant: ${options.resourceGroupName}`)
      } catch {
        AzureLogger.info(`Création du resource group: ${options.resourceGroupName}`)
        await client.resourceGroups.createOrUpdate(options.resourceGroupName, {
          location: options.location,
          tags: {
            ManagedBy: "OpenCode",
            Environment: "dev",
            CreatedAt: new Date().toISOString(),
          },
        })
        AzureLogger.success(`Resource group créé: ${options.resourceGroupName}`)
      }
      AzureLogger.completeOperation("resource-group")

      // Build Bicep template to ARM JSON
      AzureLogger.startOperation("bicep-build", "Compilation du template Bicep")
      const { stdout: armTemplateJson } = await execAsync(`az bicep build --file ${options.templateFile} --stdout`)
      const armTemplate = JSON.parse(armTemplateJson)
      AzureLogger.completeOperation("bicep-build")

      // Load parameters if provided
      let parameters: any = {}
      if (options.parametersFile) {
        AzureLogger.debug(`Chargement des paramètres depuis: ${options.parametersFile}`)
        const parametersContent = await readFile(options.parametersFile, "utf-8")
        const parametersJson = JSON.parse(parametersContent)
        parameters = parametersJson.parameters || {}
      }

      // Generate deployment name
      const deploymentName = `opencode-${Date.now()}`
      AzureLogger.info(`Nom du déploiement: ${deploymentName}`)

      // Validate deployment
      AzureLogger.startOperation("validation", "Validation du déploiement")
      const validationResult = await client.deployments.beginValidateAndWait(
        options.resourceGroupName,
        deploymentName,
        {
          properties: {
            mode: "Incremental",
            template: armTemplate,
            parameters,
          },
        },
      )

      if (validationResult.error) {
        throw new Error(`Validation failed: ${validationResult.error.message}`)
      }
      AzureLogger.completeOperation("validation")

      // Deploy infrastructure
      AzureLogger.startOperation("deployment", "Déploiement de l'infrastructure Azure")
      AzureLogger.info("Cela peut prendre plusieurs minutes...")

      const deploymentResult = await client.deployments.beginCreateOrUpdateAndWait(
        options.resourceGroupName,
        deploymentName,
        {
          properties: {
            mode: "Incremental",
            template: armTemplate,
            parameters,
          },
        },
      )

      if (!deploymentResult.properties) {
        throw new Error("Deployment result has no properties")
      }

      AzureLogger.completeOperation("deployment")

      // Get deployed resources
      const resources: string[] = []
      if (deploymentResult.properties.outputResources) {
        for (const resource of deploymentResult.properties.outputResources) {
          if (resource.id) {
            const resourceName = resource.id.split("/").pop() || "unknown"
            resources.push(resourceName)
          }
        }
      }

      // Get outputs
      const outputs: Record<string, any> = {}
      if (deploymentResult.properties.outputs) {
        for (const [key, value] of Object.entries(deploymentResult.properties.outputs)) {
          outputs[key] = (value as any).value
        }
      }

      const duration = Date.now() - startTime

      AzureLogger.printDeploymentSummary(options.resourceGroupName, deploymentName, resources, duration)

      return {
        success: true,
        deploymentName,
        resourceGroupName: options.resourceGroupName,
        resources,
        outputs,
        duration,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const err = error as Error

      const suggestions = this.getErrorSuggestions(err)
      AzureLogger.printErrorSummary(err, suggestions)

      return {
        success: false,
        deploymentName: `failed-${Date.now()}`,
        resourceGroupName: options.resourceGroupName,
        resources: [],
        outputs: {},
        duration,
        error: err,
      }
    }
  }

  /**
   * Get deployment status
   */
  static async getStatus(
    subscriptionId: string,
    resourceGroupName: string,
    deploymentName: string,
  ): Promise<any> {
    try {
      const credential = AzureAuth.getCredential()
      const client = new ResourceManagementClient(credential, subscriptionId)

      const deployment = await client.deployments.get(resourceGroupName, deploymentName)

      return {
        name: deployment.name,
        provisioningState: deployment.properties?.provisioningState,
        timestamp: deployment.properties?.timestamp,
        duration: deployment.properties?.duration,
        outputs: deployment.properties?.outputs,
      }
    } catch (error) {
      throw new Error(`Failed to get deployment status: ${(error as Error).message}`)
    }
  }

  /**
   * List resources in resource group
   */
  static async listResources(subscriptionId: string, resourceGroupName: string): Promise<any[]> {
    try {
      const credential = AzureAuth.getCredential()
      const client = new ResourceManagementClient(credential, subscriptionId)

      const resources = []
      for await (const resource of client.resources.listByResourceGroup(resourceGroupName)) {
        resources.push({
          name: resource.name,
          type: resource.type,
          location: resource.location,
          id: resource.id,
        })
      }

      return resources
    } catch (error) {
      throw new Error(`Failed to list resources: ${(error as Error).message}`)
    }
  }

  /**
   * Get error suggestions based on error message
   */
  private static getErrorSuggestions(error: Error): string[] {
    const message = error.message.toLowerCase()
    const suggestions: string[] = []

    if (message.includes("not logged in") || message.includes("authentication")) {
      suggestions.push("Exécutez 'az login' pour vous connecter à Azure")
      suggestions.push("Vérifiez que vous avez sélectionné le bon abonnement avec 'az account set'")
    }

    if (message.includes("permission") || message.includes("unauthorized")) {
      suggestions.push("Vérifiez que vous avez les permissions nécessaires sur le resource group")
      suggestions.push("Vous devez avoir au minimum le rôle 'Contributor'")
      suggestions.push("Contactez votre administrateur Azure pour obtenir les permissions")
    }

    if (message.includes("quota") || message.includes("limit")) {
      suggestions.push("Vérifiez les quotas de votre abonnement Azure")
      suggestions.push("Vous devrez peut-être demander une augmentation de quota")
    }

    if (message.includes("exists") || message.includes("conflict")) {
      suggestions.push("Une ressource avec ce nom existe déjà")
      suggestions.push("Choisissez un nom différent ou supprimez la ressource existante")
    }

    if (message.includes("bicep") || message.includes("template")) {
      suggestions.push("Vérifiez la syntaxe de votre template Bicep")
      suggestions.push("Exécutez 'az bicep build' pour vérifier le template")
    }

    if (suggestions.length === 0) {
      suggestions.push("Vérifiez les logs d'erreur ci-dessus pour plus de détails")
      suggestions.push("Consultez la documentation Azure pour ce type d'erreur")
    }

    return suggestions
  }
}
