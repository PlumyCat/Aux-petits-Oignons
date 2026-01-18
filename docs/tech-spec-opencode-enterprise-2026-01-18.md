# Technical Specification: OpenCode Enterprise (Aux petits Oignons)

**Date:** 2026-01-18
**Author:** eric
**Version:** 1.0
**Project Type:** CLI
**Project Level:** 1
**Status:** Draft

---

## Document Overview

Cette Spécification Technique fournit la planification technique détaillée pour OpenCode Enterprise ("Aux petits Oignons"). Ce document est conçu pour un projet de niveau 1 (1-10 stories) qui nécessite des exigences claires sans la lourdeur d'un PRD complet.

**Documents Associés:**
- Product Brief: `docs/product-brief-opencode-enterprise-2026-01-18.md`

---

## Problem & Solution

### Problem Statement

Les consultants internes, bien qu'experts en Power Apps, sont débutants totaux sur Azure et ne peuvent pas déployer la partie infrastructure Azure de manière autonome. Actuellement, ils doivent faire appel au responsable technique pour chaque déploiement, ce qui crée un goulot d'étranglement. Un déploiement manuel prend environ 1 heure, et en cas de problème, les consultants ne savent pas diagnostiquer ou résoudre les erreurs Azure. Le responsable technique doit intervenir systématiquement alors que ce n'est pas son rôle principal.

### Proposed Solution

"Aux petits Oignons" est un fork personnalisé d'OpenCode pour usage entreprise, spécialement adapté aux déploiements Azure de bots Copilot Studio. L'outil fonctionne en CLI et offre :

- **Installation zero-friction** via exe avec auto-update (géré dans projet séparé: deploy-trad-bot-container)
- **Page d'accueil personnalisée** avec message de bienvenue, guide de démarrage, et liste des commandes Azure
- **4 modèles IA pré-configurés** : Claude Sonnet, GPT-4.1 mini, GPT-5 mini, et model-routeur (via Azure AI Foundry)
- **Templates de déploiement Azure** pré-configurés pour Azure Functions + services
- **Configuration entreprise verrouillée** avec standards de sécurité appliqués automatiquement

---

## Requirements

### What Needs to Be Built

#### REQ-1: Fork et Configuration de Base d'OpenCode
- Forker le repository OpenCode (Bun + TypeScript + SolidJS)
- Configurer l'environnement de développement pour personnalisation entreprise
- Renommer le projet en "Aux petits Oignons"
- **Critère d'acceptation :** Build réussi du fork avec branding "Aux petits Oignons"

#### REQ-2: Configuration Multi-Modèles IA
- Conserver Claude Sonnet (déjà configuré)
- Ajouter GPT-4.1 mini via Azure AI Foundry
- Ajouter GPT-5 mini via Azure AI Foundry
- Ajouter model-routeur via Azure AI Foundry
- Interface de sélection de modèle dans la page d'accueil
- **Critère d'acceptation :** Les 4 modèles sont fonctionnels et sélectionnables

#### REQ-3: Page d'Accueil Personnalisée "Aux petits Oignons"
- Interface SolidJS modifiée avec branding entreprise
- Message de bienvenue personnalisé pour l'équipe
- Guide de démarrage rapide (quick start) pour premier déploiement Azure
- Liste contextuelle des commandes disponibles pour déploiements
- Sélecteur de modèle IA (4 options)
- **Critère d'acceptation :** Page d'accueil affichée au lancement avec tous les éléments

#### REQ-4: Configuration Entreprise Verrouillée
- Fichier `enterprise-config.json` non modifiable par les consultants
- Naming conventions Azure (préfixes, suffixes pour resources)
- Tags obligatoires (environment, project, owner, cost-center)
- Security settings (HTTPS only, managed identity, minimal privileges)
- Resource groups et Azure locations autorisés
- **Critère d'acceptation :** Configuration appliquée automatiquement, non contournable

#### REQ-5: Templates de Déploiement Azure
- Templates Bicep pour Azure Functions (Node.js, Python)
- Templates pour services associés (Storage Account, Application Insights, Key Vault)
- Scripts Azure CLI pour déploiement automatisé
- Validation des templates avant déploiement
- **Critère d'acceptation :** Déploiement réussi d'une Azure Function + services via templates

#### REQ-6: Intégration Azure SDK et Automatisation
- Intégration Azure SDK for JavaScript/TypeScript
- Commandes CLI personnalisées pour déploiements (`aux deploy`, `aux status`, etc.)
- Authentification via Azure CLI (az login)
- Validation des credentials et permissions avant déploiement
- Logs détaillés des opérations Azure
- **Critère d'acceptation :** Déploiement automatisé end-to-end fonctionnel

#### REQ-7: Messages d'Erreur et Guidance de Débogage
- Détection et diagnostic automatique des erreurs courantes Azure
- Messages d'erreur clairs et contextuels (en français)
- Suggestions de résolution pour chaque type d'erreur
- Liens vers documentation Azure pertinente
- Mode verbose pour debugging avancé
- **Critère d'acceptation :** Erreurs courantes détectées avec suggestions pertinentes

#### REQ-8: Documentation Utilisateur Intégrée
- Guide de démarrage rapide (Quick Start Guide)
- Exemples de déploiement pas-à-pas
- FAQ sur les erreurs communes
- Troubleshooting guide
- Commandes disponibles et leurs usages
- **Critère d'acceptation :** Documentation accessible via commande `aux help`

### What This Does NOT Include

**Explicitement HORS périmètre pour cette version :**

- **Packaging exe et distribution** - Géré dans projet séparé (deploy-trad-bot-container)
- **Auto-update système** - Déjà implémenté dans projet séparé
- **Déploiement de la partie Power Apps** - Déjà maîtrisée par les consultants
- **Support multi-cloud** (AWS, GCP) - Azure uniquement
- **Interface graphique web avancée** - CLI avec UI simple SolidJS
- **Gestion des utilisateurs/permissions/rôles** - Pas de système d'auth
- **Formation Azure approfondie** - Guidance via IA uniquement
- **Scénarios Azure complexes** - Au-delà de Functions + services standards
- **Monitoring/observabilité avancée** - Logs basiques uniquement
- **Pipeline CI/CD complet** - Déploiement manuel via outil
- **Tests automatisés des déploiements** - Validation manuelle

---

## Technical Approach

### Technology Stack

**Runtime & Core:**
- **Runtime:** Bun 1.3.5 (JavaScript runtime rapide et moderne)
- **Langage:** TypeScript 5.8.2
- **Architecture:** Monorepo avec workspaces

**Frontend:**
- **Framework UI:** SolidJS 1.9.10 (interface web légère)
- **Router:** @solidjs/router 0.15.4
- **Styling:** TailwindCSS 4.1.11
- **Build:** Vite 7.1.4

**Backend:**
- **Framework API:** Hono 4.10.7 (framework web léger)
- **Validation:** Zod 4.1.8

**Azure Integration:**
- **Azure SDK:** @azure/arm-resources, @azure/arm-appservice, @azure/identity
- **Templates:** Bicep (Azure IaC)
- **CLI:** Azure CLI (via child_process)

**AI Models (via Azure AI Foundry):**
- **Claude Sonnet** (déjà configuré)
- **GPT-4.1 mini** (à ajouter)
- **GPT-5 mini** (à ajouter)
- **Model-routeur** (à ajouter)

**Configuration:**
- **Format:** JSON pour enterprise-config
- **Gestion:** Fichiers de config non modifiables en production

**Development:**
- **Package Manager:** Bun
- **Build System:** Turbo (monorepo task runner)
- **Linting:** Prettier 3.6.2

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│          Aux petits Oignons (OpenCode Fork)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │   Frontend (SolidJS)                          │    │
│  │   - Page d'accueil personnalisée              │    │
│  │   - Sélecteur de modèle IA (4 options)        │    │
│  │   - Interface terminal intégrée               │    │
│  │   - Affichage logs et statuts                 │    │
│  └───────────────┬───────────────────────────────┘    │
│                  │                                      │
│  ┌───────────────▼───────────────────────────────┐    │
│  │   Backend (Hono + Bun)                        │    │
│  │   - Routes API pour déploiements              │    │
│  │   - Gestion configuration entreprise          │    │
│  │   - Orchestration Azure SDK                   │    │
│  │   - Logging et error handling                 │    │
│  └───────────────┬───────────────────────────────┘    │
│                  │                                      │
└──────────────────┼──────────────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐
│ Azure   │  │ Azure AI │  │ Azure        │
│ SDK     │  │ Foundry  │  │ Resources    │
│         │  │          │  │              │
│ - ARM   │  │ - Claude │  │ - Functions  │
│ - CLI   │  │ - GPT4.1 │  │ - Storage    │
│ - Bicep │  │ - GPT5   │  │ - AppInsights│
│         │  │ - Router │  │ - KeyVault   │
└─────────┘  └──────────┘  └──────────────┘
```

**Flux de déploiement typique :**

1. **Consultant lance l'outil** → Page d'accueil "Aux petits Oignons"
2. **Sélectionne un modèle IA** → Configuration de la session
3. **Interagit avec l'IA** → Demande guidée pour déploiement Azure
4. **IA génère les paramètres** → Basé sur configuration entreprise verrouillée
5. **Backend exécute templates Bicep** → Via Azure SDK
6. **Déploiement Azure** → Azure Functions + services créés
7. **Feedback et logs** → Affichés dans l'interface avec status
8. **Gestion d'erreurs** → Diagnostic automatique et suggestions de résolution

### Data Model (if applicable)

**Configuration Entreprise (enterprise-config.json) :**

```json
{
  "azure": {
    "subscriptionId": "xxx-xxx-xxx",
    "allowedRegions": ["francecentral", "westeurope"],
    "allowedResourceGroups": ["rg-copilot-prod", "rg-copilot-dev"],
    "namingConventions": {
      "prefix": "aux",
      "separator": "-",
      "suffixes": {
        "function": "func",
        "storage": "st",
        "appInsights": "ai"
      }
    },
    "mandatoryTags": {
      "environment": "prod|dev",
      "project": "copilot-studio",
      "owner": "consultants",
      "costCenter": "IT-001"
    },
    "security": {
      "httpsOnly": true,
      "minTlsVersion": "1.2",
      "useManagedIdentity": true,
      "disablePublicNetworkAccess": false
    }
  },
  "aiModels": [
    {
      "id": "claude-sonnet",
      "name": "Claude Sonnet",
      "endpoint": "https://xxx.openai.azure.com/",
      "deployment": "claude-sonnet-4-5",
      "default": true
    },
    {
      "id": "gpt-4.1-mini",
      "name": "GPT-4.1 Mini",
      "endpoint": "https://xxx.openai.azure.com/",
      "deployment": "gpt-41-mini"
    },
    {
      "id": "gpt-5-mini",
      "name": "GPT-5 Mini",
      "endpoint": "https://xxx.openai.azure.com/",
      "deployment": "gpt-5-mini"
    },
    {
      "id": "model-routeur",
      "name": "Model Routeur",
      "endpoint": "https://xxx.openai.azure.com/",
      "deployment": "model-routeur"
    }
  ]
}
```

**Template Déploiement (Azure Function) :**

Structure Bicep pour déploiement standard :
- Azure Function App (Node.js ou Python)
- Storage Account (required pour Functions)
- Application Insights (monitoring)
- Key Vault (secrets management)
- Managed Identity (sécurité)

### API Design (if applicable)

**Endpoints Backend Hono :**

```typescript
// API Routes pour déploiements Azure
POST   /api/deploy/validate    - Valider configuration avant déploiement
POST   /api/deploy/start       - Démarrer un déploiement Azure
GET    /api/deploy/status/:id  - Status d'un déploiement en cours
POST   /api/deploy/cancel/:id  - Annuler un déploiement
GET    /api/deploy/logs/:id    - Récupérer les logs d'un déploiement

// API Configuration
GET    /api/config/enterprise  - Récupérer la config entreprise (read-only)
GET    /api/config/models      - Liste des modèles IA disponibles
POST   /api/config/model       - Sélectionner un modèle IA

// API Azure Resources
GET    /api/azure/subscriptions - Liste des subscriptions accessibles
GET    /api/azure/resources     - Liste des resources déployées
GET    /api/azure/regions       - Régions Azure autorisées

// API Documentation & Help
GET    /api/help/commands      - Liste des commandes disponibles
GET    /api/help/quickstart    - Guide de démarrage rapide
GET    /api/help/faq           - FAQ
```

**Commandes CLI exposées :**

```bash
# Commandes principales
aux init           # Initialiser l'environnement (az login check)
aux deploy         # Démarrer un déploiement guidé par IA
aux status         # Voir le status des déploiements
aux logs [id]      # Voir les logs d'un déploiement
aux cancel [id]    # Annuler un déploiement en cours

# Commandes de configuration
aux config show    # Afficher la configuration entreprise
aux models list    # Lister les modèles IA disponibles
aux models select  # Changer de modèle IA

# Commandes d'aide
aux help           # Aide générale
aux quickstart     # Guide de démarrage rapide
aux faq            # Questions fréquentes
aux version        # Version de l'outil
```

---

## Implementation Plan

### Stories

**Story 1: Setup Initial et Configuration de Base**
- Forker OpenCode depuis le repo officiel
- Configurer l'environnement de développement (Bun, TypeScript)
- Renommer le projet en "Aux petits Oignons"
- Nettoyer les fonctionnalités non nécessaires
- Build et test du fork de base
- **Effort estimé :** 2 jours

**Story 2: Configuration Multi-Modèles IA**
- Créer le système de configuration pour 4 modèles IA
- Intégrer GPT-4.1 mini via Azure AI Foundry
- Intégrer GPT-5 mini via Azure AI Foundry
- Intégrer model-routeur via Azure AI Foundry
- Tester chaque modèle avec des prompts de déploiement Azure
- **Effort estimé :** 3 jours

**Story 3: Page d'Accueil Personnalisée**
- Modifier l'interface SolidJS existante
- Créer le composant page d'accueil "Aux petits Oignons"
- Ajouter message de bienvenue personnalisé
- Implémenter guide de démarrage rapide
- Ajouter liste des commandes disponibles
- Créer sélecteur de modèle IA (4 options)
- **Effort estimé :** 3 jours

**Story 4: Configuration Entreprise Verrouillée**
- Créer le schéma `enterprise-config.json`
- Implémenter le système de lecture de config (read-only)
- Définir naming conventions Azure
- Définir tags obligatoires
- Définir security settings
- Valider que la config n'est pas modifiable par utilisateurs
- **Effort estimé :** 2 jours

**Story 5: Templates de Déploiement Azure**
- Créer templates Bicep pour Azure Function (Node.js)
- Créer templates Bicep pour Azure Function (Python)
- Créer templates pour Storage Account
- Créer templates pour Application Insights
- Créer templates pour Key Vault
- Ajouter validation des templates
- **Effort estimé :** 4 jours

**Story 6: Intégration Azure SDK et Automatisation**
- Intégrer Azure SDK (@azure/arm-resources, @azure/identity)
- Implémenter authentification via Azure CLI
- Créer les endpoints API Hono pour déploiements
- Implémenter orchestration de déploiement Bicep
- Créer les commandes CLI (`aux deploy`, `aux status`, etc.)
- Ajouter validation credentials et permissions
- Implémenter logging des opérations Azure
- **Effort estimé :** 5 jours

**Story 7: Messages d'Erreur et Guidance de Débogage**
- Implémenter détection des erreurs Azure courantes
- Créer système de messages d'erreur contextuels en français
- Ajouter suggestions de résolution pour chaque type d'erreur
- Intégrer liens vers documentation Azure
- Implémenter mode verbose pour debugging
- Tester avec scénarios d'erreurs réels
- **Effort estimé :** 3 jours

**Story 8: Documentation Utilisateur Intégrée**
- Rédiger Quick Start Guide
- Créer exemples de déploiement pas-à-pas
- Rédiger FAQ sur erreurs communes
- Créer Troubleshooting Guide
- Documenter toutes les commandes CLI
- Intégrer documentation dans `aux help`
- **Effort estimé :** 2 jours

**Story 9: Tests avec Consultants Pilotes**
- Sélectionner 1-2 consultants pilotes
- Session de formation initiale
- Tests de déploiements réels Azure
- Collecte de feedback utilisateur
- Corrections bugs et ajustements UX
- Validation des critères d'acceptation
- **Effort estimé :** 3 jours

**Total estimé : ~27 jours de développement**

### Development Phases

**Phase 1 : Semaines 1-2 - Foundation & Setup**
- Story 1: Setup Initial (2j)
- Story 2: Multi-Modèles IA (3j)
- Story 4: Configuration Entreprise (2j)
- Story 5: Templates Azure (début - 2j)

**Phase 2 : Semaines 3-4 - Core Development**
- Story 5: Templates Azure (fin - 2j)
- Story 3: Page d'Accueil (3j)
- Story 6: Azure SDK Integration (5j)

**Phase 3 : Semaine 5 - Polish & Documentation**
- Story 7: Messages d'Erreur (3j)
- Story 8: Documentation (2j)

**Phase 4 : Semaine 6 - Testing & Launch**
- Story 9: Tests Pilotes (3j)
- Packaging final et déploiement

---

## Acceptance Criteria

**Le projet sera considéré comme terminé et prêt pour lancement quand :**

### Critères Fonctionnels

- [ ] **Fork OpenCode opérationnel** avec branding "Aux petits Oignons"
- [ ] **4 modèles IA configurés et fonctionnels** (Claude Sonnet, GPT-4.1 mini, GPT-5 mini, model-routeur)
- [ ] **Page d'accueil personnalisée** s'affiche au lancement avec tous les éléments (bienvenue, guide, commandes, sélecteur modèle)
- [ ] **Configuration entreprise verrouillée** appliquée automatiquement et non modifiable
- [ ] **Déploiement Azure Functions** réussi via templates Bicep pour Node.js et Python
- [ ] **Déploiement services associés** réussi (Storage, AppInsights, KeyVault)
- [ ] **Commandes CLI fonctionnelles** : `aux init`, `aux deploy`, `aux status`, `aux logs`, `aux help`
- [ ] **Authentification Azure** via `az login` fonctionnelle
- [ ] **Messages d'erreur clairs** en français avec suggestions de résolution
- [ ] **Documentation intégrée** accessible via `aux help` et complète

### Critères de Qualité

- [ ] **Temps de déploiement** : <20 minutes pour déploiement standard (Function + services)
- [ ] **Taux de succès** : >90% des déploiements réussissent sans intervention manuelle
- [ ] **Build sans erreurs** : `bun run typecheck` passe sans erreur
- [ ] **Tests pilotes réussis** : 2 consultants peuvent déployer de manière autonome
- [ ] **Feedback utilisateur positif** : Consultants considèrent l'outil utile et utilisable

### Critères de Sécurité et Conformité

- [ ] **Standards de sécurité appliqués** : HTTPS only, Managed Identity, TLS 1.2+
- [ ] **Nomenclature standardisée** : Préfixes, suffixes, tags obligatoires appliqués
- [ ] **Credentials sécurisés** : Pas de secrets en dur, utilisation Azure CLI auth
- [ ] **Logs et audit** : Toutes les opérations Azure loggées pour traçabilité

---

## Non-Functional Requirements

### Performance

**Exigences de performance :**

- **Temps de déploiement cible :** <20 minutes pour un déploiement complet (Azure Function + Storage + AppInsights + KeyVault)
  - Réduction de 3x par rapport au déploiement manuel (60 min → 20 min)

- **Temps de réponse UI :** <200ms pour affichage de la page d'accueil

- **Temps de validation :** <5 secondes pour validation de credentials et permissions Azure

- **Logs en temps réel :** Affichage des logs de déploiement avec délai <2 secondes

- **Scalabilité :** Support de 5 consultants déployant en parallèle sans dégradation

### Security

**Exigences de sécurité :**

- **Authentification Azure :** Utilisation exclusive d'Azure CLI (`az login`), pas de gestion manuelle de credentials
  - Validation des credentials avant tout déploiement
  - Timeout de session après 1h d'inactivité

- **Secrets Management :**
  - Aucun secret stocké en clair dans le code
  - Utilisation de Key Vault pour tous les secrets applicatifs
  - Variables d'environnement pour configuration sensible

- **Standards de sécurité Azure appliqués automatiquement :**
  - HTTPS uniquement (pas de HTTP)
  - TLS version minimum : 1.2
  - Managed Identity activée par défaut
  - Public network access désactivé quand possible

- **Configuration verrouillée :**
  - Fichier `enterprise-config.json` en read-only
  - Impossibilité de contourner les standards de sécurité
  - Validation des paramètres avant déploiement

- **Audit et traçabilité :**
  - Logging de toutes les opérations Azure (déploiements, modifications, suppressions)
  - Logs horodatés avec identité utilisateur (Azure identity)
  - Rétention des logs : 90 jours minimum

### Other

**Autres exigences non-fonctionnelles :**

- **Compatibilité :**
  - Windows 10/11 uniquement (environnement cible)
  - Bun runtime version 1.3.5+
  - Azure CLI version 2.50+
  - Node.js pour Azure Functions : 18 LTS, 20 LTS
  - Python pour Azure Functions : 3.9, 3.10, 3.11

- **Disponibilité :**
  - Outil disponible offline après installation (pas de dépendance cloud pour l'UI)
  - Déploiements nécessitent connexion internet et accès Azure

- **Maintenabilité :**
  - Code TypeScript typé (strict mode)
  - Architecture modulaire (monorepo)
  - Documentation code (JSDoc/TSDoc)
  - Logs structurés pour debugging

- **Utilisabilité :**
  - Interface en français
  - Messages d'erreur clairs et actionnables
  - Aide contextuelle accessible via `aux help`
  - Temps d'apprentissage : <1h pour premier déploiement réussi

- **Monitoring (basique) :**
  - Logs des déploiements stockés localement
  - Pas de télémétrie utilisateur (respect RGPD)
  - Metrics Azure visibles via Application Insights des ressources déployées

---

## Dependencies

**Dépendances Techniques :**

1. **OpenCode (upstream) :**
   - Repository source : https://github.com/anomalyco/opencode
   - Maintien de la compatibilité avec les mises à jour upstream
   - Gestion des merge conflicts lors des syncs

2. **Azure Subscriptions :**
   - Subscription Azure active avec permissions suffisantes
   - Souscriptions Azure AI Foundry pour les 4 modèles IA :
     - Claude Sonnet (déjà actif)
     - GPT-4.1 mini (à configurer)
     - GPT-5 mini (à configurer)
     - Model-routeur (à configurer)

3. **Azure CLI :**
   - Version 2.50+ installée sur postes consultants
   - Authentification `az login` configurée

4. **Runtime et Outils :**
   - Bun 1.3.5+ installé (géré via packaging exe)
   - Node.js/Python runtimes pour tests locaux de Functions

5. **Packaging et Distribution :**
   - Projet séparé : deploy-trad-bot-container
   - Système d'auto-update fonctionnel
   - Pipeline de build pour génération exe

**Dépendances Organisationnelles :**

1. **Credentials et Permissions Azure :**
   - Les 5 consultants doivent avoir des comptes Azure AD
   - Permissions de déploiement sur resource groups cibles
   - Rôles Azure : Contributor minimum sur RG, Reader sur Subscription

2. **Infrastructure Azure Pré-existante :**
   - Subscriptions Azure provisionnées
   - Resource Groups créés (prod et dev)
   - Networking et firewall rules configurés si applicable

3. **Validation Sécurité :**
   - Standards de sécurité entreprise validés
   - Configuration entreprise approuvée par équipe sécurité
   - Audit des templates Bicep

4. **Support et Maintenance :**
   - Responsable technique disponible pour support niveau 2
   - Process d'escalade défini pour cas complexes
   - Planning de maintenance et updates

---

## Risks & Mitigation

### Risk 1: Résistance au Changement - Adoption CLI

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Mitigation :**
  - Formation progressive avec démos concrètes (gain de temps 60→20min)
  - Démarrage avec 1-2 consultants pilotes motivés
  - Assistance IA très guidée et messages clairs
  - Support intensif premières semaines

### Risk 2: Modèle IA Insuffisant

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Mitigation :**
  - Tests approfondis avec scénarios réels avant lancement
  - Possibilité de revenir à Claude Sonnet si modèles plus simples insuffisants
  - Enrichissement des prompts système
  - Système de feedback utilisateur

### Risk 3: Scénarios Azure Non Couverts

- **Probabilité :** Moyenne
- **Impact :** Moyen
- **Mitigation :**
  - Scope clairement défini (Functions + services standards)
  - Process d'escalade vers responsable technique
  - Enrichissement progressif des templates
  - Communication transparente sur couverture 90%

### Risk 4: Problèmes Credentials/Sécurité Azure

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Mitigation :**
  - Azure CLI auth standard (az login)
  - Documentation claire sur setup permissions
  - Validation automatique credentials
  - Configuration sécurité verrouillée
  - Audit et logging toutes opérations

### Risk 5: Dépendance Persistante Responsable Technique

- **Probabilité :** Élevée
- **Impact :** Moyen
- **Mitigation :**
  - Communication claire sur transition et attentes
  - Support initial intensif puis réduction progressive
  - Valorisation utilisation outil et succès
  - Feedback régulier sur progrès

### Risk 6: Sync Complexe avec OpenCode Upstream

- **Probabilité :** Moyenne
- **Impact :** Moyen
- **Mitigation :**
  - Minimiser les modifications du code core OpenCode
  - Isoler les personnalisations dans modules dédiés
  - Documentation des modifications apportées
  - Tests de régression après chaque sync upstream

---

## Timeline

**Target Completion:** Fin Semaine 6 (1,5 mois à partir du démarrage)

**Date de début estimée :** 2026-01-20
**Date de lancement estimée :** 2026-03-03

**Milestones:**

**Semaine 1-2 : Foundation & Setup (2026-01-20 → 2026-01-31)**
- Finaliser les spécifications techniques détaillées ✓
- Forker OpenCode et setup environnement de dev
- Configurer les 4 modèles IA sur Azure AI Foundry
- Créer configuration entreprise verrouillée
- Démarrer création templates Bicep Azure

**Semaine 3-4 : Core Development (2026-02-03 → 2026-02-14)**
- Finaliser templates Azure (Functions, Storage, AppInsights, KeyVault)
- Développer page d'accueil personnalisée SolidJS
- Intégrer Azure SDK et automatisation déploiements
- Créer commandes CLI personnalisées
- Implémenter système d'authentification Azure CLI

**Semaine 5 : Polish & Documentation (2026-02-17 → 2026-02-21)**
- Implémenter messages d'erreur clairs et debugging
- Rédiger documentation utilisateur complète
- Tests internes par responsable technique
- Corrections bugs identifiés
- Amélioration UX basée sur tests

**Semaine 6 : Testing & Launch (2026-02-24 → 2026-03-03)**
- Tests pilotes avec 1-2 consultants volontaires
- Collecte feedback et ajustements finaux
- Packaging final (coordination avec projet exe)
- Session de formation équipe complète (5 consultants)
- Lancement officiel "Aux petits Oignons"

**Post-lancement : Support & Amélioration (2026-03-04 →)**
- Monitoring adoption et métriques de succès
- Support réactif pendant premières semaines
- Ajustements basés sur retours terrain
- Enrichissement templates selon besoins

---

## Approval

**Reviewed By:**
- [ ] eric (Author & Responsable Technique)
- [ ] Technical Lead
- [ ] Product Owner (si applicable)

**Approbations Nécessaires :**
- [ ] Configuration entreprise validée par équipe sécurité
- [ ] Templates Azure validés par architecture team
- [ ] Budget Azure AI Foundry (4 modèles) approuvé

---

## Next Steps

### Phase 4: Implementation

**Pour ce projet de Level 1 (1-10 stories) :**

1. **Approuver ce Tech Spec**
   - Revue par les stakeholders
   - Validation des choix techniques
   - Approbation du timeline

2. **Sprint Planning** - Recommandé
   - Exécuter `/sprint-planning` pour organiser les 9 stories
   - Prioriser les fonctionnalités
   - Planifier les 6 sprints hebdomadaires

3. **Créer les Stories**
   - Utiliser `/create-story` pour chaque story
   - Détailler les critères d'acceptation
   - Assigner les efforts

4. **Développement**
   - Utiliser `/dev-story` pour implémenter chaque story
   - Suivre le plan de développement en 4 phases
   - Tests continus à chaque story

5. **Tests et Validation**
   - Tests pilotes avec consultants
   - Validation des critères d'acceptation
   - Corrections et ajustements

6. **Lancement**
   - Formation équipe
   - Déploiement à tous les consultants
   - Support actif post-lancement

---

**Ce document a été créé avec BMAD Method v6 - Phase 2 (Planning)**

*Pour continuer : Exécutez `/workflow-status` pour voir votre progression et le prochain workflow recommandé.*
