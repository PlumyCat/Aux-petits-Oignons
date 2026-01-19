# STORY-008: Documentation Utilisateur Intégrée

**Status:** ✅ Completed
**Sprint:** Sprint 5
**Epic:** EPIC-DOCS (Documentation)
**Story Points:** 3
**Assignee:** Developer
**Created:** 2026-01-19
**Completed:** 2026-01-19

## 📋 Description

Implémentation d'une documentation utilisateur intégrée accessible via la commande `aux help`, permettant aux consultants de démarrer rapidement et de résoudre les problèmes courants sans chercher dans des documents externes.

## 🎯 Objectifs

Faciliter l'adoption et l'utilisation d'OpenCode Azure en fournissant une documentation complète, claire et facilement accessible directement depuis la CLI.

## 📝 Exigences Techniques (REQ-8)

### REQ-8.1: Guide de démarrage rapide
- ✅ Guide en 4 étapes (5 minutes)
- ✅ Vérification des prérequis
- ✅ Connexion Azure
- ✅ Premier déploiement
- ✅ Vérification du statut
- ✅ Prochaines étapes suggérées

### REQ-8.2: Exemples de déploiement pas-à-pas
- ✅ 5 scénarios de déploiement documentés
- ✅ Commandes complètes avec tous les paramètres
- ✅ Explication de chaque option
- ✅ Tips et bonnes pratiques inclus

### REQ-8.3: FAQ sur les erreurs communes
- ✅ 8 erreurs fréquentes couvertes
- ✅ Solutions détaillées pour chaque erreur
- ✅ Commandes de résolution prêtes à l'emploi
- ✅ Liens vers aide supplémentaire

### REQ-8.4: Troubleshooting guide
- ✅ Processus de dépannage en 6 étapes
- ✅ Checklist complète de vérification
- ✅ Commandes de diagnostic
- ✅ Ressources de support

### REQ-8.5: Commandes disponibles
- ✅ Documentation complète des 3 commandes Azure
- ✅ Tous les paramètres et options expliqués
- ✅ Exemples d'usage multiples
- ✅ Valeurs par défaut indiquées

### REQ-8.6: Critère d'acceptation
- ✅ Documentation accessible via `opencode aux help`
- ✅ 6 topics disponibles (quickstart, deploy, status, errors, troubleshoot, commands)
- ✅ Navigation claire entre topics
- ✅ Formatage visuel avec couleurs et sections

## 🏗️ Architecture

### Nouvelle Commande CLI

**Fichier:** `packages/opencode/src/cli/cmd/azure-help.ts`

```typescript
export const AzureHelpCommand = cmd({
  command: "aux help [topic]",
  describe: "Display Azure deployment documentation",
  builder: (yargs: Argv) => {
    return yargs
      .positional("topic", {
        describe: "Specific help topic (default: show topic list)",
        type: "string",
        choices: ["quickstart", "deploy", "status", "errors", "troubleshoot", "commands"],
      })
  },
  handler: async (args) => {
    const topic = args.topic

    // Dispatch to appropriate help function
    switch (topic) {
      case "quickstart": showQuickStart(); break
      case "deploy": showDeploymentExamples(); break
      case "status": showStatusHelp(); break
      case "errors": showErrorsFAQ(); break
      case "troubleshoot": showTroubleshooting(); break
      case "commands": showCommands(); break
      default: showGeneralHelp()
    }
  },
})
```

### Structure de la Documentation

1. **showGeneralHelp()** - Page d'accueil avec liste des topics
2. **showQuickStart()** - Guide de démarrage rapide (5 min)
3. **showDeploymentExamples()** - 5 exemples de déploiement
4. **showStatusHelp()** - Guide d'utilisation de `aux status`
5. **showErrorsFAQ()** - 8 erreurs communes + solutions
6. **showTroubleshooting()** - 6 étapes de dépannage
7. **showCommands()** - Référence complète des commandes

## 📁 Fichiers Modifiés

### Nouveau Fichier
- `packages/opencode/src/cli/cmd/azure-help.ts` (548 lignes)
  - 6 fonctions d'affichage de documentation
  - Formatage visuel avec UI.Style
  - Contenu en français
  - Navigation entre topics

### Fichiers Modifiés
1. `packages/opencode/src/index.ts`
   - Import `AzureHelpCommand`
   - Enregistrement de la commande dans yargs

## 📚 Contenu de la Documentation

### 1. Guide de Démarrage Rapide (quickstart)

**Durée:** 5 minutes

**Étapes:**
1. **Vérifier les prérequis**
   - Azure CLI installé
   - Connecté à Azure
   - OpenCode installé

2. **Connexion Azure**
   ```bash
   az login
   az account list --output table
   az account set --subscription <SUBSCRIPTION_ID>
   ```

3. **Déployer en dev**
   ```bash
   opencode aux deploy
   ```
   Crée automatiquement:
   - Resource group rg-opencode-dev
   - Function App
   - Storage Account
   - Application Insights

4. **Vérifier le déploiement**
   ```bash
   opencode aux status
   ```

**Prochaines étapes suggérées:**
- Déploiement en staging/prod
- Consultation des logs
- Aide sur les erreurs

### 2. Exemples de Déploiement (deploy)

**5 Scénarios documentés:**

1. **Déploiement Dev (défaut)**
   ```bash
   opencode aux deploy
   ```
   - Environment: dev
   - Resource Group: rg-opencode-dev
   - Région: westeurope

2. **Déploiement Staging**
   ```bash
   opencode aux deploy staging
   ```
   - Resource Group: rg-opencode-staging
   - Paramètres: templates/azure/parameters/staging.parameters.json

3. **Déploiement Production**
   ```bash
   opencode aux deploy prod
   ```
   - Resource Group: rg-opencode-prod
   - Nécessite confirmation

4. **Déploiement avec Options**
   ```bash
   opencode aux deploy \
     --resource-group rg-custom \
     --location eastus \
     --subscription <ID> \
     --verbose
   ```

5. **Template Personnalisé**
   ```bash
   opencode aux deploy \
     --template ./custom/main.bicep \
     --parameters ./custom/params.json
   ```

### 3. FAQ Erreurs Communes (errors)

**8 Erreurs fréquentes:**

1. **"Not logged in to Azure"**
   - Solution: `az login`

2. **"Permission denied" / "Unauthorized"**
   - Cause: Permissions insuffisantes
   - Solution: Demander rôle Contributor

3. **"Resource name already exists"**
   - Cause: Nom non unique
   - Solutions:
     - Changer applicationName
     - Ajouter suffixe unique
     - Supprimer ancienne ressource

4. **"Quota exceeded" / "Rate limited"**
   - Solutions:
     - Attendre et réessayer
     - Demander augmentation quota
     - Nettoyer ressources

5. **"Bicep not found"**
   - Solution: `az bicep install`

6. **"Deployment failed"**
   - Solutions:
     - Consulter logs: `aux status --deployment`
     - Mode verbose: `aux deploy --verbose`
     - Portail Azure
     - Vérifier dépendances

7. **"Network error" / "Timeout"**
   - Causes: Réseau, proxy, firewall
   - Solutions:
     - Vérifier Internet
     - Configurer proxy (HTTP_PROXY)
     - Vérifier firewall
     - Azure status

8. **"Template validation failed"**
   - Solutions:
     - Valider: `az bicep build`
     - Vérifier parameters.json
     - Vérifier types de paramètres

### 4. Guide de Dépannage (troubleshoot)

**6 Étapes systématiques:**

1. **Vérifier l'Authentification**
   ```bash
   az account show
   ```
   Si erreur: `az login`

2. **Vérifier les Permissions**
   ```bash
   az role assignment list --assignee <email>
   ```
   Rôles nécessaires: Contributor ou Owner

3. **Vérifier les Prérequis**
   ```bash
   az --version
   az bicep version
   ```
   Si Bicep manquant: `az bicep install`

4. **Mode Verbose**
   ```bash
   opencode aux deploy --verbose
   ```
   Affiche: étapes détaillées, debug, stack traces

5. **Consulter les Logs Azure**
   - Via CLI: `az deployment group show`
   - Via Portail: Resource Group > Deployments

6. **Nettoyer et Réessayer**
   ```bash
   az deployment group delete --name <deployment-name>
   opencode aux deploy
   ```

**Checklist Complète:**
- □ Azure CLI installé et à jour
- □ Bicep installé
- □ Connecté à Azure
- □ Abonnement sélectionné
- □ Permissions Contributor
- □ Templates Bicep valides
- □ Paramètres corrects
- □ Noms de ressources uniques
- □ Quota disponible
- □ Connexion réseau stable

### 5. Guide Status (status)

**4 Modes d'utilisation:**

1. **Status de Base**
   ```bash
   opencode aux status
   ```
   Affiche toutes les ressources dans rg-opencode-dev

2. **Resource Group Spécifique**
   ```bash
   opencode aux status rg-opencode-prod
   ```

3. **Déploiement Spécifique**
   ```bash
   opencode aux status --deployment opencode-123456
   ```
   Affiche:
   - État du déploiement
   - Date et durée
   - Outputs

4. **Mode Verbose**
   ```bash
   opencode aux status --verbose
   ```
   Affiche:
   - Localisation
   - IDs des ressources
   - Détails de configuration

### 6. Référence Commandes (commands)

**Documentation complète de 3 commandes:**

#### `opencode aux deploy [environment]`

**Arguments:**
- `environment`: dev, staging ou prod (défaut: dev)

**Options:**
- `-s, --subscription`: Subscription ID Azure
- `-g, --resource-group`: Nom du resource group
- `-l, --location`: Région Azure (défaut: westeurope)
- `-t, --template`: Chemin vers template Bicep
- `-p, --parameters`: Chemin vers paramètres
- `-v, --verbose`: Mode verbose
- `--skip-validation`: Skip validation permissions

**Exemples:**
```bash
opencode aux deploy
opencode aux deploy prod --verbose
opencode aux deploy --resource-group rg-custom
```

#### `opencode aux status [resource-group]`

**Arguments:**
- `resource-group`: Nom du resource group (optionnel)

**Options:**
- `-s, --subscription`: Subscription ID
- `-d, --deployment`: Nom du déploiement
- `-v, --verbose`: Mode verbose

**Exemples:**
```bash
opencode aux status
opencode aux status rg-opencode-prod
opencode aux status --deployment opencode-123456
```

#### `opencode aux help [topic]`

**Topics:**
- `quickstart`: Guide démarrage rapide
- `deploy`: Exemples déploiement
- `status`: Guide commande status
- `errors`: FAQ erreurs communes
- `troubleshoot`: Guide dépannage
- `commands`: Référence commandes

**Exemples:**
```bash
opencode aux help
opencode aux help quickstart
opencode aux help errors
```

## 💡 Fonctionnalités Clés

### 1. Navigation Intuitive
Structure logique avec 6 topics couvrant tous les aspects :
- Démarrage rapide pour les nouveaux utilisateurs
- Exemples pratiques pour le déploiement
- FAQ pour résolution rapide des problèmes
- Troubleshooting pour diagnostic approfondi
- Référence complète des commandes

### 2. Formatage Visuel
Utilisation de UI.Style pour un affichage clair :
- 🚀 Emojis pour les sections importantes
- **Titres en gras** pour la structure
- Couleurs pour les différents types de contenu
- Indentation pour la lisibilité

### 3. Commandes Prêtes à l'Emploi
Toutes les commandes sont copiables-collables :
- Pas de placeholders inutiles
- Exemples réalistes
- Options par défaut indiquées

### 4. Progression Pédagogique
Documentation structurée pour un apprentissage progressif :
- Quick Start pour débuter (5 min)
- Exemples pour approfondir
- FAQ pour résoudre les problèmes
- Troubleshooting pour les cas complexes

### 5. Complémentarité avec ErrorAnalyzer
La documentation s'intègre avec STORY-007 :
- FAQ mentionne ErrorAnalyzer
- Troubleshooting renvoie vers --verbose
- Cohérence des messages d'erreur

## 📊 Métriques

- **Lignes de code:** 548 lignes
- **Fonctions de documentation:** 7
- **Topics disponibles:** 6
- **Erreurs FAQ:** 8
- **Étapes troubleshooting:** 6
- **Exemples déploiement:** 5
- **Commandes documentées:** 3
- **Temps de développement:** ~2 heures

## 🚀 Impact Utilisateur

### Avant
- Pas de documentation intégrée
- Consultation de docs externes nécessaire
- Temps de démarrage long
- Résolution d'erreurs difficile

### Après
- Documentation complète via `aux help`
- Démarrage en 5 minutes
- Résolution autonome des problèmes
- Exemples pratiques disponibles
- Navigation intuitive entre topics

### Exemple d'Usage

```bash
# Nouveau consultant découvre OpenCode
$ opencode aux help quickstart

[Affiche le guide de démarrage en 5 minutes]

# Suit les étapes et déploie
$ opencode aux deploy

# Rencontre une erreur
$ opencode aux help errors

[Trouve la solution dans la FAQ]

# Problème complexe
$ opencode aux help troubleshoot

[Suit le processus de dépannage]

# Besoin de référence
$ opencode aux help commands

[Consulte la documentation complète]
```

## ✅ Critères d'Acceptation

- ✅ Guide de démarrage rapide accessible et clair
- ✅ Exemples de déploiement complets et variés
- ✅ FAQ couvre les 8 erreurs les plus communes
- ✅ Troubleshooting guide systématique et complet
- ✅ Toutes les commandes documentées avec options
- ✅ Documentation accessible via `opencode aux help`
- ✅ Navigation claire entre les topics
- ✅ Formatage visuel professionnel
- ✅ Contenu en français
- ✅ Commandes prêtes à l'emploi

## 📝 Notes de Développement

### Choix Techniques

1. **Fonction par Topic**: Chaque topic a sa propre fonction d'affichage pour faciliter la maintenance et les modifications futures

2. **Formatage avec UI.Style**: Utilisation cohérente du système de formatage existant pour une expérience unifiée

3. **Exemples Réalistes**: Tous les exemples utilisent les valeurs par défaut réelles du projet

4. **Organisation Progressive**: Structure de l'information du plus simple (quick start) au plus complexe (troubleshooting)

### Principes de Rédaction

1. **Clarté**: Phrases courtes, vocabulaire simple, structure claire
2. **Actionnable**: Toutes les solutions sont des commandes exécutables
3. **Complet**: Couvre tous les scénarios courants d'utilisation
4. **Contextuel**: Explique le "pourquoi" en plus du "comment"

### Améliorations Futures Possibles

- Recherche textuelle dans la documentation
- Export de la documentation en HTML/PDF
- Traduction i18n pour support multilingue
- Intégration de vidéos/GIFs de démonstration
- Documentation interactive avec choix guidés
- Historique des commandes utilisées
- Suggestions contextuelles basées sur l'usage

## 🔗 Liens avec Autres Stories

- **STORY-007 (ErrorAnalyzer)**: FAQ mentionne ErrorAnalyzer pour suggestions contextuelles
- **STORY-005 (Templates Bicep)**: Documentation référence les templates Bicep
- **STORY-006 (Azure SDK)**: Documentation explique les commandes SDK

## 📞 Support et Ressources

**Documentation inclut des liens vers:**
- Documentation Microsoft Azure
- Azure Status page
- Documentation Bicep
- Azure CLI reference

**Pour aller plus loin:**
- Mode --verbose pour debugging
- ErrorAnalyzer pour suggestions contextuelles
- Portail Azure pour visualisation
- Support Azure si nécessaire

## 👥 Revue et Validation

**Développeur:** ✅ Implémentation complète
**Tests:** ✅ Toutes les commandes testées
**Contenu:** ✅ Toutes les exigences REQ-8 couvertes
**UX:** ✅ Navigation intuitive et formatage clair
**Documentation:** ✅ Story document complet

---

**Story complétée le:** 2026-01-19
**Prochaine story:** STORY-009 (Tests avec Consultants Pilotes)
