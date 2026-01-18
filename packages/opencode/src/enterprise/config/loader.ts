/**
 * Enterprise Configuration Loader
 *
 * Charge et expose la configuration entreprise définie dans /config/enterprise-config.json
 * Fournit accès aux modèles IA configurés pour "Aux petits Oignons"
 */

import { readFileSync, existsSync } from "fs"
import path from "path"
import { Log } from "@/util/log"

const log = Log.create({ service: "enterprise-config" })

/**
 * Structure d'un modèle IA dans la config entreprise
 */
export interface EnterpriseAIModel {
  id: string
  name: string
  provider: string
  default: boolean
  enabled: boolean
  azureDeployment?: string
  azureEndpoint?: string
}

/**
 * Structure complète de la config entreprise
 */
export interface EnterpriseConfig {
  version: string
  projectName: string
  description: string
  azure: {
    namingConventions: {
      prefix: string
      separator: string
      resourceGroupFormat: string
    }
    mandatoryTags: Record<string, string>
    defaultRegion: string
  }
  aiModels: EnterpriseAIModel[]
  deployment: {
    templates: {
      bicep: string
      functions: string
    }
    defaultEnvironment: string
  }
  ui: {
    branding: {
      appName: string
      tagline: string
    }
    features: Record<string, boolean>
  }
  locked: boolean
}

let cachedConfig: EnterpriseConfig | null = null

/**
 * Charge la configuration entreprise depuis /config/enterprise-config.json
 */
export function loadEnterpriseConfig(): EnterpriseConfig | null {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    // Chercher le fichier de config à la racine du projet
    // On remonte depuis packages/opencode/src/enterprise/config jusqu'à la racine
    const configPath = path.resolve(__dirname, "../../../../../config/enterprise-config.json")

    if (!existsSync(configPath)) {
      log.warn("Fichier enterprise-config.json introuvable", { path: configPath })
      return null
    }

    const content = readFileSync(configPath, "utf-8")
    const config = JSON.parse(content) as EnterpriseConfig

    // Validation basique
    if (!config.aiModels || !Array.isArray(config.aiModels)) {
      log.error("Configuration enterprise invalide: aiModels manquant ou invalide")
      return null
    }

    // Afficher un avertissement si la configuration est verrouillée
    if (config.locked) {
      log.warn("⚠️  Configuration entreprise VERROUILLÉE", {
        projectName: config.projectName,
        message:
          "Cette configuration ne peut être modifiée que par l'équipe technique. Toute tentative de modification sera ignorée.",
      })
    }

    log.info("Configuration entreprise chargée avec succès", {
      projectName: config.projectName,
      modelsCount: config.aiModels.length,
      locked: config.locked,
    })

    cachedConfig = config
    return config
  } catch (error) {
    log.error("Erreur lors du chargement de la config entreprise", { error })
    return null
  }
}

/**
 * Récupère tous les modèles IA configurés et activés
 */
export function getEnabledAIModels(): EnterpriseAIModel[] {
  const config = loadEnterpriseConfig()
  if (!config) return []

  return config.aiModels.filter((model) => model.enabled)
}

/**
 * Récupère le modèle par défaut
 */
export function getDefaultAIModel(): EnterpriseAIModel | null {
  const config = loadEnterpriseConfig()
  if (!config) return null

  const defaultModel = config.aiModels.find((model) => model.default && model.enabled)
  return defaultModel || null
}

/**
 * Récupère un modèle spécifique par son ID
 */
export function getAIModelById(id: string): EnterpriseAIModel | null {
  const config = loadEnterpriseConfig()
  if (!config) return null

  const model = config.aiModels.find((m) => m.id === id && m.enabled)
  return model || null
}

/**
 * Vérifie si la configuration est verrouillée (non modifiable)
 */
export function isConfigLocked(): boolean {
  const config = loadEnterpriseConfig()
  return config?.locked ?? false
}

/**
 * Récupère la configuration Azure
 */
export function getAzureConfig() {
  const config = loadEnterpriseConfig()
  return config?.azure || null
}

/**
 * Clear le cache de configuration (utile pour les tests)
 */
export function clearConfigCache() {
  cachedConfig = null
}

/**
 * Vérifie si une modification de la configuration est autorisée
 * Retourne une erreur si la configuration est verrouillée
 */
export function assertConfigNotLocked(): {
  allowed: boolean
  error?: string
} {
  const config = loadEnterpriseConfig()

  if (!config) {
    return {
      allowed: false,
      error: "Configuration enterprise non disponible",
    }
  }

  if (config.locked) {
    return {
      allowed: false,
      error:
        "⚠️  CONFIGURATION VERROUILLÉE: Cette configuration ne peut être modifiée que par l'équipe technique. " +
        "Les consultants ne sont pas autorisés à modifier enterprise-config.json. " +
        "Si vous avez besoin de changements, contactez l'équipe technique.",
    }
  }

  return { allowed: true }
}

/**
 * Retourne un message d'information sur le verrouillage
 */
export function getConfigLockInfo(): string {
  const config = loadEnterpriseConfig()

  if (!config) {
    return "Configuration non disponible"
  }

  if (config.locked) {
    return `Configuration "${config.projectName}" est VERROUILLÉE.\n\n` +
      `Modifications interdites pour garantir:\n` +
      `- Conformité avec les naming conventions Azure\n` +
      `- Application des tags obligatoires\n` +
      `- Respect des security settings\n` +
      `- Utilisation des resource groups autorisés\n\n` +
      `Contact: Équipe technique pour toute modification`
  }

  return `Configuration "${config.projectName}" est modifiable`
}
