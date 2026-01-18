/**
 * Enterprise Models Registry
 *
 * Point d'entrée principal pour accéder aux modèles IA configurés dans enterprise-config.json
 * Supporte les providers Azure (OpenAI) et Anthropic (Claude)
 */

import { createAnthropic } from "@ai-sdk/anthropic"
import {
	loadEnterpriseConfig,
	getEnabledAIModels,
	getDefaultAIModel,
	getAIModelById as getConfigModelById,
	type EnterpriseAIModel,
} from "../config/loader"
import {
	createEnterpriseAzureProvider,
	validateAzureModel,
	validateAllAzureModels,
} from "./azure-provider"
import { Log } from "@/util/log"

const log = Log.create({ service: "enterprise-models" })

/**
 * Instance de modèle IA prête à utiliser
 */
export interface EnterpriseModelInstance {
	id: string
	name: string
	provider: string
	isDefault: boolean
	model: any // Instance du modèle AI SDK
}

/**
 * Cache des instances de modèles créées
 */
let modelInstancesCache: Map<string, EnterpriseModelInstance> | null = null

/**
 * Crée une instance de modèle Anthropic (via Azure AI Foundry)
 */
function createAnthropicModel(model: EnterpriseAIModel): any {
	try {
		const apiKey = process.env.ANTHROPIC_API_KEY || ""
		if (!apiKey) {
			log.warn(`Clé API Anthropic manquante pour ${model.id}`)
		}

		// Récupérer le baseURL depuis ANTHROPIC_BASE_URL (Azure AI Foundry endpoint)
		const baseURL = model.azureEndpoint
			? resolveEnvVars(model.azureEndpoint)
			: process.env.ANTHROPIC_BASE_URL

		if (!baseURL) {
			log.warn(`ANTHROPIC_BASE_URL manquante pour ${model.id}, utilisation de l'API Anthropic par défaut`)
		}

		const anthropic = createAnthropic({
			apiKey,
			baseURL, // Pointe vers Azure AI Foundry si configuré
		})

		// Utiliser le nom de déploiement configuré ou le nom par défaut
		const modelName = model.azureDeployment || "claude-sonnet-4-5-20241022"

		log.info(`Provider Anthropic créé pour ${model.id}`, {
			modelName,
			baseURL: baseURL || "default",
		})

		return anthropic(modelName)
	} catch (error) {
		log.error(`Erreur lors de la création du provider Anthropic pour ${model.id}`, { error })
		return null
	}
}

/**
 * Résout les variables d'environnement dans une chaîne
 */
function resolveEnvVars(value: string): string {
	return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
		const envValue = process.env[envVar]
		if (!envValue) {
			log.warn(`Variable d'environnement manquante: ${envVar}`)
			return value
		}
		return envValue
	})
}

/**
 * Crée une instance de modèle selon son provider
 */
function createModelInstance(model: EnterpriseAIModel): EnterpriseModelInstance | null {
	let modelInstance: any = null

	switch (model.provider) {
		case "azure":
			modelInstance = createEnterpriseAzureProvider(model)
			break

		case "anthropic":
			modelInstance = createAnthropicModel(model)
			break

		default:
			log.error(`Provider non supporté: ${model.provider} pour le modèle ${model.id}`)
			return null
	}

	if (!modelInstance) {
		log.error(`Échec de création du modèle ${model.id}`)
		return null
	}

	return {
		id: model.id,
		name: model.name,
		provider: model.provider,
		isDefault: model.default,
		model: modelInstance,
	}
}

/**
 * Initialise toutes les instances de modèles depuis enterprise-config
 */
function initializeModelInstances(): Map<string, EnterpriseModelInstance> {
	if (modelInstancesCache) {
		return modelInstancesCache
	}

	const instances = new Map<string, EnterpriseModelInstance>()
	const enabledModels = getEnabledAIModels()

	log.info(`Initialisation de ${enabledModels.length} modèles enterprise`)

	for (const model of enabledModels) {
		const instance = createModelInstance(model)
		if (instance) {
			instances.set(model.id, instance)
			log.info(`Modèle enregistré: ${model.id} → ${model.name} (${model.provider})`)
		}
	}

	log.info(`Total modèles initialisés: ${instances.size}/${enabledModels.length}`)

	modelInstancesCache = instances
	return instances
}

/**
 * Récupère l'instance d'un modèle par son ID
 */
export function getEnterpriseModel(modelId: string): EnterpriseModelInstance | null {
	const instances = initializeModelInstances()
	const instance = instances.get(modelId)

	if (!instance) {
		log.warn(`Modèle enterprise non trouvé: ${modelId}`)
		return null
	}

	return instance
}

/**
 * Récupère le modèle par défaut
 */
export function getDefaultEnterpriseModel(): EnterpriseModelInstance | null {
	const instances = initializeModelInstances()

	for (const instance of instances.values()) {
		if (instance.isDefault) {
			log.info(`Modèle par défaut: ${instance.id}`)
			return instance
		}
	}

	log.warn("Aucun modèle par défaut configuré")
	return null
}

/**
 * Liste tous les modèles enterprise disponibles
 */
export function listEnterpriseModels(): EnterpriseModelInstance[] {
	const instances = initializeModelInstances()
	return Array.from(instances.values())
}

/**
 * Récupère les métadonnées d'un modèle (sans l'instance)
 */
export function getEnterpriseModelMetadata(
	modelId: string,
): Pick<EnterpriseAIModel, "id" | "name" | "provider" | "default" | "enabled"> | null {
	const model = getConfigModelById(modelId)
	if (!model) return null

	return {
		id: model.id,
		name: model.name,
		provider: model.provider,
		default: model.default,
		enabled: model.enabled,
	}
}

/**
 * Liste les métadonnées de tous les modèles disponibles
 */
export function listEnterpriseModelsMetadata(): Array<
	Pick<EnterpriseAIModel, "id" | "name" | "provider" | "default" | "enabled">
> {
	const enabledModels = getEnabledAIModels()
	return enabledModels.map((m) => ({
		id: m.id,
		name: m.name,
		provider: m.provider,
		default: m.default,
		enabled: m.enabled,
	}))
}

/**
 * Valide la configuration de tous les modèles
 */
export function validateEnterpriseModels(): {
	valid: boolean
	errors: string[]
	modelResults: Array<{
		modelId: string
		modelName: string
		provider: string
		valid: boolean
		errors: string[]
	}>
} {
	const enabledModels = getEnabledAIModels()
	const modelResults: Array<{
		modelId: string
		modelName: string
		provider: string
		valid: boolean
		errors: string[]
	}> = []
	const allErrors: string[] = []

	for (const model of enabledModels) {
		let valid = true
		let errors: string[] = []

		// Validation spécifique au provider
		if (model.provider === "azure") {
			const validation = validateAzureModel(model)
			valid = validation.valid
			errors = validation.errors
		} else if (model.provider === "anthropic") {
			// Validation Anthropic (via Azure AI Foundry)
			if (!process.env.ANTHROPIC_API_KEY) {
				valid = false
				errors.push("ANTHROPIC_API_KEY non définie")
			}
			if (model.azureEndpoint) {
				const endpoint = resolveEnvVars(model.azureEndpoint)
				if (endpoint.includes("${")) {
					valid = false
					errors.push(`Variable d'environnement non résolue dans azureEndpoint: ${model.azureEndpoint}`)
				}
			}
			if (!model.azureDeployment) {
				valid = false
				errors.push("azureDeployment manquant pour modèle Anthropic via Azure AI Foundry")
			}
		} else {
			valid = false
			errors.push(`Provider non supporté: ${model.provider}`)
		}

		modelResults.push({
			modelId: model.id,
			modelName: model.name,
			provider: model.provider,
			valid,
			errors,
		})

		if (!valid) {
			allErrors.push(`${model.id}: ${errors.join(", ")}`)
		}
	}

	const overallValid = modelResults.every((r) => r.valid)

	if (!overallValid) {
		log.error("Validation des modèles enterprise échouée", { errors: allErrors })
	} else {
		log.info("Validation des modèles enterprise réussie")
	}

	return {
		valid: overallValid,
		errors: allErrors,
		modelResults,
	}
}

/**
 * Rafraîchit le cache des instances de modèles
 */
export function refreshModelInstances(): void {
	log.info("Rafraîchissement du cache des modèles enterprise")
	modelInstancesCache = null
	initializeModelInstances()
}

/**
 * Exporte les fonctions du loader pour convenance
 */
export { loadEnterpriseConfig, getEnabledAIModels, getDefaultAIModel, getAIModelById } from "../config/loader"
export type { EnterpriseAIModel, EnterpriseConfig } from "../config/loader"
