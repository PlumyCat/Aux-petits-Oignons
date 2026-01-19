/**
 * Azure Status Command
 * Check status of Azure deployments and resources
 */

import type { Argv } from "yargs"
import { cmd } from "./cmd"
import { UI } from "../ui"
import { AzureDeployment } from "../../azure/deployment"
import { AzureAuth } from "../../azure/auth"
import { AzureLogger } from "../../azure/logger"
import { ErrorAnalyzer } from "../../azure/error-analyzer"

export const AzureStatusCommand = cmd({
  command: "aux status [resource-group]",
  describe: "Check status of Azure deployments and resources",
  builder: (yargs: Argv) => {
    return yargs
      .positional("resource-group", {
        describe: "Azure resource group name",
        type: "string",
      })
      .option("subscription", {
        alias: "s",
        describe: "Azure subscription ID",
        type: "string",
      })
      .option("deployment", {
        alias: "d",
        describe: "Specific deployment name to check",
        type: "string",
      })
      .option("verbose", {
        alias: "v",
        describe: "Enable verbose output",
        type: "boolean",
        default: false,
      })
      .example([
        ["$0 aux status", "Show status of default resource group"],
        ["$0 aux status rg-myapp-prod", "Show status of specific resource group"],
        ["$0 aux status -d deployment-123456", "Show specific deployment status"],
      ])
  },
  handler: async (args) => {
    try {
      AzureLogger.setVerbose(args.verbose || false)

      // Display header
      UI.println("")
      UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO_BOLD + "  OpenCode - Statut Azure" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
      UI.println("")

      // Get current Azure account
      const account = await AzureAuth.getCurrentAccount()

      if (!account) {
        AzureLogger.error("Vous n'êtes pas connecté à Azure")
        AzureLogger.error("Exécutez 'az login' pour vous connecter")
        process.exit(1)
      }

      const subscriptionId = args.subscription || account.id
      const resourceGroupName = args["resource-group"] || "rg-opencode-dev"

      UI.println(UI.Style.TEXT_INFO + `Abonnement: ${account.name}` + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO + `Subscription ID: ${subscriptionId}` + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO + `Resource Group: ${resourceGroupName}` + UI.Style.TEXT_NORMAL)
      UI.println("")

      // If specific deployment requested
      if (args.deployment) {
        AzureLogger.info(`Vérification du déploiement: ${args.deployment}`)

        const status = await AzureDeployment.getStatus(
          subscriptionId,
          resourceGroupName,
          args.deployment,
        )

        UI.println("")
        UI.println(UI.Style.TEXT_SUCCESS + "Déploiement:" + UI.Style.TEXT_NORMAL)
        UI.println(UI.Style.TEXT_INFO + `  Nom: ${status.name}` + UI.Style.TEXT_NORMAL)
        UI.println(UI.Style.TEXT_INFO + `  État: ${status.provisioningState}` + UI.Style.TEXT_NORMAL)

        if (status.timestamp) {
          UI.println(UI.Style.TEXT_INFO + `  Date: ${status.timestamp}` + UI.Style.TEXT_NORMAL)
        }

        if (status.duration) {
          UI.println(UI.Style.TEXT_INFO + `  Durée: ${status.duration}` + UI.Style.TEXT_NORMAL)
        }

        if (status.outputs && Object.keys(status.outputs).length > 0) {
          UI.println("")
          UI.println(UI.Style.TEXT_SUCCESS + "Outputs:" + UI.Style.TEXT_NORMAL)
          for (const [key, value] of Object.entries(status.outputs)) {
            UI.println(UI.Style.TEXT_INFO + `  ${key}: ${(value as any).value}` + UI.Style.TEXT_NORMAL)
          }
        }

        UI.println("")
        return
      }

      // List all resources in resource group
      AzureLogger.info("Récupération des ressources...")

      const resources = await AzureDeployment.listResources(subscriptionId, resourceGroupName)

      if (resources.length === 0) {
        AzureLogger.warn("Aucune ressource trouvée dans le resource group")
        UI.println("")
        AzureLogger.info("Créez des ressources avec: opencode aux deploy")
        UI.println("")
        return
      }

      UI.println("")
      UI.println(UI.Style.TEXT_SUCCESS + `Ressources (${resources.length}):` + UI.Style.TEXT_NORMAL)
      UI.println("")

      // Group resources by type
      const grouped = resources.reduce(
        (acc, resource) => {
          const type = resource.type || "unknown"
          if (!acc[type]) {
            acc[type] = []
          }
          acc[type].push(resource)
          return acc
        },
        {} as Record<string, any[]>,
      )

      // Display grouped resources
      for (const [type, resourceList] of Object.entries(grouped)) {
        const typeDisplay = type.split("/").pop() || type
        UI.println(UI.Style.TEXT_INFO_BOLD + `  ${typeDisplay}:` + UI.Style.TEXT_NORMAL)

        for (const resource of resourceList as any[]) {
          const status = "✓"
          UI.println(UI.Style.TEXT_SUCCESS + `    ${status} ${resource.name}` + UI.Style.TEXT_NORMAL)
          if (args.verbose) {
            UI.println(UI.Style.TEXT_DIM + `       Location: ${resource.location}` + UI.Style.TEXT_NORMAL)
            UI.println(UI.Style.TEXT_DIM + `       ID: ${resource.id}` + UI.Style.TEXT_NORMAL)
          }
        }
        UI.println("")
      }

      // Summary
      UI.println(UI.Style.TEXT_SUCCESS + "─────────────────────────────────────" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_SUCCESS + `Total: ${resources.length} ressources` + UI.Style.TEXT_NORMAL)
      UI.println("")
    } catch (error) {
      const err = error as Error

      // Analyser l'erreur avec ErrorAnalyzer
      const analysis = ErrorAnalyzer.analyze(err)

      // Afficher l'analyse d'erreur
      UI.println("")
      UI.println(UI.Style.TEXT_DANGER + "✗ Erreur lors de la récupération du statut" + UI.Style.TEXT_NORMAL)
      UI.println("")

      // Afficher le rapport formaté
      console.error(ErrorAnalyzer.formatReport(analysis, args.verbose || false))

      process.exit(1)
    }
  },
})
