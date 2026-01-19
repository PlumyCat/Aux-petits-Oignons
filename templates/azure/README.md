# Templates de Déploiement Azure - OpenCode Enterprise

Templates Bicep pour déployer l'infrastructure Azure Functions et services associés.

## 📁 Structure

```
templates/azure/
├── main.bicep                    # Template principal orchestrant tous les services
├── modules/                      # Modules Bicep réutilisables
│   ├── storage-account.bicep     # Storage Account pour Azure Functions
│   ├── application-insights.bicep # Application Insights + Log Analytics
│   ├── key-vault.bicep           # Key Vault pour la gestion des secrets
│   ├── function-app-nodejs.bicep # Azure Function App (Node.js)
│   └── function-app-python.bicep # Azure Function App (Python)
├── parameters/                   # Fichiers de paramètres par environnement
│   ├── dev.parameters.json       # Paramètres pour développement
│   ├── staging.parameters.json   # Paramètres pour staging
│   └── prod.parameters.json      # Paramètres pour production
└── scripts/                      # Scripts de déploiement
    ├── validate.sh               # Validation des templates
    └── deploy.sh                 # Déploiement automatisé
```

## 🚀 Démarrage Rapide

### Prérequis

- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) installé
- Authentification Azure configurée (`az login`)
- Permissions suffisantes sur la souscription Azure

### Validation des Templates

Avant de déployer, validez les templates:

```bash
# Validation syntaxique uniquement
./scripts/validate.sh dev

# Validation complète avec Azure (crée le resource group si nécessaire)
./scripts/validate.sh dev rg-myapp-dev westeurope
```

### Déploiement

```bash
# Déploiement en développement
./scripts/deploy.sh dev rg-myapp-dev westeurope

# Déploiement en staging
./scripts/deploy.sh staging rg-myapp-staging westeurope

# Déploiement en production (demande confirmation)
./scripts/deploy.sh prod rg-myapp-prod westeurope
```

## 📝 Configuration

### Paramètres Environnement

Modifiez les fichiers dans `parameters/` pour personnaliser votre déploiement:

**dev.parameters.json** (Développement):
- SKU Function App: Y1 (Consumption)
- SKU Storage: Standard_LRS
- Rétention App Insights: 30 jours
- Runtime par défaut: Node.js 20

**staging.parameters.json** (Staging):
- SKU Function App: EP1 (Elastic Premium)
- SKU Storage: Standard_GRS
- Rétention App Insights: 90 jours
- Runtime par défaut: Node.js 20

**prod.parameters.json** (Production):
- SKU Function App: EP2 (Elastic Premium)
- SKU Storage: Standard_GRS
- Rétention App Insights: 90 jours
- Runtime par défaut: Node.js 20

### Paramètres Disponibles

| Paramètre | Description | Valeurs | Défaut |
|-----------|-------------|---------|--------|
| `environmentName` | Nom de l'environnement | dev, staging, prod | dev |
| `applicationName` | Nom de l'application (3-20 car.) | string | myapp |
| `location` | Région Azure | string | westeurope |
| `runtime` | Runtime de la Function App | node, python | node |
| `runtimeVersion` | Version du runtime | 18, 20 (node) / 3.9, 3.10, 3.11 (python) | 20 |
| `functionAppSku` | SKU de la Function App | Y1, EP1, EP2, EP3 | Y1 |
| `deployKeyVault` | Déployer Key Vault | true, false | true |
| `storageSku` | SKU du Storage Account | Standard_LRS, Standard_GRS, etc. | Standard_LRS |
| `appInsightsRetention` | Rétention App Insights (jours) | 30-730 | 90 |

## 🏗️ Architecture

### Services Déployés

1. **Storage Account**
   - Stockage pour Azure Functions runtime
   - Chiffrement activé (blob + file)
   - HTTPS obligatoire, TLS 1.2 minimum
   - Accès public blob désactivé

2. **Application Insights + Log Analytics**
   - Monitoring et télémétrie
   - Log Analytics Workspace automatique
   - Quota quotidien: 1GB (contrôle des coûts)
   - Rétention configurable (30-730 jours)

3. **Key Vault** (optionnel)
   - Gestion centralisée des secrets
   - Soft delete activé (90 jours)
   - Purge protection activée
   - Support RBAC et Access Policies

4. **Azure Function App**
   - Runtime Node.js ou Python
   - Managed Identity activé
   - Plan Consumption ou Elastic Premium
   - Configuration HTTPS-only, TLS 1.2
   - Intégration App Insights automatique

### Nommage des Ressources

Les ressources sont nommées selon ce pattern:

```
{prefix}-{applicationName}-{environment}-{uniqueSuffix}
```

Préfixes standards:
- `st`: Storage Account
- `appi`: Application Insights
- `kv`: Key Vault
- `func`: Function App

Exemple pour application "myapp" en dev:
- Storage: `stmyappdev{unique}`
- App Insights: `appi-myapp-dev`
- Key Vault: `kv-myapp-dev-{unique}`
- Function: `func-myapp-dev`

## 🔧 Modules Détaillés

### storage-account.bicep

Déploie un Storage Account optimisé pour Azure Functions.

**Paramètres principaux:**
- `storageAccountName`: Nom du compte (alphanumérique uniquement)
- `skuName`: SKU (Standard_LRS, Standard_GRS, etc.)
- `minTlsVersion`: Version TLS minimum (TLS1_2 par défaut)

**Outputs:**
- `storageAccountId`: ID de la ressource
- `storageAccountName`: Nom du Storage Account
- `connectionString`: Chaîne de connexion complète

### application-insights.bicep

Déploie Application Insights avec Log Analytics Workspace.

**Paramètres principaux:**
- `appInsightsName`: Nom de l'instance
- `applicationType`: Type d'application (web, other)
- `retentionInDays`: Rétention des données (30-730)

**Outputs:**
- `appInsightsId`: ID de la ressource
- `instrumentationKey`: Clé d'instrumentation
- `connectionString`: Chaîne de connexion
- `workspaceId`: ID du workspace Log Analytics

### key-vault.bicep

Déploie Azure Key Vault pour la gestion des secrets.

**Paramètres principaux:**
- `keyVaultName`: Nom du Key Vault
- `enableRbacAuthorization`: Activer RBAC (true) ou Access Policies (false)
- `principalId`: ID du principal pour Access Policies

**Outputs:**
- `keyVaultId`: ID de la ressource
- `keyVaultName`: Nom du Key Vault
- `keyVaultUri`: URI du Key Vault

### function-app-nodejs.bicep / function-app-python.bicep

Déploie Azure Function App avec App Service Plan.

**Paramètres principaux:**
- `functionAppName`: Nom de la Function App
- `storageAccountName`: Nom du Storage Account
- `appInsightsConnectionString`: Connection string App Insights
- `nodeVersion` / `pythonVersion`: Version du runtime
- `skuName`: SKU (Y1, EP1, EP2, EP3)
- `enableManagedIdentity`: Activer Managed Identity

**Outputs:**
- `functionAppId`: ID de la ressource
- `functionAppName`: Nom de la Function App
- `functionAppHostName`: Hostname de la Function App
- `functionAppPrincipalId`: ID du Managed Identity (si activé)

## 🔐 Sécurité

### Bonnes Pratiques Implémentées

- ✅ HTTPS obligatoire sur tous les services
- ✅ TLS 1.2 minimum
- ✅ Chiffrement activé sur Storage Account
- ✅ Accès public blob désactivé
- ✅ Managed Identity pour les Function Apps
- ✅ Key Vault avec soft delete et purge protection
- ✅ FTP désactivé sur Function Apps
- ✅ CORS configuré pour portail Azure uniquement

### Gestion des Secrets

Utilisez Key Vault pour stocker les secrets:

```bash
# Ajouter un secret
az keyvault secret set \
  --vault-name kv-myapp-dev-xyz \
  --name "ApiKey" \
  --value "your-secret-value"

# Référencer dans Function App (via App Settings)
@Microsoft.KeyVault(SecretUri=https://kv-myapp-dev-xyz.vault.azure.net/secrets/ApiKey/)
```

## 📊 Monitoring

### Application Insights

Les Function Apps sont automatiquement configurées avec Application Insights:

- Traces d'exécution
- Métriques de performance
- Exceptions et erreurs
- Dépendances externes

Accédez au monitoring:
```bash
# Ouvrir dans le portail
az monitor app-insights component show \
  --app appi-myapp-dev \
  --resource-group rg-myapp-dev \
  --query "appId" -o tsv
```

## 🧪 Tests

### Validation Locale

```bash
# Valider la syntaxe Bicep
az bicep build --file main.bicep

# Valider tous les modules
for file in modules/*.bicep; do
  echo "Validating $file..."
  az bicep build --file "$file"
done
```

### Validation avec Azure

```bash
# What-if analysis (voir les changements sans déployer)
az deployment group what-if \
  --resource-group rg-myapp-dev \
  --template-file main.bicep \
  --parameters @parameters/dev.parameters.json

# Validation complète
az deployment group validate \
  --resource-group rg-myapp-dev \
  --template-file main.bicep \
  --parameters @parameters/dev.parameters.json
```

## 🔄 CI/CD

### Intégration GitHub Actions

Exemple de workflow pour déploiement automatique:

```yaml
name: Deploy Azure Infrastructure

on:
  push:
    branches: [main]
    paths:
      - 'templates/azure/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Validate Templates
        run: |
          cd templates/azure
          ./scripts/validate.sh dev rg-myapp-dev westeurope
      
      - name: Deploy Infrastructure
        run: |
          cd templates/azure
          ./scripts/deploy.sh dev rg-myapp-dev westeurope
```

## 🆘 Dépannage

### Erreurs Communes

**Erreur: "Storage account name already exists"**
- Solution: Les noms de Storage Account doivent être uniques globalement. Modifiez `applicationName` dans les paramètres.

**Erreur: "Location not available for subscription"**
- Solution: Vérifiez les régions disponibles: `az account list-locations -o table`

**Erreur: "Insufficient permissions"**
- Solution: Vérifiez vos permissions avec: `az role assignment list --assignee <your-email>`

### Logs de Déploiement

```bash
# Voir les déploiements récents
az deployment group list \
  --resource-group rg-myapp-dev \
  --output table

# Détails d'un déploiement
az deployment group show \
  --name deployment-20260118-120000 \
  --resource-group rg-myapp-dev
```

## 📚 Ressources

- [Documentation Azure Bicep](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)

## 📄 Licence

Ce projet fait partie de OpenCode Enterprise - Aux petits Oignons.
