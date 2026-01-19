/**
 * Azure Help Command
 * Display integrated documentation for Azure deployment
 */

import type { Argv } from "yargs"
import { cmd } from "./cmd"
import { UI } from "../ui"

export const AzureHelpCommand = cmd({
  command: "aux help [topic]",
  describe: "Display Azure deployment documentation",
  builder: (yargs: Argv) => {
    return yargs
      .positional("topic", {
        describe: "Specific help topic (default: show topic list)",
        type: "string",
        choices: ["quickstart", "deploy", "status", "errors", "troubleshoot", "commands"],
        default: undefined,
      })
      .example([
        ["$0 aux help", "Show available topics"],
        ["$0 aux help quickstart", "Show quick start guide"],
        ["$0 aux help deploy", "Show deployment examples"],
        ["$0 aux help errors", "Show common errors FAQ"],
        ["$0 aux help troubleshoot", "Show troubleshooting guide"],
        ["$0 aux help commands", "Show all available commands"],
      ])
      .strict(false)
  },
  handler: async (args) => {
    const topic = args.topic

    // Display header
    UI.println("")
    UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_INFO_BOLD + "  OpenCode - Documentation Azure" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_INFO_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println("")

    if (!topic) {
      showGeneralHelp()
    } else {
      switch (topic) {
        case "quickstart":
          showQuickStart()
          break
        case "deploy":
          showDeploymentExamples()
          break
        case "status":
          showStatusHelp()
          break
        case "errors":
          showErrorsFAQ()
          break
        case "troubleshoot":
          showTroubleshooting()
          break
        case "commands":
          showCommands()
          break
        default:
          showGeneralHelp()
      }
    }

    UI.println("")
  },
})

function showGeneralHelp() {
  UI.println(UI.Style.TEXT_INFO + "📚 Bienvenue dans la documentation Azure d'OpenCode" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("OpenCode facilite le déploiement d'Azure Functions via Azure CLI.")
  UI.println("Cette documentation vous guide à travers le processus de déploiement.")
  UI.println("")

  UI.println(UI.Style.TEXT_SUCCESS + "📖 Sujets disponibles:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println(UI.Style.TEXT_INFO + "  quickstart" + UI.Style.TEXT_NORMAL + "    - Guide de démarrage rapide (5 min)")
  UI.println(UI.Style.TEXT_INFO + "  deploy" + UI.Style.TEXT_NORMAL + "        - Exemples de déploiement pas-à-pas")
  UI.println(UI.Style.TEXT_INFO + "  status" + UI.Style.TEXT_NORMAL + "        - Vérifier l'état des déploiements")
  UI.println(UI.Style.TEXT_INFO + "  errors" + UI.Style.TEXT_NORMAL + "        - FAQ sur les erreurs communes")
  UI.println(UI.Style.TEXT_INFO + "  troubleshoot" + UI.Style.TEXT_NORMAL + "  - Guide de dépannage")
  UI.println(UI.Style.TEXT_INFO + "  commands" + UI.Style.TEXT_NORMAL + "      - Liste de toutes les commandes")
  UI.println("")

  UI.println(UI.Style.TEXT_SUCCESS + "💡 Usage:" + UI.Style.TEXT_NORMAL)
  UI.println("  opencode aux help <sujet>")
  UI.println("")
  UI.println(UI.Style.TEXT_DIM + "Exemple: opencode aux help quickstart" + UI.Style.TEXT_NORMAL)
}

function showQuickStart() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "🚀 Guide de Démarrage Rapide" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("Déployez votre première Azure Function en 5 minutes !")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 1: Vérifier les prérequis" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  ✓ Azure CLI installé: az --version")
  UI.println("  ✓ Connecté à Azure: az login")
  UI.println("  ✓ OpenCode installé: opencode --version")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 2: Connexion Azure" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println(UI.Style.TEXT_DIM + "  # Si pas encore connecté" + UI.Style.TEXT_NORMAL)
  UI.println("  az login")
  UI.println("")
  UI.println(UI.Style.TEXT_DIM + "  # Lister vos abonnements" + UI.Style.TEXT_NORMAL)
  UI.println("  az account list --output table")
  UI.println("")
  UI.println(UI.Style.TEXT_DIM + "  # Sélectionner un abonnement" + UI.Style.TEXT_NORMAL)
  UI.println("  az account set --subscription <SUBSCRIPTION_ID>")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 3: Déployer en dev" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy")
  UI.println("")
  UI.println("  Cette commande va:")
  UI.println("  • Créer le resource group rg-opencode-dev")
  UI.println("  • Compiler les templates Bicep")
  UI.println("  • Déployer Function App, Storage, App Insights")
  UI.println("  • Configurer Application Insights")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 4: Vérifier le déploiement" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux status")
  UI.println("")
  UI.println("  Affiche toutes les ressources déployées.")
  UI.println("")

  UI.println(UI.Style.TEXT_SUCCESS + "🎉 C'est tout ! Votre infrastructure est déployée." + UI.Style.TEXT_NORMAL)
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Prochaines étapes:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  • Déployer en staging: opencode aux deploy staging")
  UI.println("  • Déployer en prod: opencode aux deploy prod")
  UI.println("  • Voir les logs: opencode aux status --verbose")
  UI.println("  • Aide erreurs: opencode aux help errors")
}

function showDeploymentExamples() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "📦 Exemples de Déploiement" + UI.Style.TEXT_NORMAL)
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "1. Déploiement Dev (par défaut)" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy")
  UI.println("")
  UI.println("  • Environnement: dev")
  UI.println("  • Resource Group: rg-opencode-dev")
  UI.println("  • Région: westeurope")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "2. Déploiement Staging" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy staging")
  UI.println("")
  UI.println("  • Resource Group: rg-opencode-staging")
  UI.println("  • Paramètres: templates/azure/parameters/staging.parameters.json")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "3. Déploiement Production" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy prod")
  UI.println("")
  UI.println("  • Resource Group: rg-opencode-prod")
  UI.println("  • Nécessite confirmation supplémentaire")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "4. Déploiement avec Options" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy \\")
  UI.println("    --resource-group rg-custom \\")
  UI.println("    --location eastus \\")
  UI.println("    --subscription <SUBSCRIPTION_ID> \\")
  UI.println("    --verbose")
  UI.println("")
  UI.println("  • Resource group personnalisé")
  UI.println("  • Région personnalisée")
  UI.println("  • Abonnement spécifique")
  UI.println("  • Mode verbose pour debugging")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "5. Utiliser un Template Personnalisé" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy \\")
  UI.println("    --template ./custom/main.bicep \\")
  UI.println("    --parameters ./custom/params.json")
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Tips:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  • Validez toujours en dev avant staging/prod")
  UI.println("  • Utilisez --verbose pour voir les détails")
  UI.println("  • Vérifiez le statut après déploiement")
  UI.println("  • Les templates Bicep sont dans templates/azure/")
}

function showStatusHelp() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "📊 Commande Status" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("Vérifiez l'état de vos déploiements et ressources Azure.")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Usage de Base" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux status")
  UI.println("")
  UI.println("  Affiche toutes les ressources dans rg-opencode-dev")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Resource Group Spécifique" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux status rg-opencode-prod")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Déploiement Spécifique" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux status --deployment opencode-1234567890")
  UI.println("")
  UI.println("  Affiche les détails d'un déploiement spécifique:")
  UI.println("  • État du déploiement (Succeeded, Failed, etc.)")
  UI.println("  • Date et durée")
  UI.println("  • Outputs du déploiement")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Mode Verbose" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux status --verbose")
  UI.println("")
  UI.println("  Affiche des informations supplémentaires:")
  UI.println("  • Localisation des ressources")
  UI.println("  • IDs des ressources")
  UI.println("  • Détails de configuration")
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Que vérifier:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  ✓ Function App déployée")
  UI.println("  ✓ Storage Account créé")
  UI.println("  ✓ Application Insights configuré")
  UI.println("  ✓ App Service Plan actif")
}

function showErrorsFAQ() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "❓ FAQ - Erreurs Communes" + UI.Style.TEXT_NORMAL)
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Not logged in to Azure'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Vous devez vous connecter à Azure CLI:")
  UI.println("   az login")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Permission denied' ou 'Unauthorized'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Votre compte n'a pas les droits nécessaires.")
  UI.println("   Demandez le rôle 'Contributor' sur l'abonnement.")
  UI.println("   Vérifiez avec: az role assignment list --assignee <votre-email>")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Resource name already exists'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Le nom de la ressource est déjà utilisé.")
  UI.println("   Solution 1: Changez applicationName dans parameters.json")
  UI.println("   Solution 2: Utilisez un suffixe unique (ex: -dev-2)")
  UI.println("   Solution 3: Supprimez l'ancienne ressource si inutilisée")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Quota exceeded' ou 'Rate limited'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Vous avez atteint les limites de l'abonnement.")
  UI.println("   Solution 1: Attendez quelques minutes et réessayez")
  UI.println("   Solution 2: Demandez une augmentation de quota")
  UI.println("   Solution 3: Nettoyez les ressources inutilisées")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Bicep not found' ou 'az bicep command not found'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Azure CLI Bicep n'est pas installé.")
  UI.println("   az bicep install")
  UI.println("   Puis vérifiez: az bicep version")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Deployment failed' - erreur générique" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Plusieurs causes possibles:")
  UI.println("   1. Consultez les logs: opencode aux status --deployment <nom>")
  UI.println("   2. Mode verbose: opencode aux deploy --verbose")
  UI.println("   3. Portail Azure: Resource Group > Deployments")
  UI.println("   4. Vérifiez les dépendances entre ressources")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Network error' ou 'Connection timeout'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Problème de connectivité réseau.")
  UI.println("   1. Vérifiez votre connexion Internet")
  UI.println("   2. Si proxy: configurez HTTP_PROXY et HTTPS_PROXY")
  UI.println("   3. Vérifiez le firewall")
  UI.println("   4. Consultez: https://status.azure.com")
  UI.println("")

  UI.println(UI.Style.TEXT_DANGER_BOLD + "Q: 'Template validation failed'" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("R: Erreur dans le template Bicep ou les paramètres.")
  UI.println("   1. Validez localement: az bicep build --file main.bicep")
  UI.println("   2. Vérifiez parameters.json (tous les champs requis)")
  UI.println("   3. Vérifiez les types de paramètres (string, int, bool)")
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Aide supplémentaire:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  Pour plus de détails: opencode aux help troubleshoot")
  UI.println("  ErrorAnalyzer fournit des suggestions contextuelles")
}

function showTroubleshooting() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "🔧 Guide de Dépannage" + UI.Style.TEXT_NORMAL)
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 1: Vérifier l'Authentification" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  az account show")
  UI.println("")
  UI.println("  Si erreur:")
  UI.println("  • Exécutez: az login")
  UI.println("  • Vérifiez votre abonnement: az account list")
  UI.println("  • Sélectionnez l'abonnement: az account set --subscription <ID>")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 2: Vérifier les Permissions" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  az role assignment list --assignee <votre-email>")
  UI.println("")
  UI.println("  Rôles nécessaires:")
  UI.println("  • Contributor (recommandé)")
  UI.println("  • Owner (permissions complètes)")
  UI.println("")
  UI.println("  Si permissions manquantes:")
  UI.println("  • Contactez l'administrateur Azure")
  UI.println("  • Demandez accès Contributor sur l'abonnement")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 3: Vérifier les Prérequis" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  # Azure CLI version")
  UI.println("  az --version")
  UI.println("")
  UI.println("  # Bicep installé")
  UI.println("  az bicep version")
  UI.println("")
  UI.println("  Si Bicep manquant:")
  UI.println("  az bicep install")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 4: Mode Verbose" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  opencode aux deploy --verbose")
  UI.println("")
  UI.println("  Le mode verbose affiche:")
  UI.println("  • Étapes détaillées du déploiement")
  UI.println("  • Messages de debug")
  UI.println("  • Stack traces complètes")
  UI.println("  • Détails techniques des erreurs")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 5: Consulter les Logs Azure" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  # Via CLI")
  UI.println("  az deployment group show \\")
  UI.println("    --resource-group rg-opencode-dev \\")
  UI.println("    --name <deployment-name>")
  UI.println("")
  UI.println("  # Via Portail")
  UI.println("  1. Ouvrir le portail Azure")
  UI.println("  2. Naviguer vers Resource Group")
  UI.println("  3. Cliquer sur 'Deployments'")
  UI.println("  4. Voir les détails de l'échec")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Étape 6: Nettoyer et Réessayer" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  # Supprimer déploiement échoué")
  UI.println("  az deployment group delete \\")
  UI.println("    --resource-group rg-opencode-dev \\")
  UI.println("    --name <deployment-name>")
  UI.println("")
  UI.println("  # Réessayer le déploiement")
  UI.println("  opencode aux deploy")
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Checklist Complète:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  □ Azure CLI installé et à jour")
  UI.println("  □ Bicep installé (az bicep install)")
  UI.println("  □ Connecté à Azure (az login)")
  UI.println("  □ Abonnement sélectionné")
  UI.println("  □ Permissions Contributor")
  UI.println("  □ Templates Bicep valides")
  UI.println("  □ Paramètres corrects")
  UI.println("  □ Noms de ressources uniques")
  UI.println("  □ Quota disponible")
  UI.println("  □ Connexion réseau stable")
  UI.println("")

  UI.println(UI.Style.TEXT_SUCCESS + "📞 Support:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  Si problème persiste:")
  UI.println("  • Consultez les logs détaillés (--verbose)")
  UI.println("  • Vérifiez Azure Status: https://status.azure.com")
  UI.println("  • Consultez la FAQ: opencode aux help errors")
  UI.println("  • Contactez le support Azure si nécessaire")
}

function showCommands() {
  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "📋 Commandes Disponibles" + UI.Style.TEXT_NORMAL)
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Commandes de Déploiement" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println(UI.Style.TEXT_SUCCESS + "  opencode aux deploy [environment]" + UI.Style.TEXT_NORMAL)
  UI.println("    Déploie l'infrastructure Azure Functions")
  UI.println("")
  UI.println("    Arguments:")
  UI.println("      environment       dev, staging ou prod (défaut: dev)")
  UI.println("")
  UI.println("    Options:")
  UI.println("      -s, --subscription     Subscription ID Azure")
  UI.println("      -g, --resource-group   Nom du resource group")
  UI.println("      -l, --location         Région Azure (défaut: westeurope)")
  UI.println("      -t, --template         Chemin vers le template Bicep")
  UI.println("      -p, --parameters       Chemin vers les paramètres")
  UI.println("      -v, --verbose          Mode verbose")
  UI.println("      --skip-validation      Skip validation des permissions")
  UI.println("")
  UI.println("    Exemples:")
  UI.println("      opencode aux deploy")
  UI.println("      opencode aux deploy prod --verbose")
  UI.println("      opencode aux deploy --resource-group rg-custom")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Commandes de Status" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println(UI.Style.TEXT_SUCCESS + "  opencode aux status [resource-group]" + UI.Style.TEXT_NORMAL)
  UI.println("    Vérifie l'état des déploiements et ressources")
  UI.println("")
  UI.println("    Arguments:")
  UI.println("      resource-group    Nom du resource group (optionnel)")
  UI.println("")
  UI.println("    Options:")
  UI.println("      -s, --subscription    Subscription ID Azure")
  UI.println("      -d, --deployment      Nom du déploiement spécifique")
  UI.println("      -v, --verbose         Mode verbose")
  UI.println("")
  UI.println("    Exemples:")
  UI.println("      opencode aux status")
  UI.println("      opencode aux status rg-opencode-prod")
  UI.println("      opencode aux status --deployment opencode-123456")
  UI.println("")

  UI.println(UI.Style.TEXT_INFO_BOLD + "Commandes de Documentation" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println(UI.Style.TEXT_SUCCESS + "  opencode aux help [topic]" + UI.Style.TEXT_NORMAL)
  UI.println("    Affiche la documentation intégrée")
  UI.println("")
  UI.println("    Sujets disponibles:")
  UI.println("      quickstart        Guide de démarrage rapide")
  UI.println("      deploy            Exemples de déploiement")
  UI.println("      status            Aide sur la commande status")
  UI.println("      errors            FAQ erreurs communes")
  UI.println("      troubleshoot      Guide de dépannage")
  UI.println("      commands          Cette liste de commandes")
  UI.println("")
  UI.println("    Exemples:")
  UI.println("      opencode aux help")
  UI.println("      opencode aux help quickstart")
  UI.println("      opencode aux help errors")
  UI.println("")

  UI.println(UI.Style.TEXT_WARNING + "💡 Tips:" + UI.Style.TEXT_NORMAL)
  UI.println("")
  UI.println("  • Utilisez --verbose pour plus de détails")
  UI.println("  • Consultez aux help errors pour erreurs communes")
  UI.println("  • Toutes les commandes supportent --help")
  UI.println("")
  UI.println("    Exemple: opencode aux deploy --help")
}
