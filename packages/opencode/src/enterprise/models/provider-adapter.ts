/**
 * Adapter pour convertir les modèles enterprise en format Provider compatible
 * avec le système de providers OpenCode
 *
 * IMPORTANT : Chaque modèle Azure devient un provider séparé car ils utilisent
 * des endpoints différents (AZURE_OPENAI_ENDPOINT vs AZURE_AI_FOUNDRY_ENDPOINT)
 */

import type { ModelsDev } from "../../provider/models"
import { getEnabledAIModels, type EnterpriseAIModel } from "../config/loader"
import { Log } from "@/util/log"

const log = Log.create({ service: "enterprise-provider-adapter" })

/**
 * Résout les variables d'environnement dans une chaîne
 */
function resolveEnvVars(value: string): string {
	return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
		const envValue = process.env[envVar]
		if (!envValue) {
			log.warn(`Variable d'environnement manquante: ${envVar}`)
			return ""
		}
		return envValue
	})
}

/**
 * Convertit un modèle enterprise en modèle ModelsDev
 */
function toModelsDevModel(model: EnterpriseAIModel, providerID: string): ModelsDev.Model {
	return {
		id: model.id,
		name: model.name,
		provider: {
			npm: model.provider === "azure" ? "@ai-sdk/azure" : "@ai-sdk/anthropic",
		},
		family: model.provider === "azure" ? "gpt" : "claude",
		status: undefined,
		cost: {
			input: 10, // Définir un coût nominal pour que les modèles soient visibles
			output: 30,
			cache_read: 1,
			cache_write: 3,
		},
		limit: {
			context: 200000,
			output: 16000,
		},
		temperature: true,
		reasoning: model.provider === "anthropic",
		attachment: true,
		tool_call: true,
		modalities: {
			input: ["text", "image"],
			output: ["text"],
		},
		release_date: new Date().toISOString().split("T")[0],
		options: model.azureDeployment
			? {
					deployment: model.azureDeployment,
			  }
			: {},
		headers: {},
		interleaved: model.provider === "anthropic" ? true : undefined,
	}
}

/**
 * Crée les providers pour les modèles enterprise
 * Chaque modèle Azure devient un provider séparé avec son propre endpoint
 */
export function createEnterpriseProvider(): Record<string, ModelsDev.Provider> {
	const enabledModels = getEnabledAIModels()

	if (enabledModels.length === 0) {
		log.warn("Aucun modèle enterprise activé")
		return {}
	}

	log.info(`Création des providers enterprise avec ${enabledModels.length} modèles`)

	const providers: Record<string, ModelsDev.Provider> = {}

	// Séparer les modèles par provider
	const anthropicModels = enabledModels.filter((m) => m.provider === "anthropic")
	const azureModels = enabledModels.filter((m) => m.provider === "azure")

	// IMPORTANT: Créer les providers Azure EN PREMIER car le système prend
	// le premier provider de la liste comme défaut
	// Créer un provider SÉPARÉ pour CHAQUE modèle Azure
	// car ils peuvent avoir des endpoints différents
	for (const model of azureModels) {
		const providerID = model.id // Utiliser l'ID du modèle comme ID de provider
		const endpoint = model.azureEndpoint ? resolveEnvVars(model.azureEndpoint) : ""

		// Déterminer LA variable d'environnement de clé à utiliser (UNE SEULE pour auto-connexion)
		// IMPORTANT: provider.env doit contenir UNE SEULE variable pour que le système
		// stocke automatiquement la clé dans provider.key
		let envVar: string
		if (model.azureEndpoint?.includes("AZURE_OPENAI_ENDPOINT")) {
			// Modèles utilisant Azure OpenAI (GPT-4.1 Mini, GPT-5 Mini)
			envVar = "AZURE_OPENAI_API_KEY"
		} else if (model.azureEndpoint?.includes("AZURE_AI_FOUNDRY_ENDPOINT")) {
			// Modèles utilisant Azure AI Foundry (Model Routeur)
			envVar = "AZURE_API_KEY"
		} else {
			// Fallback générique
			envVar = "AZURE_API_KEY"
		}

		const models: Record<string, ModelsDev.Model> = {}
		models[model.id] = toModelsDevModel(model, providerID)

		// Construire le baseURL pour Azure OpenAI
		// Format attendu : https://{resource}.cognitiveservices.azure.com/openai
		const baseURL = endpoint ? (endpoint.endsWith("/openai") ? endpoint : `${endpoint}/openai`) : ""

		providers[providerID] = {
			id: providerID,
			name: model.name,
			api: endpoint || "https://azure.microsoft.com",
			npm: "@ai-sdk/azure",
			env: [envVar], // UNE SEULE variable pour auto-connexion
			models,
			// Configurer les options pour Azure SDK
			// IMPORTANT: Utiliser baseURL car les endpoints sont sur cognitiveservices.azure.com
			// et non sur openai.azure.com (resourceName ne fonctionne pas)
			options: baseURL
				? {
						baseURL,
						apiVersion: "2025-01-01-preview",
				  }
				: {},
		}

		log.debug(`Provider Azure créé: ${providerID} → ${model.name}`, {
			endpoint,
			baseURL,
			envVar,
		})
	}

	// Créer le provider Anthropic EN DERNIER si des modèles Anthropic existent
	// IMPORTANT: Ne PAS inclure les modèles Anthropic dans l'auto-connexion
	// pour que seul l'admin puisse les activer manuellement
	if (anthropicModels.length > 0) {
		const models: Record<string, ModelsDev.Model> = {}
		for (const model of anthropicModels) {
			models[model.id] = toModelsDevModel(model, "anthropic")
			log.debug(`Modèle Anthropic converti: ${model.id} → ${model.name}`)
		}

		const endpoint = anthropicModels[0].azureEndpoint ? resolveEnvVars(anthropicModels[0].azureEndpoint) : ""

		providers.anthropic = {
			id: "anthropic",
			name: "Anthropic (via Azure AI Foundry)",
			api: "https://api.anthropic.com",
			npm: "@ai-sdk/anthropic",
			// Ne PAS mettre ANTHROPIC_API_KEY ici pour éviter l'auto-connexion
			// L'utilisateur devra saisir la clé manuellement (réservé admin)
			env: [],
			models,
			// Configurer le baseURL pour Anthropic via Azure
			options: endpoint
				? {
						baseURL: endpoint,
				  }
				: {},
		}
	}

	return providers
}

/**
 * Remplace les providers de models.dev par les providers enterprise
 * À utiliser dans server/routes/provider.ts
 */
export async function getEnterpriseProviders(): Promise<Record<string, ModelsDev.Provider>> {
	const providers = createEnterpriseProvider()

	if (Object.keys(providers).length === 0) {
		log.error("Aucun provider enterprise disponible, vérifiez enterprise-config.json")
		return {}
	}

	const totalModels = Object.values(providers).reduce((sum, p) => sum + Object.keys(p.models).length, 0)

	log.info("Providers enterprise prêts", {
		providers: Object.keys(providers).join(", "),
		totalModels,
	})

	return providers
}
