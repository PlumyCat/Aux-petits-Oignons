/**
 * Tests pour la configuration des modèles enterprise
 */

import { describe, test, expect, beforeEach } from "bun:test"
import {
	loadEnterpriseConfig,
	getEnabledAIModels,
	getDefaultAIModel,
	getAIModelById,
	clearConfigCache,
} from "../../config/loader"
import { validateAllAzureModels } from "../azure-provider"
import { listEnterpriseModelsMetadata, validateEnterpriseModels } from "../index"

describe("Enterprise Configuration", () => {
	beforeEach(() => {
		// Nettoyer le cache avant chaque test
		clearConfigCache()
	})

	test("devrait charger la configuration enterprise", () => {
		const config = loadEnterpriseConfig()

		expect(config).not.toBeNull()
		expect(config?.projectName).toBe("Aux petits Oignons")
		expect(config?.aiModels).toBeDefined()
		expect(Array.isArray(config?.aiModels)).toBe(true)
	})

	test("devrait avoir exactement 4 modèles configurés", () => {
		const config = loadEnterpriseConfig()

		expect(config?.aiModels).toHaveLength(4)
	})

	test("devrait avoir les 4 modèles attendus", () => {
		const config = loadEnterpriseConfig()
		const modelIds = config?.aiModels.map((m) => m.id) || []

		expect(modelIds).toContain("claude-sonnet")
		expect(modelIds).toContain("gpt-4.1-mini")
		expect(modelIds).toContain("gpt-5-mini")
		expect(modelIds).toContain("model-routeur")
	})

	test("devrait avoir Claude Sonnet comme modèle par défaut", () => {
		const defaultModel = getDefaultAIModel()

		expect(defaultModel).not.toBeNull()
		expect(defaultModel?.id).toBe("claude-sonnet")
		expect(defaultModel?.default).toBe(true)
		expect(defaultModel?.enabled).toBe(true)
	})

	test("devrait récupérer tous les modèles activés", () => {
		const enabledModels = getEnabledAIModels()

		expect(enabledModels).toHaveLength(4)
		expect(enabledModels.every((m) => m.enabled)).toBe(true)
	})

	test("devrait récupérer un modèle par ID", () => {
		const model = getAIModelById("gpt-4.1-mini")

		expect(model).not.toBeNull()
		expect(model?.id).toBe("gpt-4.1-mini")
		expect(model?.name).toBe("GPT-4.1 Mini")
		expect(model?.provider).toBe("azure")
	})

	test("devrait retourner null pour un ID inexistant", () => {
		const model = getAIModelById("non-existent-model")

		expect(model).toBeNull()
	})
})

describe("Azure Provider Configuration", () => {
	test("devrait avoir 3 modèles Azure", () => {
		const config = loadEnterpriseConfig()
		const azureModels = config?.aiModels.filter((m) => m.provider === "azure") || []

		expect(azureModels).toHaveLength(3)
	})

	test("tous les modèles Azure devraient avoir azureEndpoint et azureDeployment", () => {
		const config = loadEnterpriseConfig()
		const azureModels = config?.aiModels.filter((m) => m.provider === "azure") || []

		for (const model of azureModels) {
			expect(model.azureEndpoint).toBeDefined()
			expect(model.azureDeployment).toBeDefined()
			expect(typeof model.azureEndpoint).toBe("string")
			expect(typeof model.azureDeployment).toBe("string")
		}
	})

	test("les modèles GPT devraient utiliser AZURE_OPENAI_ENDPOINT", () => {
		const config = loadEnterpriseConfig()
		const gptModels = config?.aiModels.filter((m) => m.id.startsWith("gpt-")) || []

		for (const model of gptModels) {
			expect(model.azureEndpoint).toContain("AZURE_OPENAI_ENDPOINT")
		}
	})

	test("le model-routeur devrait utiliser AZURE_AI_FOUNDRY_ENDPOINT", () => {
		const model = getAIModelById("model-routeur")

		expect(model?.azureEndpoint).toContain("AZURE_AI_FOUNDRY_ENDPOINT")
	})
})

describe("Anthropic Provider Configuration", () => {
	test("devrait avoir 1 modèle Anthropic", () => {
		const config = loadEnterpriseConfig()
		const anthropicModels = config?.aiModels.filter((m) => m.provider === "anthropic") || []

		expect(anthropicModels).toHaveLength(1)
	})

	test("Claude Sonnet devrait être le modèle Anthropic", () => {
		const model = getAIModelById("claude-sonnet")

		expect(model).not.toBeNull()
		expect(model?.provider).toBe("anthropic")
		expect(model?.name).toBe("Claude Sonnet")
	})

	test("Claude Sonnet devrait avoir azureEndpoint et azureDeployment (Azure AI Foundry)", () => {
		const model = getAIModelById("claude-sonnet")

		expect(model).not.toBeNull()
		expect(model?.azureEndpoint).toBeDefined()
		expect(model?.azureDeployment).toBeDefined()
		expect(model?.azureEndpoint).toContain("ANTHROPIC_BASE_URL")
		expect(model?.azureDeployment).toBe("claude-sonnet-4-5")
	})
})

describe("Model Metadata", () => {
	test("devrait lister les métadonnées de tous les modèles", () => {
		const metadata = listEnterpriseModelsMetadata()

		expect(metadata).toHaveLength(4)
		expect(metadata[0]).toHaveProperty("id")
		expect(metadata[0]).toHaveProperty("name")
		expect(metadata[0]).toHaveProperty("provider")
		expect(metadata[0]).toHaveProperty("default")
		expect(metadata[0]).toHaveProperty("enabled")
	})

	test("les métadonnées devraient correspondre à la config", () => {
		const metadata = listEnterpriseModelsMetadata()
		const config = loadEnterpriseConfig()

		expect(config).not.toBeNull()
		expect(metadata.length).toBe(config!.aiModels.length)

		for (let i = 0; i < metadata.length; i++) {
			expect(metadata[i].id).toBe(config!.aiModels[i].id)
			expect(metadata[i].name).toBe(config!.aiModels[i].name)
			expect(metadata[i].provider).toBe(config!.aiModels[i].provider)
		}
	})
})

describe("Validation", () => {
	test("validateEnterpriseModels devrait identifier les erreurs de configuration", () => {
		// Cette validation échouera si les variables d'environnement ne sont pas définies
		// C'est le comportement attendu
		const validation = validateEnterpriseModels()

		expect(validation).toHaveProperty("valid")
		expect(validation).toHaveProperty("errors")
		expect(validation).toHaveProperty("modelResults")
		expect(Array.isArray(validation.errors)).toBe(true)
		expect(Array.isArray(validation.modelResults)).toBe(true)
		expect(validation.modelResults).toHaveLength(4)
	})

	test("validateAllAzureModels devrait valider la structure des modèles Azure", () => {
		const validation = validateAllAzureModels()

		expect(validation).toHaveProperty("valid")
		expect(validation).toHaveProperty("results")
		expect(Array.isArray(validation.results)).toBe(true)
		expect(validation.results).toHaveLength(3) // 3 modèles Azure
	})
})

describe("Azure Configuration", () => {
	test("devrait avoir la configuration Azure", () => {
		const config = loadEnterpriseConfig()

		expect(config?.azure).toBeDefined()
		expect(config?.azure.defaultRegion).toBe("francecentral")
		expect(config?.azure.namingConventions).toBeDefined()
		expect(config?.azure.mandatoryTags).toBeDefined()
	})

	test("les conventions de nommage Azure devraient être correctes", () => {
		const config = loadEnterpriseConfig()
		const naming = config?.azure.namingConventions

		expect(naming?.prefix).toBe("aux")
		expect(naming?.separator).toBe("-")
		expect(naming?.resourceGroupFormat).toBeDefined()
	})
})
