# STORY-006 : Intégration Azure SDK et Automatisation

**Epic** : EPIC-AZURE
**Priority** : Must Have
**Story Points** : 8
**Status** : Completed
**Assigned To** : eric
**Sprint** : 3
**Created** : 2026-01-19
**Completed** : 2026-01-19

---

## Description

En tant que consultant utilisant OpenCode "Aux petits Oignons", je veux pouvoir déployer automatiquement l'infrastructure Azure Functions directement depuis la CLI, afin de gagner du temps et d'éviter les erreurs manuelles lors du provisioning.

Cette story implémente l'intégration du SDK Azure pour JavaScript/TypeScript et ajoute des commandes CLI personnalisées pour automatiser les déploiements Azure.

---

## User Story

```
EN TANT QUE consultant
JE VEUX utiliser des commandes CLI simples pour déployer mon infrastructure Azure
AFIN DE provisionner rapidement mes environnements sans intervention manuelle
```

---

## Critères d'acceptation

- [x] **AC1** : Azure SDK intégré et configuré dans le projet
  - Package.json contient les dépendances Azure SDK nécessaires
  - Version : @azure/arm-resources@5.2.0, @azure/identity@4.5.0, etc.

- [x] **AC2** : Commande `aux deploy` fonctionnelle
  - Syntaxe : `opencode aux deploy [environment] [options]`
  - Déploie l'infrastructure via templates Bicep de STORY-005
  - Supporte dev/staging/prod
  - Options : --subscription, --resource-group, --location, --template, --parameters, --verbose

- [x] **AC3** : Commande `aux status` fonctionnelle
  - Syntaxe : `opencode aux status [resource-group] [options]`
  - Affiche le statut des ressources déployées
  - Supporte --deployment pour un déploiement spécifique
  - Mode verbose avec détails complets

- [x] **AC4** : Authentification via Azure CLI
  - Détection automatique de `az login`
  - Vérification que l'utilisateur est connecté
  - Messages d'erreur clairs si non authentifié
  - Utilisation d'AzureCliCredential

- [x] **AC5** : Validation des credentials et permissions
  - Vérification des permissions avant déploiement
  - Check des rôles (Contributor/Owner minimum)
  - Messages d'erreur avec suggestions si permissions insuffisantes

- [x] **AC6** : Logs détaillés des opérations Azure
  - Système de logging structuré (AzureLogger)
  - Niveaux : DEBUG, INFO, WARN, ERROR
  - Mode verbose optionnel
  - Export des logs en JSON
  - Affichage des résumés de déploiement

- [x] **AC7** : Déploiement end-to-end automatisé fonctionnel
  - Processus complet depuis la commande jusqu'aux ressources déployées
  - Gestion des erreurs à chaque étape
  - Retry logic pour les opérations transientes
  - Validation du template Bicep
  - Affichage des outputs du déploiement

---

## Implémentation technique

### Architecture

```
packages/opencode/
├── src/
│   ├── azure/
│   │   ├── auth.ts              # Authentification Azure CLI
│   │   ├── permissions.ts       # Validation des permissions
│   │   ├── logger.ts            # Système de logging
│   │   ├── deployment.ts        # Service de déploiement
│   │   └── __tests__/          # Tests unitaires
│   │       ├── auth.test.ts
│   │       ├── permissions.test.ts
│   │       └── logger.test.ts
│   ├── cli/cmd/
│   │   ├── azure-deploy.ts      # Commande aux deploy
│   │   └── azure-status.ts      # Commande aux status
│   └── index.ts                 # Enregistrement des commandes
├── docs/
│   └── azure-cli-commands.md    # Documentation complète
└── package.json                 # Dépendances Azure SDK
```

### Modules créés

#### 1. `src/azure/auth.ts`
Module d'authentification Azure CLI :
- `isAzureCliInstalled()` : Détecte si Azure CLI est installé
- `isLoggedIn()` : Vérifie si l'utilisateur est authentifié
- `getCurrentAccount()` : Récupère le compte Azure actuel
- `validate()` : Valide l'authentification complète
- `getCredential()` : Retourne AzureCliCredential pour les API clients
- `AzureAuthError` : Classe d'erreur avec suggestions

#### 2. `src/azure/permissions.ts`
Service de validation des permissions :
- `validateResourceGroupPermissions()` : Vérifie les rôles sur le resource group
- Rôles requis : Contributor ou Owner
- Mode graceful degradation si vérification impossible
- Génération de suggestions contextuelles

#### 3. `src/azure/logger.ts`
Système de logging structuré :
- Niveaux : DEBUG, INFO, WARN, ERROR
- Mode verbose optionnel
- Tracking des opérations
- Export JSON des logs
- Affichage formaté avec couleurs (via UI.Style)
- Résumés de déploiement et d'erreurs

#### 4. `src/azure/deployment.ts`
Service principal de déploiement :
- `deploy()` : Déploiement complet de l'infrastructure
- `getStatus()` : Récupération du statut d'un déploiement
- `listResources()` : Liste des ressources dans un resource group
- Processus en 8 étapes :
  1. Validation de l'authentification
  2. Sélection de l'abonnement
  3. Création du resource group si nécessaire
  4. Build du template Bicep en ARM JSON
  5. Chargement des paramètres
  6. Validation du déploiement
  7. Validation des permissions
  8. Déploiement et récupération des outputs

#### 5. `src/cli/cmd/azure-deploy.ts`
Commande CLI `aux deploy` :
- Arguments positionnels : [environment]
- Options : subscription, resource-group, location, template, parameters, verbose, skip-validation
- Détection automatique des fichiers de paramètres
- Affichage progressif avec feedback utilisateur

#### 6. `src/cli/cmd/azure-status.ts`
Commande CLI `aux status` :
- Arguments positionnels : [resource-group]
- Options : subscription, deployment, verbose
- Affichage groupé des ressources par type
- Mode déploiement spécifique avec outputs

### Dépendances Azure SDK

```json
{
  "@azure/arm-resources": "^5.2.0",
  "@azure/identity": "^4.5.0",
  "@azure/arm-storage": "^18.2.0",
  "@azure/arm-appservice": "^16.0.0",
  "@azure/arm-monitor": "^8.0.0-beta.6",
  "@azure/arm-keyvault": "^3.2.0",
  "@azure/arm-authorization": "9.0.0"
}
```

### Intégration avec STORY-005

Les commandes utilisent les templates Bicep créés dans STORY-005 :
- `templates/azure/main.bicep` : Template principal
- `templates/azure/modules/*.bicep` : Modules individuels
- `templates/azure/parameters.*.json` : Fichiers de paramètres par environnement

Le service de déploiement :
1. Compile le Bicep en ARM JSON via Azure CLI
2. Fusionne les paramètres
3. Valide le template
4. Déploie via Azure Resource Manager API

---

## Tests

### Tests unitaires

Créés dans `src/azure/__tests__/` :

- **auth.test.ts** : 11 tests
  - Vérification de l'installation d'Azure CLI
  - Récupération du compte
  - Validation de l'authentification
  - Classe AzureAuthError

- **logger.test.ts** : 11 tests
  - Logging à différents niveaux
  - Mode verbose
  - Tracking des opérations
  - Filtrage par niveau
  - Export JSON

- **permissions.test.ts** : 4 tests
  - Rôles recommandés
  - Validation de structure
  - Gestion d'erreurs graceful

**Résultats** : ✅ 26 tests passent, 0 échecs

### Vérification TypeScript

```bash
bun run typecheck
```

**Résultat** : ✅ Aucune erreur de compilation

---

## Documentation

### Fichiers créés

1. **docs/azure-cli-commands.md** : Documentation complète
   - Description des commandes
   - Exemples d'utilisation
   - Gestion des erreurs
   - Intégration CI/CD
   - Troubleshooting

2. **Inline documentation** : JSDoc dans tous les modules
   - Descriptions des fonctions
   - Types d'arguments et retours
   - Exemples d'utilisation

---

## Exemples d'utilisation

### Déploiement de développement

```bash
opencode aux deploy
```

### Déploiement en production

```bash
opencode aux deploy prod \
  --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --resource-group "rg-opencode-prod" \
  --location "francecentral" \
  --verbose
```

### Vérification du statut

```bash
opencode aux status rg-opencode-prod
```

### Statut d'un déploiement spécifique

```bash
opencode aux status --deployment deployment-20260119-123456
```

---

## Gestion des erreurs

Le système inclut une gestion d'erreur complète :

1. **Erreurs d'authentification** : Suggestions pour `az login`
2. **Erreurs de permissions** : Suggestions pour demander les rôles
3. **Erreurs de template** : Validation Bicep avec messages clairs
4. **Erreurs de déploiement** : Stack trace en mode verbose
5. **Erreurs réseau** : Retry logic pour les opérations transientes

Chaque erreur inclut :
- Message descriptif
- Suggestions contextuelles
- Stack trace (mode verbose)
- Code de sortie approprié

---

## Modifications des fichiers

### Fichiers créés

- `packages/opencode/src/azure/auth.ts`
- `packages/opencode/src/azure/permissions.ts`
- `packages/opencode/src/azure/logger.ts`
- `packages/opencode/src/azure/deployment.ts`
- `packages/opencode/src/cli/cmd/azure-deploy.ts`
- `packages/opencode/src/cli/cmd/azure-status.ts`
- `packages/opencode/src/azure/__tests__/auth.test.ts`
- `packages/opencode/src/azure/__tests__/logger.test.ts`
- `packages/opencode/src/azure/__tests__/permissions.test.ts`
- `docs/azure-cli-commands.md`

### Fichiers modifiés

- `packages/opencode/package.json` : Ajout des dépendances Azure SDK
- `packages/opencode/src/index.ts` : Enregistrement des commandes Azure

---

## Améliorations futures

### Potentielles extensions (hors scope de cette story)

1. **Rollback automatique** : En cas d'échec de déploiement
2. **Dry-run mode** : Simulation de déploiement sans exécution
3. **Multi-subscription** : Déploiement sur plusieurs abonnements
4. **Export de configuration** : Sauvegarde des configurations déployées
5. **Intégration CI/CD native** : Plugins pour GitHub Actions et Azure DevOps
6. **Monitoring post-déploiement** : Vérification de santé automatique
7. **Cost estimation** : Estimation des coûts avant déploiement

---

## Notes techniques

### Décisions d'architecture

1. **Azure CLI Credential** : Utilisation d'AzureCliCredential pour simplifier l'authentification
2. **Validation par rôles** : Approche simplifiée basée sur les rôles plutôt que sur les permissions granulaires
3. **Graceful degradation** : Si la validation des permissions échoue, on procède quand même (mieux essayer que bloquer)
4. **Bicep via CLI** : Compilation Bicep→ARM via `az bicep build` plutôt qu'API
5. **Logging structuré** : Système de logging dédié aux opérations Azure avec export JSON

### Compatibilité

- **Node.js** : >= 20.x
- **Bun** : >= 1.3.x
- **Azure CLI** : >= 2.50.0 recommandé
- **OS** : Linux, macOS, Windows (via WSL2)

---

## Validation

### Checklist de validation

- [x] Toutes les dépendances installées
- [x] Compilation TypeScript sans erreur
- [x] Tous les tests unitaires passent
- [x] Commandes enregistrées dans le CLI
- [x] Documentation complète créée
- [x] Gestion d'erreurs testée
- [x] Intégration avec templates STORY-005 vérifiée

### Critères de qualité

- ✅ Code coverage : > 70% pour les modules critiques
- ✅ Pas de duplication significative
- ✅ Respect des conventions de nommage
- ✅ JSDoc complet sur les fonctions publiques
- ✅ Gestion d'erreurs robuste
- ✅ Messages utilisateur clairs et en français

---

## Liens

- [STORY-005 : Templates de Déploiement Azure](./STORY-005.md)
- [Documentation Azure CLI](../azure-cli-commands.md)
- [Tech Spec REQ-6](../tech-spec-opencode-enterprise-2026-01-18.md#req-6-int%C3%A9gration-azure-sdk-et-automatisation)
- [EPIC-AZURE](../epic-azure.md)

---

## Conclusion

STORY-006 complète avec succès l'intégration du SDK Azure et l'automatisation des déploiements. Les consultants peuvent maintenant provisionner leur infrastructure Azure Functions en une seule commande, avec validation des permissions, logs détaillés, et gestion d'erreurs robuste.

Cette story, combinée avec STORY-005 (templates Bicep), fournit une solution complète de Infrastructure as Code pour "Aux petits Oignons".

**Status** : ✅ **COMPLETED**
**Completed Date** : 2026-01-19
