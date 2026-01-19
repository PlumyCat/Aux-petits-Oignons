/**
 * Adapter pour convertir les modèles enterprise en format Provider compatible
 * avec le système de providers OpenCode
 */

import type { ModelsDev } from "../../provider/models"
import { getEnabledAIModels, type EnterpriseAIModel } from "../config/loader"
import { Log } from "@/util/log"

const log = Log.create({ service: "enterprise-provider-adapter" })

/**
 * Convertit un modèle enterprise en modèle ModelsDev
 */
function toModelsDevModel(model: EnterpriseAIModel): ModelsDev.Model {
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
 * Crée les providers pour les modèles enterprise (séparés par type pour compatibilité plugins)
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

	// Créer le provider Anthropic si des modèles Anthropic existent
	if (anthropicModels.length > 0) {
		const models: Record<string, ModelsDev.Model> = {}
		for (const model of anthropicModels) {
			models[model.id] = toModelsDevModel(model)
			log.debug(`Modèle Anthropic converti: ${model.id} → ${model.name}`)
		}

		providers.anthropic = {
			id: "anthropic",
			name: "Anthropic (via Azure AI Foundry)",
			api: "https://api.anthropic.com",
			npm: "@ai-sdk/anthropic",
			env: ["ANTHROPIC_API_KEY"],
			models,
		}
	}

	// Créer le provider Azure si des modèles Azure existent
	if (azureModels.length > 0) {
		const models: Record<string, ModelsDev.Model> = {}
		for (const model of azureModels) {
			models[model.id] = toModelsDevModel(model)
			log.debug(`Modèle Azure converti: ${model.id} → ${model.name}`)
		}

		providers.azure = {
			id: "azure",
			name: "Azure OpenAI (via Azure AI Foundry)",
			api: "https://azure.microsoft.com/openai",
			npm: "@ai-sdk/azure",
			env: ["AZURE_API_KEY", "AZURE_OPENAI_API_KEY"],
			models,
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
