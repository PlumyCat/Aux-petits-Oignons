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

| Modèle | Provider | Par défaut |
|--------|----------|------------|
| **Claude Sonnet** | Anthropic | ✓ |
| **GPT-4.1 Mini** | OpenAI | |
| **GPT-5 Mini** | OpenAI | |
| **Model Routeur** | Azure AI Foundry | |

La configuration des modèles se trouve dans `/config/enterprise-config.json` et sera verrouillée pour éviter les modifications non autorisées (STORY-004).

### Azure Configuration

La configuration Azure inclut :

- **Conventions de nommage** : Préfixe `aux-`, format standardisé
- **Tags obligatoires** : `environment`, `project`, `owner`
- **Région par défaut** : `francecentral`

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

**Version actuelle** : 1.1.25 (basée sur OpenCode + personnalisations entreprise)

**Dernière mise à jour** : 2026-01-18
