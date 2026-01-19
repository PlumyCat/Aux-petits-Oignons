# Aux petits Oignons

> **Outil CLI entreprise pour déploiements Azure de bots Copilot Studio**

Version personnalisée d'[OpenCode](https://github.com/anomalyco/opencode) pour les consultants internes, conçue pour automatiser les déploiements d'infrastructure Azure pour Microsoft Copilot Studio.

---

## À propos

**Aux petits Oignons** est un fork d'OpenCode spécialement configuré pour notre équipe de consultants. Il simplifie le déploiement de bots Copilot Studio sur Azure en fournissant :

- ✨ **4 modèles IA pré-configurés** : Claude Sonnet, GPT-4.1 Mini, GPT-5 Mini, Model Routeur
- 🎯 **Page d'accueil personnalisée** pour consultants
- ☁️ **Templates Azure pré-configurés** (Bicep, Azure Functions, services)
- 🔒 **Configuration entreprise verrouillée** pour garantir la conformité
- 🚀 **Automatisation des déploiements** via Azure SDK

### Utilisateurs cibles

Ce projet est destiné aux **5 consultants internes** :
- Experts Power Apps & Copilot Studio
- Débutants sur Azure (infrastructure et déploiements)
- Besoin d'autonomie pour déployer sans dépendre de l'équipe technique

### Objectifs

- **90% d'autonomie** en déploiements Azure dans les 2 prochains mois
- **Réduction du temps de déploiement** de 60 minutes → 15-20 minutes
- **Élimination du goulot d'étranglement** technique

---

## Installation

### Prérequis

- **Bun 1.3.5+** installé ([Installation Bun](https://bun.sh/docs/installation))
- **Git** configuré
- **Abonnements Azure AI Foundry** pour les 4 modèles IA (déjà disponibles)
- **Accès au repository** git interne

### Installation locale

```bash
# Cloner le repository
git clone <url-du-repository-interne>/aux-petits-oignons.git
cd aux-petits-oignons

# Installer les dépendances
bun install

# Lancer en mode développement
bun run dev

# Vérifier les types TypeScript
bun run typecheck
```

### Build de production

```bash
# Build de l'application
bun run build
```

> **Note:** Le packaging en exécutable Windows (.exe) est géré dans le projet séparé `deploy-trad-bot-container`.

---

## Configuration

### Modèles IA disponibles

Quatre modèles IA sont pré-configurés et accessibles via vos abonnements Azure AI Foundry :

| Modèle | Provider | Par défaut | Statut |
|--------|----------|------------|--------|
| **GPT-4.1 Mini** | Azure OpenAI | ✓ | ✅ Activé |
| **GPT-5 Mini** | Azure OpenAI | | ✅ Activé |
| **Model Routeur** | Azure AI Foundry | | ✅ Activé |
| **Claude Sonnet** | Azure AI Foundry (Anthropic) | | 🔒 Réservé admin |

La configuration des modèles se trouve dans `/config/enterprise-config.json` et est **verrouillée** pour éviter les modifications non autorisées.

### Azure Configuration

La configuration Azure inclut :

- **Conventions de nommage** : Préfixe `aux-`, format standardisé
- **Tags obligatoires** : `environment`, `project`, `owner`
- **Région par défaut** : `francecentral`

### Configuration technique des modèles IA

#### Variables d'environnement requises

Créez un fichier `.env` à la racine du projet avec les clés API Azure :

```bash
# Azure OpenAI (GPT-4.1 Mini, GPT-5 Mini)
AZURE_OPENAI_ENDPOINT=https://votre-resource-openai.cognitiveservices.azure.com
AZURE_OPENAI_API_KEY=votre_clé_api_azure_openai

# Azure AI Foundry (Model Routeur)
AZURE_AI_FOUNDRY_ENDPOINT=https://votre-resource-foundry.cognitiveservices.azure.com
AZURE_API_KEY=votre_clé_api_ai_foundry

# Claude Sonnet (optionnel, réservé admin)
ANTHROPIC_BASE_URL=https://votre-resource-anthropic.services.ai.azure.com/anthropic/v1
ANTHROPIC_API_KEY=votre_clé_api_anthropic
```

> 🔐 **Sécurité** : Le fichier `.env` est dans `.gitignore` et ne doit JAMAIS être commité. Les clés API sont fournies par l'équipe technique.

#### Fonctionnement interne

Le système charge automatiquement les configurations Azure au démarrage :

1. **Chargement de la config** : `enterprise-config.json` définit les 4 modèles autorisés
2. **Provider adapters** : Chaque modèle devient un provider Azure séparé avec son propre endpoint
3. **Custom loaders** : Gèrent automatiquement le mapping entre IDs de modèles et noms de déploiements Azure
4. **Auto-connexion** : Les clés du `.env` sont chargées automatiquement (pas de saisie manuelle)

#### API Versions Azure

Les modèles utilisent des API versions différentes selon leur endpoint :

| Type de ressource | Modèles | API Version |
|----------|---------|-------------|
| Azure OpenAI | GPT-4.1 Mini, GPT-5 Mini | `2023-05-15` |
| Azure AI Foundry | Model Routeur | `2024-12-01-preview` |
| Azure AI Foundry (Anthropic) | Claude Sonnet | Variable |

#### Deployment Mapping

Les IDs de modèles sont automatiquement mappés vers les noms de déploiements Azure :

- `model-routeur` (ID) → `model-router` (deployment Azure)
- `gpt-4.1-mini` (ID) → `gpt-4.1-mini` (deployment Azure)
- `gpt-5-mini` (ID) → `gpt-5-mini` (deployment Azure)
- `claude-sonnet` (ID) → `claude-sonnet-4-5-v2@20250514` (deployment Azure)

Ce mapping est géré par des **custom loaders** qui interceptent les appels au SDK Azure.

---

## Utilisation

### Démarrage rapide

```bash
# Lancer l'application
bun run dev

# Sélectionner un modèle IA depuis la page d'accueil
# Utiliser les templates Azure pré-configurés
# Suivre les étapes de déploiement guidé
```

### Templates Azure disponibles

Les templates Bicep pré-configurés incluent :

- Azure Functions pour bots Copilot Studio
- Resource Groups avec tags standardisés
- Configurations réseau et sécurité
- Intégration avec Azure AI Foundry

---

## Architecture

### Stack technique

- **Runtime** : Bun 1.3.5
- **Language** : TypeScript 5.8.2 (strict mode)
- **Frontend** : SolidJS 1.9.10
- **Backend** : Hono 4.10.7
- **Build** : Vite 7.1.4
- **Monorepo** : Turbo

### Structure du projet

```
aux-petits-oignons/
├── src/
│   └── enterprise/           # Code spécifique entreprise
│       ├── config/           # Configuration entreprise
│       ├── models/           # Configuration modèles IA
│       ├── azure/            # Intégration Azure
│       └── ui/               # Composants UI personnalisés
├── config/
│   └── enterprise-config.json # Configuration entreprise
├── templates/
│   └── azure/                # Templates Bicep
├── docs/                     # Documentation
└── packages/                 # Packages monorepo
```

---

## Développement

### Scripts disponibles

```bash
bun run dev          # Mode développement
bun run typecheck    # Vérification TypeScript
bun run build        # Build production
bun test             # Tests unitaires
```

### Tests

```bash
# Lancer tous les tests
bun test

# Tests avec coverage
bun run test:coverage
```

---

## Documentation

- **Product Brief** : `docs/product-brief-opencode-enterprise-2026-01-18.md`
- **Tech Spec** : `docs/tech-spec-opencode-enterprise-2026-01-18.md`
- **Stories** : `docs/stories/`
- **Sprint Status** : `docs/sprint-status.yaml`

---

## Historique du projet

### Version 1.0.0 (Setup Initial - STORY-001)

- ✅ Fork d'OpenCode configuré
- ✅ Renommage en "Aux petits Oignons"
- ✅ Structure enterprise créée
- ✅ Configuration des 4 modèles IA
- ✅ Build fonctionnel avec Bun

### Roadmap

Consultez `docs/sprint-status.yaml` pour suivre l'avancement des 9 stories planifiées :

- **Sprint 1** : Setup, Configuration Multi-Modèles, Config Entreprise
- **Sprint 2** : Page d'Accueil, Templates Azure
- **Sprint 3** : Intégration Azure SDK
- **Sprint 5** : Messages d'erreur, Documentation
- **Sprint 6** : Tests avec consultants pilotes

---

## Dépannage

### Problèmes courants

#### ❌ Les modèles ne se connectent pas

**Symptôme** : Les modèles n'apparaissent pas ou affichent "Not connected"

**Solutions** :
1. Vérifier que le fichier `.env` existe à la racine du projet
2. Vérifier que toutes les clés API sont présentes et valides
3. Redémarrer l'application : `bun run dev`
4. Vérifier les logs dans `~/.local/share/opencode/log/dev.log`

#### ❌ Erreur "deployment does not exist"

**Symptôme** : Le Model Routeur affiche cette erreur lors de l'envoi d'un message

**Solutions** :
- Vérifier que le nom de déploiement Azure est `model-router` (sans 'u')
- Le mapping automatique doit être : `model-routeur` → `model-router`
- Vérifier les logs pour confirmer que le custom loader est actif

#### ❌ Erreur "API version not supported"

**Symptôme** : Erreur lors de l'utilisation d'un modèle Azure

**Solutions** :
- Les API versions sont gérées automatiquement par endpoint
- Vérifier que les endpoints dans `.env` sont corrects et correspondent aux ressources Azure
- GPT models doivent utiliser votre endpoint Azure OpenAI (`cognitiveservices.azure.com`)
- Model Routeur doit utiliser votre endpoint Azure AI Foundry

#### ❌ Erreur "Resource name setting is missing"

**Symptôme** : Le SDK Azure ne trouve pas le `resourceName`

**Solutions** :
- Cette erreur est normalement gérée automatiquement
- Le `resourceName` est extrait de l'URL de l'endpoint
- Vérifier que `AZURE_OPENAI_ENDPOINT` et `AZURE_AI_FOUNDRY_ENDPOINT` sont bien définis

#### 🔍 Tester la connectivité Azure manuellement

Pour vérifier que vos clés API fonctionnent :

```bash
# Test GPT-4.1 Mini
curl -H "api-key: VOTRE_CLE_OPENAI" \
  "https://votre-resource-openai.cognitiveservices.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2023-05-15" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Test Model Routeur
curl -H "api-key: VOTRE_CLE_AI_FOUNDRY" \
  "https://votre-resource-foundry.cognitiveservices.azure.com/openai/deployments/model-router/chat/completions?api-version=2024-12-01-preview" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

#### 📋 Voir les logs détaillés

```bash
# Logs en temps réel
tail -f ~/.local/share/opencode/log/dev.log

# Logs avec filtrage
tail -100 ~/.local/share/opencode/log/dev.log | grep -E "(Custom loader|error|deployment)"

# Voir les URLs générées
tail -100 ~/.local/share/opencode/log/dev.log | grep -oP '"url":"[^"]*"'
```

---

## Support

### Pour les consultants

Si vous rencontrez des problèmes :

1. Vérifiez la documentation dans `docs/`
2. Consultez les stories complétées dans `docs/stories/`
3. Contactez l'équipe technique pour support

### Pour l'équipe technique

- **Repository upstream** : [OpenCode](https://github.com/anomalyco/opencode)
- **Sync avec upstream** : Mensuel ou selon besoins
- **Issues** : Utiliser le système de tracking interne

---

## Crédits

Ce projet est basé sur [OpenCode](https://github.com/anomalyco/opencode), un agent de codage IA open source créé par [anomalyco](https://github.com/anomalyco).

**Personnalisations entreprise** :
- Équipe de développement interne
- Consultants pilotes (testing & feedback)

---

## License

**Usage interne uniquement** - Ce fork est destiné exclusivement aux consultants internes et ne doit pas être redistribué.

Le projet upstream OpenCode est sous licence MIT.

---

**Version actuelle** : 1.2.0 (basée sur OpenCode + personnalisations entreprise)

**Dernière mise à jour** : 2026-01-19

**Changements v1.2.0** :
- ✅ Configuration Azure complète fonctionnelle (GPT-4.1 Mini, GPT-5 Mini, Model Routeur)
- ✅ Custom loaders pour mapping automatique des deployments Azure
- ✅ Auto-connexion via fichier `.env`
- ✅ API versions différenciées par endpoint
- ✅ GPT-4.1 Mini défini comme modèle par défaut
- ✅ Documentation technique complète
