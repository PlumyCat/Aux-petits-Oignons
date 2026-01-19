// Main deployment template for Azure Functions infrastructure
// Orchestrates deployment of Storage Account, Application Insights, Key Vault, and Function App

targetScope = 'resourceGroup'

// ========================================
// Parameters
// ========================================

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environmentName string = 'dev'

@description('Application name')
@minLength(3)
@maxLength(20)
param applicationName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Runtime for Function App')
@allowed([
  'node'
  'python'
])
param runtime string = 'node'

@description('Runtime version')
param runtimeVersion string = runtime == 'node' ? '20' : '3.11'

@description('Function App SKU')
@allowed([
  'Y1'
  'EP1'
  'EP2'
  'EP3'
])
param functionAppSku string = 'Y1'

@description('Enable Key Vault deployment')
param deployKeyVault bool = true

@description('Storage Account SKU')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param storageSku string = 'Standard_LRS'

@description('Application Insights retention in days')
@minValue(30)
@maxValue(730)
param appInsightsRetention int = 90

// ========================================
// Variables
// ========================================

var nameSuffix = '${applicationName}-${environmentName}'
var uniqueSuffix = uniqueString(resourceGroup().id, nameSuffix)

var storageAccountName = 'st${replace(nameSuffix, '-', '')}${take(uniqueSuffix, 6)}'
var appInsightsName = 'appi-${nameSuffix}'
var keyVaultName = 'kv-${take(nameSuffix, 15)}-${take(uniqueSuffix, 6)}'
var functionAppName = 'func-${nameSuffix}'

var commonTags = {
  Environment: environmentName
  Application: applicationName
  ManagedBy: 'Bicep'
}

// ========================================
// Module Deployments
// ========================================

// Storage Account
module storageAccount 'modules/storage-account.bicep' = {
  name: 'storage-deployment'
  params: {
    storageAccountName: storageAccountName
    location: location
    tags: commonTags
    skuName: storageSku
    minTlsVersion: 'TLS1_2'
  }
}

// Application Insights
module appInsights 'modules/application-insights.bicep' = {
  name: 'appinsights-deployment'
  params: {
    appInsightsName: appInsightsName
    location: location
    tags: commonTags
    applicationType: 'web'
    retentionInDays: appInsightsRetention
  }
}

// Key Vault (optional)
module keyVault 'modules/key-vault.bicep' = if (deployKeyVault) {
  name: 'keyvault-deployment'
  params: {
    keyVaultName: keyVaultName
    location: location
    tags: commonTags
    skuName: 'standard'
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    enableRbacAuthorization: true
    networkAclsDefaultAction: 'Allow'
  }
}

// Function App - Node.js
module functionAppNode 'modules/function-app-nodejs.bicep' = if (runtime == 'node') {
  name: 'functionapp-node-deployment'
  params: {
    functionAppName: functionAppName
    location: location
    tags: commonTags
    storageAccountName: storageAccount.outputs.storageAccountName
    appInsightsConnectionString: appInsights.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    keyVaultUri: ''
    nodeVersion: runtimeVersion
    skuName: functionAppSku
    enableManagedIdentity: true
  }
  dependsOn: [
    storageAccount
    appInsights
  ]
}

// Function App - Python
module functionAppPython 'modules/function-app-python.bicep' = if (runtime == 'python') {
  name: 'functionapp-python-deployment'
  params: {
    functionAppName: functionAppName
    location: location
    tags: commonTags
    storageAccountName: storageAccount.outputs.storageAccountName
    appInsightsConnectionString: appInsights.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    keyVaultUri: ''
    pythonVersion: runtimeVersion
    skuName: functionAppSku
    enableManagedIdentity: true
  }
  dependsOn: [
    storageAccount
    appInsights
  ]
}

// ========================================
// Outputs
// ========================================

output resourceGroupName string = resourceGroup().name
output location string = location
output environment string = environmentName

// Storage Account outputs
output storageAccountName string = storageAccount.outputs.storageAccountName
output storageAccountId string = storageAccount.outputs.storageAccountId

// Application Insights outputs
output appInsightsName string = appInsights.outputs.appInsightsName
output appInsightsId string = appInsights.outputs.appInsightsId
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey
output appInsightsConnectionString string = appInsights.outputs.connectionString

// Key Vault outputs (conditional deployment)
@description('Key Vault name if deployed')
output keyVaultName string = deployKeyVault ? keyVaultName : ''

@description('Key Vault resource ID if deployed')
output keyVaultId string = deployKeyVault ? resourceId('Microsoft.KeyVault/vaults', keyVaultName) : ''

// Function App outputs
@description('Function App name')
output functionAppName string = functionAppName

@description('Function App hostname')
output functionAppUrl string = 'https://${functionAppName}.azurewebsites.net'
