# Configuration Enterprise - Aux petits Oignons

Ce module gère la configuration enterprise pour les modèles IA utilisés dans "Aux petits Oignons".

## Vue d'ensemble

Le système de configuration enterprise permet de :
- Définir et gérer plusieurs modèles IA (Claude, GPT-4.1 Mini, GPT-5 Mini, Model Routeur)
- Supporter plusieurs providers (Anthropic, Azure OpenAI)
- Verrouiller la configuration pour empêcher les modifications utilisateur
- Valider automatiquement la configuration des modèles

## Structure

```
src/enterprise/
├── config/
│   └── loader.ts          # Chargement de enterprise-config.json
├── models/
│   ├── index.ts           # Point d'entrée principal pour les modèles
│   ├── azure-provider.ts  # Intégration provider Azure
│   └── __tests__/
│       └── config.test.ts # Tests de configuration
└── README.md              # Cette documentation
```

## Configuration

### Fichier de configuration

La configuration est définie dans `/config/enterprise-config.json` à la racine du projet.

**Structure des modèles :**

```json
{
  "aiModels": [
    {
      "id": "claude-sonnet",
      "name": "Claude Sonnet",
      "provider": "anthropic",
      "default": true,
      "enabled": true
    },
    {
      "id": "gpt-4.1-mini",
      "name": "GPT-4.1 Mini",
      "provider": "azure",
      "default": false,
      "enabled": true,
      "azureEndpoint": "${AZURE_OPENAI_ENDPOINT}",
      "azureDeployment": "gpt-4-1-mini"
    }
  ]
}
```

### Variables d'environnement requises

**Tous les modèles proviennent d'Azure AI Foundry** et nécessitent les variables d'environnement suivantes :

**Pour Claude Sonnet (Anthropic via Azure AI Foundry) :**
- `ANTHROPIC_API_KEY` : Clé API pour Anthropic
- `ANTHROPIC_BASE_URL` : URL du endpoint Azure AI Foundry pour Anthropic (ex: `https://aux-ai-foundry.azure.com/anthropic/`)

**Pour les modèles GPT (GPT-4.1 Mini, GPT-5 Mini) :**
- `AZURE_OPENAI_ENDPOINT` : URL du endpoint Azure OpenAI (ex: `https://aux-ai-foundry.openai.azure.com/`)
- `AZURE_API_KEY` ou `AZURE_OPENAI_API_KEY` : Clé API Azure OpenAI

**Pour le Model Routeur :**
- `AZURE_AI_FOUNDRY_ENDPOINT` : URL du endpoint Azure AI Foundry
- `AZURE_API_KEY` : Clé API Azure

## Utilisation

### Importer le module

```typescript
import {
  getEnterpriseModel,
  getDefaultEnterpriseModel,
  listEnterpriseModels,
  validateEnterpriseModels
} from '@/enterprise/models'
```

### Récupérer un modèle

```typescript
// Récupérer le modèle par défaut (Claude Sonnet)
const defaultModel = getDefaultEnterpriseModel()
if (defaultModel) {
  // defaultModel.model contient l'instance du modèle prête à utiliser
  console.log(`Utilisation du modèle : ${defaultModel.name}`)
}

// Récupérer un modèle spécifique par ID
const gptModel = getEnterpriseModel('gpt-4.1-mini')
if (gptModel) {
  console.log(`Modèle GPT-4.1 Mini prêt`)
}
```

### Lister tous les modèles disponibles

```typescript
const models = listEnterpriseModels()
models.forEach(model => {
  console.log(`${model.id}: ${model.name} (${model.provider})`)
})
```

### Valider la configuration

```typescript
const validation = validateEnterpriseModels()
if (!validation.valid) {
  console.error('Configuration invalide:', validation.errors)
  validation.modelResults.forEach(result => {
    if (!result.valid) {
      console.error(`${result.modelId}: ${result.errors.join(', ')}`)
    }
  })
}
```

## API de configuration

### Module `config/loader`

#### `loadEnterpriseConfig()`
Charge la configuration enterprise depuis le fichier JSON.

**Retour:** `EnterpriseConfig | null`

#### `getEnabledAIModels()`
Récupère tous les modèles activés.

**Retour:** `EnterpriseAIModel[]`

#### `getDefaultAIModel()`
Récupère le modèle par défaut.

**Retour:** `EnterpriseAIModel | null`

#### `getAIModelById(id: string)`
Récupère un modèle spécifique par son ID.

**Paramètres:**
- `id`: Identifiant du modèle (ex: `"gpt-4.1-mini"`)

**Retour:** `EnterpriseAIModel | null`

#### `isConfigLocked()`
Vérifie si la configuration est verrouillée.

**Retour:** `boolean`

#### `clearConfigCache()`
Efface le cache de configuration (utile pour les tests).

### Module `models/index`

#### `getEnterpriseModel(modelId: string)`
Récupère l'instance d'un modèle prête à utiliser.

**Retour:** `EnterpriseModelInstance | null`

**Structure de `EnterpriseModelInstance` :**
```typescript
{
  id: string          // Identifiant du modèle
  name: string        // Nom d'affichage
  provider: string    // Provider (azure, anthropic)
  isDefault: boolean  // Si c'est le modèle par défaut
  model: any          // Instance du modèle AI SDK
}
```

#### `getDefaultEnterpriseModel()`
Récupère l'instance du modèle par défaut.

**Retour:** `EnterpriseModelInstance | null`

#### `listEnterpriseModels()`
Liste toutes les instances de modèles disponibles.

**Retour:** `EnterpriseModelInstance[]`

#### `validateEnterpriseModels()`
Valide la configuration de tous les modèles.

**Retour:**
```typescript
{
  valid: boolean
  errors: string[]
  modelResults: Array<{
    modelId: string
    modelName: string
    provider: string
    valid: boolean
    errors: string[]
  }>
}
```

#### `refreshModelInstances()`
Rafraîchit le cache des instances de modèles.

### Module `models/azure-provider`

#### `createEnterpriseAzureProvider(model: EnterpriseAIModel)`
Crée une instance de provider Azure pour un modèle.

#### `validateAzureModel(model: EnterpriseAIModel)`
Valide qu'un modèle Azure est correctement configuré.

## Tests

Les tests sont situés dans `models/__tests__/config.test.ts`.

**Lancer les tests :**

```bash
bun test src/enterprise/models/__tests__/config.test.ts
```

**Coverage des tests :**
- ✅ Chargement de la configuration
- ✅ Validation des 4 modèles configurés
- ✅ Récupération du modèle par défaut
- ✅ Récupération de modèles par ID
- ✅ Configuration Azure (endpoints, déploiements)
- ✅ Configuration Anthropic
- ✅ Validation des modèles
- ✅ Métadonnées des modèles

## Modèles configurés

### 1. Claude Sonnet (Anthropic via Azure AI Foundry)
- **ID:** `claude-sonnet`
- **Provider:** Anthropic
- **Par défaut:** Oui
- **Déploiement:** `claude-sonnet-4-5`
- **Variables d'environnement:**
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_BASE_URL`

### 2. GPT-4.1 Mini (Azure OpenAI)
- **ID:** `gpt-4.1-mini`
- **Provider:** Azure
- **Déploiement:** `gpt-4-1-mini`
- **Variables d'environnement:**
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_API_KEY` ou `AZURE_OPENAI_API_KEY`

### 3. GPT-5 Mini (Azure OpenAI)
- **ID:** `gpt-5-mini`
- **Provider:** Azure
- **Déploiement:** `gpt-5-mini`
- **Variables d'environnement:**
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_API_KEY` ou `AZURE_OPENAI_API_KEY`

### 4. Model Routeur (Azure AI Foundry)
- **ID:** `model-routeur`
- **Provider:** Azure
- **Déploiement:** `model-router`
- **Variables d'environnement:**
  - `AZURE_AI_FOUNDRY_ENDPOINT`
  - `AZURE_API_KEY`

## Sécurité

- Les clés API ne sont JAMAIS stockées dans le code ou la configuration JSON
- Toutes les clés API doivent être fournies via des variables d'environnement
- La configuration peut être verrouillée (`locked: true`) pour empêcher les modifications

## Dépannage

### "Fichier enterprise-config.json introuvable"

**Cause:** Le fichier de configuration n'existe pas à `/config/enterprise-config.json`

**Solution:** Vérifiez que le fichier existe à la racine du projet.

### "Variable d'environnement manquante"

**Cause:** Une variable d'environnement requise (ANTHROPIC_BASE_URL, AZURE_OPENAI_ENDPOINT, AZURE_API_KEY, etc.) n'est pas définie.

**Solution:** Définissez les variables d'environnement nécessaires dans votre fichier `.env` ou dans votre environnement :
```bash
# Pour Claude Sonnet
ANTHROPIC_API_KEY=your-key
ANTHROPIC_BASE_URL=https://your-azure-foundry.azure.com/anthropic/

# Pour GPT models
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_API_KEY=your-key

# Pour Model Routeur
AZURE_AI_FOUNDRY_ENDPOINT=https://your-foundry.azure.com/
AZURE_API_KEY=your-key
```

### "Modèle Azure mal configuré"

**Cause:** Le modèle Azure n'a pas `azureEndpoint` ou `azureDeployment` dans sa configuration.

**Solution:** Ajoutez ces champs dans `enterprise-config.json` :
```json
{
  "azureEndpoint": "${AZURE_OPENAI_ENDPOINT}",
  "azureDeployment": "nom-du-deploiement"
}
```

### Tests échouent

**Cause:** Les tests vérifient la présence des variables d'environnement.

**Solution:** Les tests sont conçus pour identifier les erreurs de configuration. Les avertissements sur les variables d'environnement manquantes sont normaux en environnement de développement sans les clés API configurées.

## Maintenance

### Ajouter un nouveau modèle

1. Ajouter le modèle dans `/config/enterprise-config.json`
2. Si c'est un modèle Azure, ajouter `azureEndpoint` et `azureDeployment`
3. Mettre à jour les tests dans `models/__tests__/config.test.ts`
4. Documenter le nouveau modèle dans ce README

### Modifier la configuration

⚠️ **Attention:** Si `locked: true`, la configuration ne peut plus être modifiée par les utilisateurs. Ceci est prévu pour STORY-004.

## Liens

- **Tech Spec:** `/docs/tech-spec-opencode-enterprise-2026-01-18.md`
- **Story STORY-002:** `/docs/stories/STORY-002.md`
- **Configuration enterprise:** `/config/enterprise-config.json`
