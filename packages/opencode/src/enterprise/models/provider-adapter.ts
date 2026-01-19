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
 * Crée un provider virtuel "enterprise" qui contient tous les modèles Azure
 */
export function createEnterpriseProvider(): Record<string, ModelsDev.Provider> {
	const enabledModels = getEnabledAIModels()

	if (enabledModels.length === 0) {
		log.warn("Aucun modèle enterprise activé")
		return {}
	}

	log.info(`Création du provider enterprise avec ${enabledModels.length} modèles`)

	// Convertir les modèles en format ModelsDev
	const models: Record<string, ModelsDev.Model> = {}
	for (const model of enabledModels) {
		models[model.id] = toModelsDevModel(model)
		log.debug(`Modèle converti: ${model.id} → ${model.name}`)
	}

	// Créer un provider unique qui regroupe tous les modèles Azure/Anthropic
	const provider: ModelsDev.Provider = {
		id: "enterprise",
		name: "Enterprise (Azure AI Foundry)",
		api: "https://azure.microsoft.com",
		npm: "@ai-sdk/azure",
		env: ["AZURE_API_KEY", "ANTHROPIC_API_KEY"],
		models,
	}

	return {
		enterprise: provider,
	}
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

	log.info("Providers enterprise prêts", {
		count: Object.keys(providers).length,
		models: Object.keys(providers.enterprise?.models || {}).length,
	})

	return providers
}
