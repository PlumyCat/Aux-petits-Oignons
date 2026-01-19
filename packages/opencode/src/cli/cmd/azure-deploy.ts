/**
 * Azure Deploy Command
 * Deploy Azure Functions infrastructure using Bicep templates
 */

import type { Argv } from "yargs"
import { cmd } from "./cmd"
import { UI } from "../ui"
import { AzureDeployment } from "../../azure/deployment"
import { AzureAuth } from "../../azure/auth"
import { AzurePermissions } from "../../azure/permissions"
import { AzureLogger } from "../../azure/logger"
import { ErrorAnalyzer } from "../../azure/error-analyzer"
import { resolve, join } from "path"
import { existsSync } from "fs"

export const AzureDeployCommand = cmd({
  command: "aux deploy [environment]",
  describe: "Deploy Azure Functions infrastructure",
  builder: (yargs: Argv) => {
    return yargs
      .positional("environment", {
        describe: "Environment to deploy (dev, staging, prod)",
        type: "string",
        default: "dev",
        choices: ["dev", "staging", "prod"],
      })
      .option("subscription", {
        alias: "s",
        describe: "Azure subscription ID",
        type: "string",
      })
      .option("resource-group", {
        alias: "g",
        describe: "Azure resource group name",
        type: "string",
      })
      .option("location", {
        alias: "l",
        describe: "Azure region",
        type: "string",
        default: "westeurope",
      })
      .option("template", {
        alias: "t",
        describe: "Path to Bicep template file",
        type: "string",
      })
      .option("parameters", {
        alias: "p",
        describe: "Path to parameters file",
        type: "string",
      })
      .option("verbose", {
        alias: "v",
        describe: "Enable verbose logging",
        type: "boolean",
        default: false,
      })
      .option("skip-validation", {
        describe: "Skip permissions validation",
        type: "boolean",
        default: false,
      })
      .example([
        ["$0 aux deploy", "Deploy to dev environment"],
        ["$0 aux deploy prod -g rg-myapp-prod", "Deploy to production"],
        ["$0 aux deploy staging --verbose", "Deploy with verbose logging"],
      ])
  },
  handler: async (args) => {
    try {
      AzureLogger.setVerbose(args.verbose || false)

      // Display header
      UI.println("")
      UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO_BOLD + "  OpenCode - Déploiement Azure" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
      UI.println("")

      // Get current Azure account
      AzureLogger.info("Vérification de l'authentification Azure...")
      const account = await AzureAuth.getCurrentAccount()

      if (!account) {
        AzureLogger.error("Vous n'êtes pas connecté à Azure")
        AzureLogger.error("Exécutez 'az login' pour vous connecter")
        process.exit(1)
      }

      AzureLogger.success(`Connecté à Azure: ${account.name}`)
      AzureLogger.info(`Abonnement: ${account.id}`)

      // Determine subscription ID
      const subscriptionId = args.subscription || account.id
      if (!subscriptionId) {
        AzureLogger.error("Subscription ID manquant")
        AzureLogger.error("Spécifiez avec --subscription ou connectez-vous avec 'az login'")
        process.exit(1)
      }

      // Determine resource group name
      const environment = args.environment || "dev"
      const resourceGroupName =
        args["resource-group"] || `rg-opencode-${environment}`

      AzureLogger.info(`Environnement: ${environment}`)
      AzureLogger.info(`Resource Group: ${resourceGroupName}`)
      AzureLogger.info(`Région: ${args.location}`)

      // Determine template file
      const templateFile =
        args.template ||
        resolve(process.cwd(), "templates/azure/main.bicep")

      if (!existsSync(templateFile)) {
        AzureLogger.error(`Template Bicep introuvable: ${templateFile}`)
        AzureLogger.error("Créez d'abord les templates avec la story STORY-005")
        process.exit(1)
      }

      AzureLogger.success(`Template trouvé: ${templateFile}`)

      // Determine parameters file
      const parametersFile =
        args.parameters ||
        resolve(
          process.cwd(),
          `templates/azure/parameters/${environment}.parameters.json`,
        )

      if (existsSync(parametersFile)) {
        AzureLogger.success(`Paramètres trouvés: ${parametersFile}`)
      } else {
        AzureLogger.warn(`Fichier de paramètres introuvable: ${parametersFile}`)
        AzureLogger.warn("Déploiement avec paramètres par défaut")
      }

      // Validate permissions
      if (!args["skip-validation"]) {
        AzureLogger.info("Validation des permissions...")
        const permissionsResult = await AzurePermissions.validateResourceGroupPermissions(
          subscriptionId,
          resourceGroupName,
        )

        if (!permissionsResult.hasPermissions) {
          AzureLogger.warn("Permissions manquantes détectées:")
          permissionsResult.missingPermissions.forEach((permission) => {
            AzureLogger.warn(`  - ${permission}`)
          })
          UI.println("")
          permissionsResult.suggestions.forEach((suggestion) => {
            AzureLogger.warn(`  • ${suggestion}`)
          })
          UI.println("")

          // Don't block deployment, just warn
          AzureLogger.warn("Tentative de déploiement malgré les permissions manquantes...")
        } else {
          AzureLogger.success("Permissions validées")
        }
      }

      // Deploy infrastructure
      UI.println("")
      AzureLogger.info("Démarrage du déploiement...")
      UI.println("")

      const result = await AzureDeployment.deploy({
        subscriptionId,
        resourceGroupName,
        location: args.location || "westeurope",
        templateFile,
        parametersFile: existsSync(parametersFile) ? parametersFile : undefined,
        verbose: args.verbose || false,
      })

      if (!result.success) {
        process.exit(1)
      }

      // Display outputs
      if (Object.keys(result.outputs).length > 0) {
        UI.println("")
        UI.println(UI.Style.TEXT_INFO + "Outputs du déploiement:" + UI.Style.TEXT_NORMAL)
        for (const [key, value] of Object.entries(result.outputs)) {
          UI.println(UI.Style.TEXT_INFO + `  ${key}: ${value}` + UI.Style.TEXT_NORMAL)
        }
      }

      UI.println("")
      AzureLogger.success("Déploiement terminé avec succès!")
      UI.println("")
    } catch (error) {
      const err = error as Error

      // Analyser l'erreur avec ErrorAnalyzer
      const analysis = ErrorAnalyzer.analyze(err)

      // Afficher l'analyse d'erreur complète
      UI.println("")
      UI.println(UI.Style.TEXT_DANGER_BOLD + "╔════════════════════════════════════════╗" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_DANGER_BOLD + "║  Erreur lors du déploiement            ║" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_DANGER_BOLD + "╚════════════════════════════════════════╝" + UI.Style.TEXT_NORMAL)
      UI.println("")

      // Afficher le rapport formaté
      console.error(ErrorAnalyzer.formatReport(analysis, args.verbose || false))

      // Vérifier si l'erreur est récupérable
      if (ErrorAnalyzer.isRecoverable(err)) {
        const retryDelay = ErrorAnalyzer.getRetryDelay(err)
        UI.println(UI.Style.TEXT_WARNING + `💡 Cette erreur peut être temporaire. Vous pouvez réessayer dans ${retryDelay / 1000}s.` + UI.Style.TEXT_NORMAL)
        UI.println("")
      }

      process.exit(1)
    }
  },
})
