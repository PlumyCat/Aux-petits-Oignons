/**
 * Azure Provider Integration for Enterprise Models
 *
 * Configure et expose les modèles Azure OpenAI définis dans enterprise-config.json
 * pour utilisation avec @ai-sdk/azure
 */

import { createAzure } from "@ai-sdk/azure"
import { loadEnterpriseConfig, EnterpriseAIModel } from "../config/loader"
import { Log } from "@/util/log"

const log = Log.create({ service: "enterprise-azure-provider" })

/**
 * Configuration pour un provider Azure
 */
export interface AzureProviderConfig {
	modelId: string
	modelName: string
	endpoint: string
	deployment: string
	apiKey: string
}

/**
 * Résout les variables d'environnement dans une chaîne
 */
function resolveEnvVars(value: string): string {
	return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
		const envValue = process.env[envVar]
		if (!envValue) {
			log.warn(`Variable d'environnement manquante: ${envVar}`)
			return value // Retourne la chaîne originale si la variable n'existe pas
		}
		return envValue
	})
}

/**
 * Récupère les modèles Azure configurés dans enterprise-config.json
 */
export function getAzureModels(): EnterpriseAIModel[] {
	const config = loadEnterpriseConfig()
	if (!config) return []

	return config.aiModels.filter((model) => model.provider === "azure" && model.enabled)
}

/**
 * Crée une configuration de provider Azure pour un modèle
 */
export function createAzureProviderConfig(model: EnterpriseAIModel): AzureProviderConfig | null {
	if (!model.azureEndpoint || !model.azureDeployment) {
		log.error(`Modèle Azure mal configuré: ${model.id}`, {
			hasEndpoint: !!model.azureEndpoint,
			hasDeployment: !!model.azureDeployment,
		})
		return null
	}

	// Résoudre les variables d'environnement dans l'endpoint
	const endpoint = resolveEnvVars(model.azureEndpoint)

	// Récupérer la clé API depuis les variables d'environnement
	// Convention: AZURE_API_KEY ou AZURE_OPENAI_API_KEY
	const apiKey = process.env.AZURE_API_KEY || process.env.AZURE_OPENAI_API_KEY || ""

	if (!apiKey) {
		log.warn(`Clé API Azure manquante pour le modèle ${model.id}`)
	}

	return {
		modelId: model.id,
		modelName: model.name,
		endpoint,
		deployment: model.azureDeployment,
		apiKey,
	}
}

/**
 * Crée une instance de provider Azure pour un modèle
 */
export function createEnterpriseAzureProvider(model: EnterpriseAIModel) {
	const config = createAzureProviderConfig(model)
	if (!config) {
		log.error(`Impossible de créer le provider Azure pour ${model.id}`)
		return null
	}

	try {
		const azure = createAzure({
			resourceName: config.endpoint.replace(/^https?:\/\//, "").split(".")[0],
			apiKey: config.apiKey,
		})

		log.info(`Provider Azure créé pour ${model.id}`, {
			deployment: config.deployment,
			endpoint: config.endpoint,
		})

		// Retourne le modèle configuré
		return azure(config.deployment)
	} catch (error) {
		log.error(`Erreur lors de la création du provider Azure pour ${model.id}`, { error })
		return null
	}
}

/**
 * Crée tous les providers Azure configurés dans enterprise-config
 * Retourne une map [modelId -> provider instance]
 */
export function createAllEnterpriseAzureProviders(): Map<string, any> {
	const azureModels = getAzureModels()
	const providers = new Map<string, any>()

	for (const model of azureModels) {
		const provider = createEnterpriseAzureProvider(model)
		if (provider) {
			providers.set(model.id, provider)
			log.info(`Provider enregistré: ${model.id} → ${model.name}`)
		}
	}

	log.info(`Total providers Azure créés: ${providers.size}/${azureModels.length}`)
	return providers
}

/**
 * Valide qu'un modèle Azure est correctement configuré
 */
export function validateAzureModel(model: EnterpriseAIModel): {
	valid: boolean
	errors: string[]
} {
	const errors: string[] = []

	if (model.provider !== "azure") {
		errors.push(`Provider incorrect: ${model.provider} (attendu: azure)`)
	}

	if (!model.azureEndpoint) {
		errors.push("azureEndpoint manquant")
	}

	if (!model.azureDeployment) {
		errors.push("azureDeployment manquant")
	}

	if (model.azureEndpoint) {
		const endpoint = resolveEnvVars(model.azureEndpoint)
		if (endpoint.includes("${")) {
			errors.push(`Variable d'environnement non résolue dans azureEndpoint: ${model.azureEndpoint}`)
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

/**
 * Valide tous les modèles Azure configurés
 */
export function validateAllAzureModels(): {
	valid: boolean
	results: Array<{ modelId: string; modelName: string; valid: boolean; errors: string[] }>
} {
	const azureModels = getAzureModels()
	const results = azureModels.map((model) => ({
		modelId: model.id,
		modelName: model.name,
		...validateAzureModel(model),
	}))

	const allValid = results.every((r) => r.valid)

	if (!allValid) {
		log.warn("Validation des modèles Azure échouée", { results })
	} else {
		log.info(`Tous les modèles Azure validés: ${results.length}`)
	}

	return {
		valid: allValid,
		results,
	}
}
