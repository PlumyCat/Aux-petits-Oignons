/**
 * Azure Error Analyzer
 * Détection et diagnostic automatique des erreurs Azure avec suggestions contextuelles
 */

export interface ErrorAnalysis {
  errorType: ErrorType
  severity: ErrorSeverity
  title: string
  description: string
  suggestions: string[]
  documentationLinks: string[]
  technicalDetails?: string
}

export enum ErrorType {
  AUTHENTICATION = "authentication",
  PERMISSIONS = "permissions",
  RESOURCE_NOT_FOUND = "resource_not_found",
  RESOURCE_CONFLICT = "resource_conflict",
  QUOTA_EXCEEDED = "quota_exceeded",
  INVALID_TEMPLATE = "invalid_template",
  DEPLOYMENT_FAILED = "deployment_failed",
  NETWORK_ERROR = "network_error",
  BICEP_COMPILATION = "bicep_compilation",
  CONFIGURATION_ERROR = "configuration_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export enum ErrorSeverity {
  CRITICAL = "critical", // Bloque complètement le déploiement
  ERROR = "error", // Erreur importante mais peut être contournée
  WARNING = "warning", // Attention, potentiel problème
  INFO = "info", // Information utile
}

/**
 * Catalogue des erreurs communes Azure avec leurs diagnostics
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp
  type: ErrorType
  severity: ErrorSeverity
  title: string
  description: string
  suggestions: string[]
  docs: string[]
}> = [
  // Erreurs d'authentification
  {
    pattern: /not logged in|authentication|az login|no subscriptions found/i,
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.CRITICAL,
    title: "Erreur d'authentification Azure",
    description:
      "Vous n'êtes pas connecté à Azure CLI ou votre session a expiré. L'authentification est requise pour toutes les opérations Azure.",
    suggestions: [
      "Exécutez 'az login' dans votre terminal pour vous connecter à Azure",
      "Si vous utilisez plusieurs comptes, sélectionnez le bon abonnement avec 'az account set --subscription <ID>'",
      "Vérifiez que votre session n'a pas expiré (connectez-vous à nouveau si nécessaire)",
      "Si vous êtes derrière un proxy, configurez les variables d'environnement HTTP_PROXY et HTTPS_PROXY",
    ],
    docs: [
      "https://docs.microsoft.com/cli/azure/authenticate-azure-cli",
      "https://docs.microsoft.com/cli/azure/manage-azure-subscriptions-azure-cli",
    ],
  },

  // Erreurs de permissions
  {
    pattern:
      /permission|unauthorized|forbidden|access denied|authorization failed|does not have (authorization|permission)/i,
    type: ErrorType.PERMISSIONS,
    severity: ErrorSeverity.CRITICAL,
    title: "Permissions insuffisantes",
    description:
      "Vous n'avez pas les permissions nécessaires pour effectuer cette opération sur le resource group ou l'abonnement Azure.",
    suggestions: [
      "Vérifiez vos permissions avec: az role assignment list --resource-group <nom>",
      "Vous devez avoir au minimum le rôle 'Contributor' sur le resource group",
      "Contactez votre administrateur Azure pour obtenir les permissions nécessaires",
      "Si vous avez plusieurs abonnements, vérifiez que vous utilisez le bon: az account show",
      "Attendez quelques minutes si les permissions viennent d'être ajoutées (propagation peut prendre du temps)",
    ],
    docs: [
      "https://docs.microsoft.com/azure/role-based-access-control/overview",
      "https://docs.microsoft.com/azure/role-based-access-control/troubleshooting",
    ],
  },

  // Erreurs de quotas
  {
    pattern: /quota|limit exceeded|too many|maximum.*exceeded|throttl/i,
    type: ErrorType.QUOTA_EXCEEDED,
    severity: ErrorSeverity.ERROR,
    title: "Quota ou limite Azure dépassée",
    description:
      "Vous avez atteint une limite de quota Azure (nombre de ressources, CPU, mémoire, etc.) ou vous êtes temporairement throttlé.",
    suggestions: [
      "Vérifiez vos quotas actuels: az vm list-usage --location <région> --output table",
      "Nettoyez les ressources inutilisées pour libérer de l'espace",
      "Demandez une augmentation de quota via le portail Azure (Support > Nouvelle demande)",
      "Si throttlé, attendez quelques minutes avant de réessayer",
      "Considérez d'utiliser une autre région Azure si celle-ci est saturée",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits",
      "https://docs.microsoft.com/azure/azure-resource-manager/management/request-limits-and-throttling",
    ],
  },

  // Erreurs de compilation Bicep (DOIT être avant RESOURCE_NOT_FOUND pour éviter les faux positifs)
  {
    pattern: /az bicep.*not found|bicep.*not found|bicep cli.*not found|command.*bicep.*not found/i,
    type: ErrorType.BICEP_COMPILATION,
    severity: ErrorSeverity.CRITICAL,
    title: "Erreur de compilation Bicep",
    description:
      "Azure CLI Bicep n'est pas installé ou n'est pas accessible. La compilation des templates Bicep nécessite Azure CLI avec Bicep.",
    suggestions: [
      "Installez Azure CLI Bicep: az bicep install",
      "Mettez à jour Azure CLI vers la dernière version: az upgrade",
      "Vérifiez l'installation: az bicep version",
      "Si Bicep est installé mais ne fonctionne pas, réinstallez-le: az bicep uninstall && az bicep install",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/bicep/install",
      "https://docs.microsoft.com/cli/azure/install-azure-cli",
    ],
  },

  // Erreurs de conflit de ressources
  {
    pattern: /already exists|conflict|duplicate|name.*not available|name.*already.*taken/i,
    type: ErrorType.RESOURCE_CONFLICT,
    severity: ErrorSeverity.ERROR,
    title: "Conflit de nom de ressource",
    description:
      "Une ressource avec ce nom existe déjà dans Azure. Les noms de certaines ressources (Storage Account, Function App) doivent être globalement uniques.",
    suggestions: [
      "Changez le paramètre 'applicationName' dans votre fichier de paramètres pour utiliser un nom unique",
      "Ajoutez un suffixe unique (ex: -dev, -prod, ou un timestamp) au nom de l'application",
      "Vérifiez si la ressource existe déjà et si vous pouvez la réutiliser",
      "Supprimez l'ancienne ressource si elle n'est plus utilisée: az resource delete --ids <resource-id>",
      "Pour Storage Accounts, le nom doit être unique globalement et faire 3-24 caractères (lettres minuscules et chiffres uniquement)",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/management/resource-name-rules",
      "https://docs.microsoft.com/azure/storage/common/storage-account-overview#storage-account-name",
    ],
  },

  // Erreurs de ressource introuvable
  {
    pattern: /not found|does not exist|could not be found|resource.*not found/i,
    type: ErrorType.RESOURCE_NOT_FOUND,
    severity: ErrorSeverity.ERROR,
    title: "Ressource Azure introuvable",
    description:
      "La ressource Azure spécifiée n'existe pas ou n'est pas accessible dans votre abonnement.",
    suggestions: [
      "Vérifiez que le nom du resource group est correct",
      "Vérifiez que vous êtes dans le bon abonnement: az account show",
      "Vérifiez que le nom de la ressource n'a pas de fautes de frappe",
      "Listez les ressources disponibles: az resource list --output table",
      "Créez d'abord le resource group si nécessaire: opencode aux deploy",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/management/manage-resource-groups-portal",
    ],
  },

  // Erreurs de template Bicep
  {
    pattern:
      /bicep.*error|template.*invalid|validation.*failed|deployment.*validation|parameter.*required|parameter.*invalid/i,
    type: ErrorType.INVALID_TEMPLATE,
    severity: ErrorSeverity.ERROR,
    title: "Erreur de validation du template Bicep",
    description:
      "Le template Bicep contient des erreurs de syntaxe ou de validation, ou des paramètres requis sont manquants/invalides.",
    suggestions: [
      "Vérifiez la syntaxe Bicep localement: az bicep build --file <template>",
      "Assurez-vous que tous les paramètres requis sont fournis dans le fichier parameters.json",
      "Vérifiez que les types de paramètres correspondent (string, int, bool, etc.)",
      "Consultez les messages d'erreur détaillés pour identifier le problème exact",
      "Validez le template avant déploiement: az deployment group validate",
      "Si vous avez modifié les templates, assurez-vous que la syntaxe Bicep est correcte",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/bicep/overview",
      "https://docs.microsoft.com/azure/azure-resource-manager/bicep/file",
    ],
  },

  // Erreurs de déploiement
  {
    pattern: /deployment.*failed|provisioning.*failed|operation.*failed/i,
    type: ErrorType.DEPLOYMENT_FAILED,
    severity: ErrorSeverity.ERROR,
    title: "Échec du déploiement Azure",
    description:
      "Le déploiement des ressources Azure a échoué. Cela peut être dû à des problèmes de configuration, de dépendances, ou de ressources.",
    suggestions: [
      "Consultez les logs détaillés du déploiement dans le portail Azure",
      "Vérifiez l'état du déploiement: opencode aux status --deployment <nom>",
      "Consultez les logs détaillés avec le mode verbose: opencode aux deploy --verbose",
      "Vérifiez que toutes les dépendances entre ressources sont correctes",
      "Si le problème persiste, supprimez le déploiement échoué et réessayez",
      "Vérifiez les événements du resource group dans le portail Azure",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/troubleshooting/common-deployment-errors",
    ],
  },

  // Erreurs réseau
  {
    pattern: /network|connection|timeout|unreachable|dns|resolve/i,
    type: ErrorType.NETWORK_ERROR,
    severity: ErrorSeverity.ERROR,
    title: "Erreur de connexion réseau",
    description:
      "Impossible de se connecter aux services Azure. Cela peut être dû à un problème de réseau, de proxy, ou de connectivité Internet.",
    suggestions: [
      "Vérifiez votre connexion Internet",
      "Si vous êtes derrière un proxy, configurez les variables d'environnement: HTTP_PROXY et HTTPS_PROXY",
      "Vérifiez que les URLs Azure ne sont pas bloquées par un firewall",
      "Testez la connectivité: ping management.azure.com",
      "Réessayez dans quelques minutes si le problème est temporaire",
      "Vérifiez l'état des services Azure: https://status.azure.com",
    ],
    docs: [
      "https://docs.microsoft.com/azure/vpn-gateway/vpn-gateway-troubleshoot",
      "https://status.azure.com",
    ],
  },

  // Erreurs de timeout
  {
    pattern: /timeout|timed out|took too long/i,
    type: ErrorType.TIMEOUT,
    severity: ErrorSeverity.WARNING,
    title: "Timeout lors de l'opération",
    description:
      "L'opération Azure a pris trop de temps et a expiré. Cela peut arriver lors de déploiements complexes ou de problèmes de performance Azure.",
    suggestions: [
      "Réessayez l'opération - elle peut avoir partiellement réussi",
      "Vérifiez l'état des ressources: opencode aux status",
      "Divisez les déploiements complexes en plusieurs étapes plus petites",
      "Si les timeouts persistent, vérifiez l'état des services Azure: https://status.azure.com",
      "Augmentez le timeout si possible (certaines opérations prennent simplement du temps)",
    ],
    docs: ["https://status.azure.com"],
  },

  // Erreurs de configuration
  {
    pattern: /configuration|invalid.*parameter|missing.*parameter|required.*parameter/i,
    type: ErrorType.CONFIGURATION_ERROR,
    severity: ErrorSeverity.ERROR,
    title: "Erreur de configuration",
    description:
      "Un paramètre de configuration est manquant, invalide ou mal formaté. Vérifiez vos fichiers de paramètres et vos arguments de ligne de commande.",
    suggestions: [
      "Vérifiez votre fichier de paramètres (parameters.dev.json, etc.)",
      "Assurez-vous que tous les paramètres requis sont fournis",
      "Vérifiez le format des valeurs (ex: location doit être une région Azure valide)",
      "Consultez la documentation du template pour voir les paramètres requis",
      "Utilisez --verbose pour voir les détails de configuration",
    ],
    docs: [
      "https://docs.microsoft.com/azure/azure-resource-manager/templates/template-tutorial-use-parameter-file",
    ],
  },
]

/**
 * Classe principale d'analyse d'erreurs
 */
export class ErrorAnalyzer {
  /**
   * Analyse une erreur et retourne un diagnostic complet
   */
  static analyze(error: Error): ErrorAnalysis {
    const errorMessage = error.message
    const errorStack = error.stack || ""
    const fullText = `${errorMessage} ${errorStack}`.toLowerCase()

    // Recherche du pattern d'erreur correspondant
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(fullText)) {
        return {
          errorType: pattern.type,
          severity: pattern.severity,
          title: pattern.title,
          description: pattern.description,
          suggestions: pattern.suggestions,
          documentationLinks: pattern.docs,
          technicalDetails: this.extractTechnicalDetails(error),
        }
      }
    }

    // Erreur inconnue - analyse générique
    return this.createGenericAnalysis(error)
  }

  /**
   * Analyse multiple erreurs et retourne la plus critique
   */
  static analyzeMultiple(errors: Error[]): ErrorAnalysis[] {
    return errors.map((error) => this.analyze(error)).sort((a, b) => {
      const severityOrder = {
        critical: 0,
        error: 1,
        warning: 2,
        info: 3,
      }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  /**
   * Extrait les détails techniques pertinents d'une erreur
   */
  private static extractTechnicalDetails(error: Error): string {
    const details: string[] = []

    // Nom de l'erreur
    if (error.name && error.name !== "Error") {
      details.push(`Type: ${error.name}`)
    }

    // Code d'erreur si disponible
    if ((error as any).code) {
      details.push(`Code: ${(error as any).code}`)
    }

    // Status code HTTP si disponible
    if ((error as any).statusCode) {
      details.push(`Status HTTP: ${(error as any).statusCode}`)
    }

    // Request ID Azure si disponible
    if ((error as any).requestId) {
      details.push(`Request ID: ${(error as any).requestId}`)
    }

    return details.length > 0 ? details.join(" | ") : error.message
  }

  /**
   * Crée une analyse générique pour les erreurs inconnues
   */
  private static createGenericAnalysis(error: Error): ErrorAnalysis {
    return {
      errorType: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      title: "Erreur inattendue",
      description:
        "Une erreur inattendue s'est produite. Consultez les détails techniques ci-dessous pour plus d'informations.",
      suggestions: [
        "Vérifiez les détails techniques de l'erreur ci-dessous",
        "Consultez les logs complets avec --verbose pour plus d'informations",
        "Vérifiez l'état de vos ressources Azure: opencode aux status",
        "Si le problème persiste, consultez la documentation Azure ou contactez le support",
        "Essayez de réexécuter la commande - certaines erreurs sont temporaires",
      ],
      documentationLinks: [
        "https://docs.microsoft.com/azure/azure-resource-manager/troubleshooting/overview",
        "https://docs.microsoft.com/azure/azure-functions/functions-diagnostics",
      ],
      technicalDetails: this.extractTechnicalDetails(error),
    }
  }

  /**
   * Génère un rapport d'erreur formaté pour l'affichage
   */
  static formatReport(analysis: ErrorAnalysis, verbose: boolean = false): string {
    const lines: string[] = []

    // Titre avec sévérité
    const severityIcon = {
      critical: "🔴",
      error: "🟠",
      warning: "🟡",
      info: "🔵",
    }[analysis.severity]

    lines.push(`${severityIcon} ${analysis.title}`)
    lines.push("")

    // Description
    lines.push(analysis.description)
    lines.push("")

    // Suggestions
    if (analysis.suggestions.length > 0) {
      lines.push("💡 Solutions suggérées:")
      analysis.suggestions.forEach((suggestion, index) => {
        lines.push(`   ${index + 1}. ${suggestion}`)
      })
      lines.push("")
    }

    // Liens documentation
    if (analysis.documentationLinks.length > 0) {
      lines.push("📚 Documentation:")
      analysis.documentationLinks.forEach((link) => {
        lines.push(`   • ${link}`)
      })
      lines.push("")
    }

    // Détails techniques (mode verbose)
    if (verbose && analysis.technicalDetails) {
      lines.push("🔧 Détails techniques:")
      lines.push(`   ${analysis.technicalDetails}`)
      lines.push("")
    }

    return lines.join("\n")
  }

  /**
   * Vérifie si une erreur est récupérable (retry possible)
   */
  static isRecoverable(error: Error): boolean {
    const analysis = this.analyze(error)

    // Erreurs récupérables
    const recoverableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT,
      ErrorType.QUOTA_EXCEEDED, // Peut être récupéré après attente ou nettoyage
    ]

    return recoverableTypes.includes(analysis.errorType)
  }

  /**
   * Obtient le délai de retry recommandé pour une erreur
   */
  static getRetryDelay(error: Error): number {
    const analysis = this.analyze(error)

    switch (analysis.errorType) {
      case ErrorType.TIMEOUT:
        return 5000 // 5 secondes
      case ErrorType.NETWORK_ERROR:
        return 3000 // 3 secondes
      case ErrorType.QUOTA_EXCEEDED:
        return 60000 // 1 minute
      default:
        return 0 // Pas de retry
    }
  }
}
