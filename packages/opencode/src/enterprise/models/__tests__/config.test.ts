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
	isConfigLocked,
	assertConfigNotLocked,
	getConfigLockInfo,
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

	test("devrait avoir exactement 1 modèle configuré", () => {
		const config = loadEnterpriseConfig()

		expect(config?.aiModels).toHaveLength(1)
	})

	test("devrait avoir le modèle gpt-5.3-codex", () => {
		const config = loadEnterpriseConfig()
		const modelIds = config?.aiModels.map((m) => m.id) || []

		expect(modelIds).toContain("gpt-5.3-codex")
	})

	test("devrait avoir GPT-5.3 Codex comme modèle par défaut", () => {
		const defaultModel = getDefaultAIModel()

		expect(defaultModel).not.toBeNull()
		expect(defaultModel?.id).toBe("gpt-5.3-codex")
		expect(defaultModel?.default).toBe(true)
		expect(defaultModel?.enabled).toBe(true)
	})

	test("devrait récupérer tous les modèles activés", () => {
		const enabledModels = getEnabledAIModels()

		expect(enabledModels).toHaveLength(1)
		expect(enabledModels.every((m) => m.enabled)).toBe(true)
	})

	test("devrait récupérer un modèle par ID", () => {
		const model = getAIModelById("gpt-5.3-codex")

		expect(model).not.toBeNull()
		expect(model?.id).toBe("gpt-5.3-codex")
		expect(model?.name).toBe("GPT-5.3 Codex")
		expect(model?.provider).toBe("azure")
	})

	test("devrait retourner null pour un ID inexistant", () => {
		const model = getAIModelById("non-existent-model")

		expect(model).toBeNull()
	})

	test("devrait retourner null pour les anciens modèles supprimés", () => {
		expect(getAIModelById("gpt-4.1-mini")).toBeNull()
		expect(getAIModelById("gpt-5-mini")).toBeNull()
		expect(getAIModelById("model-routeur")).toBeNull()
	})
})

describe("Azure Provider Configuration", () => {
	test("devrait avoir 1 modèle Azure", () => {
		const config = loadEnterpriseConfig()
		const azureModels = config?.aiModels.filter((m) => m.provider === "azure") || []

		expect(azureModels).toHaveLength(1)
	})

	test("le modèle Azure devrait avoir azureEndpoint et azureDeployment", () => {
		const config = loadEnterpriseConfig()
		const azureModels = config?.aiModels.filter((m) => m.provider === "azure") || []

		for (const model of azureModels) {
			expect(model.azureEndpoint).toBeDefined()
			expect(model.azureDeployment).toBeDefined()
			expect(typeof model.azureEndpoint).toBe("string")
			expect(typeof model.azureDeployment).toBe("string")
		}
	})

	test("gpt-5.3-codex devrait utiliser AZURE_OPENAI_ENDPOINT", () => {
		const model = getAIModelById("gpt-5.3-codex")

		expect(model?.azureEndpoint).toContain("AZURE_OPENAI_ENDPOINT")
	})
})

describe("Model Metadata", () => {
	test("devrait lister les métadonnées de tous les modèles", () => {
		const metadata = listEnterpriseModelsMetadata()

		expect(metadata).toHaveLength(1)
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
		const validation = validateEnterpriseModels()

		expect(validation).toHaveProperty("valid")
		expect(validation).toHaveProperty("errors")
		expect(validation).toHaveProperty("modelResults")
		expect(Array.isArray(validation.errors)).toBe(true)
		expect(Array.isArray(validation.modelResults)).toBe(true)
		expect(validation.modelResults).toHaveLength(1)
	})

	test("validateAllAzureModels devrait valider la structure des modèles Azure", () => {
		const validation = validateAllAzureModels()

		expect(validation).toHaveProperty("valid")
		expect(validation).toHaveProperty("results")
		expect(Array.isArray(validation.results)).toBe(true)
		expect(validation.results).toHaveLength(1)
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

describe("Configuration Locking (STORY-004)", () => {
	test("devrait indiquer que la configuration est verrouillée", () => {
		const locked = isConfigLocked()

		expect(locked).toBe(true)
	})

	test("assertConfigNotLocked devrait retourner une erreur si locked", () => {
		const result = assertConfigNotLocked()

		expect(result.allowed).toBe(false)
		expect(result.error).toBeDefined()
		expect(result.error).toContain("VERROUILLÉE")
		expect(result.error).toContain("équipe technique")
	})

	test("getConfigLockInfo devrait retourner des informations sur le verrouillage", () => {
		const info = getConfigLockInfo()

		expect(info).toContain("VERROUILLÉE")
		expect(info).toContain("naming conventions")
		expect(info).toContain("tags obligatoires")
		expect(info).toContain("security settings")
		expect(info).toContain("Équipe technique")
	})

	test("la configuration doit avoir locked: true", () => {
		const config = loadEnterpriseConfig()

		expect(config).not.toBeNull()
		expect(config?.locked).toBe(true)
	})

	test("le message d'erreur devrait guider les consultants", () => {
		const result = assertConfigNotLocked()

		expect(result.error).toContain("consultants")
		expect(result.error).toContain("enterprise-config.json")
		expect(result.error).toContain("contactez")
	})
})
