# Commandes CLI Azure - OpenCode "Aux petits Oignons"

Cette documentation décrit les commandes Azure disponibles dans OpenCode pour "Aux petits Oignons".

## Prérequis

Avant d'utiliser les commandes Azure, assurez-vous que :

1. **Azure CLI est installé** : Téléchargez depuis [azure.microsoft.com/cli](https://azure.microsoft.com/cli)
2. **Vous êtes authentifié** : Exécutez `az login` pour vous connecter à Azure
3. **Vous avez les permissions nécessaires** : Au minimum le rôle `Contributor` sur le resource group cible

## Commandes disponibles

### `opencode aux deploy`

Déploie l'infrastructure Azure Functions en utilisant les templates Bicep.

#### Syntaxe

```bash
opencode aux deploy [environment] [options]
```

#### Arguments

- `environment` : Environnement de déploiement (`dev`, `staging`, `prod`). Par défaut : `dev`

#### Options

| Option | Alias | Description | Défaut |
|--------|-------|-------------|--------|
| `--subscription` | `-s` | ID de l'abonnement Azure | Abonnement actuel |
| `--resource-group` | `-g` | Nom du resource group | `rg-opencode-{environment}` |
| `--location` | `-l` | Région Azure | `francecentral` |
| `--template` | `-t` | Chemin du template Bicep | `templates/azure/main.bicep` |
| `--parameters` | `-p` | Chemin du fichier de paramètres | Détecté automatiquement |
| `--verbose` | `-v` | Activer les logs détaillés | `false` |
| `--skip-validation` | | Ignorer la validation des permissions | `false` |

#### Exemples

**Déploiement de développement par défaut :**
```bash
opencode aux deploy
```

**Déploiement en production :**
```bash
opencode aux deploy prod --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Déploiement avec template personnalisé :**
```bash
opencode aux deploy dev \
  --template ./custom-template.bicep \
  --parameters ./params.json \
  --verbose
```

**Déploiement avec resource group spécifique :**
```bash
opencode aux deploy staging \
  --resource-group "rg-myapp-staging" \
  --location "westeurope"
```

#### Processus de déploiement

1. **Validation de l'authentification** : Vérifie que vous êtes connecté à Azure CLI
2. **Sélection de l'abonnement** : Configure l'abonnement Azure actif
3. **Création du resource group** : Crée le resource group s'il n'existe pas
4. **Build du template Bicep** : Compile le template Bicep en ARM JSON
5. **Chargement des paramètres** : Charge et fusionne les paramètres
6. **Validation du déploiement** : Valide la configuration avant déploiement
7. **Validation des permissions** : Vérifie que vous avez les rôles nécessaires
8. **Déploiement** : Lance le déploiement de l'infrastructure
9. **Affichage des résultats** : Affiche les ressources créées et les outputs

#### Ressources déployées

- **Storage Account** : Stockage pour les Function Apps
- **Application Insights** : Monitoring et télémétrie
- **Log Analytics Workspace** : Logs centralisés
- **Function App** : Azure Functions (Node.js ou Python)
- **Key Vault** (optionnel) : Gestion sécurisée des secrets

---

### `opencode aux status`

Affiche le statut des déploiements et des ressources Azure.

#### Syntaxe

```bash
opencode aux status [resource-group] [options]
```

#### Arguments

- `resource-group` : Nom du resource group à interroger. Par défaut : `rg-opencode-dev`

#### Options

| Option | Alias | Description | Défaut |
|--------|-------|-------------|--------|
| `--subscription` | `-s` | ID de l'abonnement Azure | Abonnement actuel |
| `--deployment` | `-d` | Nom d'un déploiement spécifique | - |
| `--verbose` | `-v` | Activer les logs détaillés | `false` |

#### Exemples

**Statut du resource group par défaut :**
```bash
opencode aux status
```

**Statut d'un resource group spécifique :**
```bash
opencode aux status rg-myapp-prod
```

**Statut d'un déploiement spécifique :**
```bash
opencode aux status --deployment deployment-20260119-123456
```

**Statut détaillé avec informations complètes :**
```bash
opencode aux status rg-opencode-prod --verbose
```

#### Informations affichées

**Mode resource group (par défaut) :**
- Liste des ressources groupées par type
- Nom de chaque ressource
- Localisation (en mode verbose)
- ID de ressource (en mode verbose)

**Mode déploiement (avec `--deployment`) :**
- Nom du déploiement
- État du provisioning
- Date et heure
- Durée du déploiement
- Outputs du déploiement

---

## Gestion des erreurs

Les commandes Azure incluent une gestion d'erreur robuste avec des suggestions contextuelles.

### Erreurs courantes

#### 1. Azure CLI non installé

```
✗ Azure CLI n'est pas installé
```

**Solution :** Installez Azure CLI depuis [azure.microsoft.com/cli](https://azure.microsoft.com/cli)

#### 2. Non authentifié

```
✗ Vous n'êtes pas connecté à Azure CLI
```

**Solution :** Exécutez `az login` pour vous authentifier

#### 3. Permissions insuffisantes

```
✗ Permissions insuffisantes
```

**Solutions suggérées :**
- Vérifiez vos rôles : `az role assignment list --resource-group <nom>`
- Demandez le rôle `Contributor` à votre administrateur Azure
- Contactez votre équipe DevOps

#### 4. Erreur de template Bicep

```
✗ Échec de la validation du template
```

**Solutions suggérées :**
- Vérifiez la syntaxe du template Bicep
- Validez localement : `az bicep build --file <template>`
- Consultez la documentation Bicep

#### 5. Conflit de nom de ressource

```
✗ La ressource existe déjà
```

**Solutions suggérées :**
- Utilisez un nom différent pour `applicationName`
- Supprimez l'ancienne ressource si elle n'est plus utilisée
- Modifiez le paramètre `environmentName`

---

## Logging et débogage

### Mode verbose

Activez le mode verbose pour obtenir des informations détaillées :

```bash
opencode aux deploy --verbose
opencode aux status --verbose
```

Le mode verbose affiche :
- Messages de debug pour chaque étape
- Stack traces en cas d'erreur
- Détails des requêtes Azure API
- Informations sur les permissions

### Fichiers de log

Les logs sont également enregistrés dans le système de logging d'OpenCode :

```bash
# Afficher les logs récents
opencode --print-logs

# Niveau de log spécifique
opencode aux deploy --log-level DEBUG
```

---

## Fichiers de configuration

### Templates Bicep

Les templates se trouvent dans `templates/azure/` :

- `main.bicep` : Template principal orchestrant les modules
- `modules/storage-account.bicep` : Configuration du Storage Account
- `modules/application-insights.bicep` : Configuration d'Application Insights
- `modules/function-app-nodejs.bicep` : Configuration Function App Node.js
- `modules/function-app-python.bicep` : Configuration Function App Python
- `modules/key-vault.bicep` : Configuration Key Vault (optionnel)

### Fichiers de paramètres

Les paramètres par environnement :

- `templates/azure/parameters.dev.json` : Paramètres de développement
- `templates/azure/parameters.staging.json` : Paramètres de staging
- `templates/azure/parameters.prod.json` : Paramètres de production

Structure d'un fichier de paramètres :

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environmentName": {
      "value": "dev"
    },
    "applicationName": {
      "value": "opencode"
    },
    "location": {
      "value": "francecentral"
    },
    "runtime": {
      "value": "node"
    },
    "functionAppSku": {
      "value": "Y1"
    }
  }
}
```

---

## Intégration avec les workflows

Les commandes Azure peuvent être intégrées dans vos workflows CI/CD :

### GitHub Actions

```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy Infrastructure
        run: |
          npm install -g opencode
          opencode aux deploy prod \
            --subscription ${{ secrets.AZURE_SUBSCRIPTION_ID }} \
            --resource-group rg-opencode-prod
```

### Azure DevOps

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: AzureCLI@2
    displayName: 'Deploy Infrastructure'
    inputs:
      azureSubscription: 'Azure Connection'
      scriptType: 'bash'
      scriptLocation: 'inlineScript'
      inlineScript: |
        npm install -g opencode
        opencode aux deploy prod
```

---

## Support et dépannage

### Vérifier l'état d'Azure

```bash
# Vérifier l'authentification
az account show

# Lister les abonnements
az account list --output table

# Lister les resource groups
az group list --output table

# Vérifier les rôles
az role assignment list --resource-group <nom> --output table
```

### Commandes utiles

```bash
# Validation d'un template Bicep
az bicep build --file templates/azure/main.bicep

# Déploiement what-if
az deployment group what-if \
  --resource-group <nom> \
  --template-file templates/azure/main.bicep

# Supprimer un deployment
az deployment group delete \
  --resource-group <nom> \
  --name <deployment-name>
```

---

## Prochaines étapes

Après le déploiement :

1. **Configurer les secrets** : Ajoutez vos clés API dans Key Vault
2. **Déployer le code** : Uploadez votre code Function App
3. **Configurer le monitoring** : Configurez les alertes dans Application Insights
4. **Tester l'infrastructure** : Validez que toutes les ressources fonctionnent

---

## Ressources

- [Documentation Azure CLI](https://docs.microsoft.com/cli/azure/)
- [Documentation Bicep](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure Functions](https://docs.microsoft.com/azure/azure-functions/)
- [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
