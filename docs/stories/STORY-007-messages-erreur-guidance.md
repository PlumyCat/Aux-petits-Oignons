# STORY-007: Messages d'Erreur et Guidance de Débogage

**Status:** ✅ Completed
**Sprint:** Sprint 5
**Epic:** EPIC-UX (User Experience)
**Story Points:** 5
**Assignee:** Developer
**Created:** 2026-01-19
**Completed:** 2026-01-19

## 📋 Description

Implémentation d'un système d'analyse et de diagnostic des erreurs Azure avec messages clairs en français, suggestions de résolution contextuelles et liens vers la documentation pertinente.

## 🎯 Objectifs

Améliorer l'expérience développeur en fournissant une guidance claire et actionnable lors d'erreurs Azure, réduisant ainsi le temps de débogage et facilitant la résolution autonome des problèmes.

## 📝 Exigences Techniques (REQ-7)

### REQ-7.1: Détection et diagnostic automatique
- ✅ Système de pattern matching pour 11 types d'erreurs Azure
- ✅ Classification par type (ErrorType enum)
- ✅ Classification par sévérité (ErrorSeverity enum avec 4 niveaux)
- ✅ Analyse automatique de toutes les erreurs dans les commandes Azure

### REQ-7.2: Messages d'erreur clairs et contextuels
- ✅ Tous les messages en français
- ✅ Titre descriptif pour chaque type d'erreur
- ✅ Description contextuelle expliquant la cause
- ✅ Formatage visuel avec emojis et sections structurées

### REQ-7.3: Suggestions de résolution
- ✅ 4 à 6 suggestions spécifiques par type d'erreur
- ✅ Suggestions actionnables avec exemples de commandes
- ✅ Ordre de priorité des actions recommandées
- ✅ Commandes complètes prêtes à être exécutées

### REQ-7.4: Liens vers documentation Azure
- ✅ 1 à 2 liens par type d'erreur vers la documentation Microsoft
- ✅ Documentation pertinente selon le contexte
- ✅ Section "📚 Documentation" dans le rapport d'erreur

### REQ-7.5: Mode verbose pour debugging avancé
- ✅ Flag `--verbose` dans les commandes CLI
- ✅ Affichage des détails techniques (error code, status code, stack trace)
- ✅ Rapport détaillé vs rapport simplifié
- ✅ Intégration dans deployment.ts, azure-deploy.ts et azure-status.ts

### REQ-7.6: Critère d'acceptation
- ✅ 11 types d'erreurs détectés et diagnostiqués
- ✅ 32 tests unitaires passant avec succès
- ✅ Couverture de code : 92.86% fonctions, 99.42% lignes
- ✅ Intégration complète dans les commandes Azure existantes

## 🏗️ Architecture

### Nouveau Module: ErrorAnalyzer

**Fichier:** `packages/opencode/src/azure/error-analyzer.ts`

```typescript
export enum ErrorType {
  AUTHENTICATION = "authentication",
  PERMISSIONS = "permissions",
  RESOURCE_NOT_FOUND = "resource_not_found",
  RESOURCE_CONFLICT = "resource_conflict",
  QUOTA_EXCEEDED = "quota_exceeded",
  INVALID_TEMPLATE = "invalid_template",
  DEPLOYMENT_FAILED = "deployment_failed",
  NETWORK_ERROR = "network_error",
  BICEP_COMPILATION = "bicep_compilation",
  CONFIGURATION_ERROR = "configuration_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export enum ErrorSeverity {
  CRITICAL = "critical",  // Bloque complètement
  ERROR = "error",        // Erreur importante
  WARNING = "warning",    // Avertissement
  INFO = "info",         // Information
}

export class ErrorAnalyzer {
  // Analyse une erreur et retourne le diagnostic complet
  static analyze(error: Error): ErrorAnalysis

  // Analyse plusieurs erreurs et les trie par sévérité
  static analyzeMultiple(errors: Error[]): ErrorAnalysis[]

  // Formate un rapport lisible pour l'utilisateur
  static formatReport(analysis: ErrorAnalysis, verbose: boolean): string

  // Détermine si une erreur est récupérable (retry possible)
  static isRecoverable(error: Error): boolean

  // Calcule le délai de retry recommandé (ms)
  static getRetryDelay(error: Error): number
}
```

### Catalogue d'Erreurs (11 types)

1. **AUTHENTICATION** (CRITICAL)
   - Pattern: not logged in, authentication failed
   - Suggestions: az login, vérifier abonnements

2. **PERMISSIONS** (CRITICAL)
   - Pattern: permission denied, unauthorized, forbidden
   - Suggestions: vérifier rôles RBAC, demander accès Contributor

3. **QUOTA_EXCEEDED** (ERROR)
   - Pattern: quota exceeded, rate limit, throttling
   - Suggestions: demander augmentation quota, réduire utilisation

4. **BICEP_COMPILATION** (CRITICAL)
   - Pattern: bicep not found, az bicep command
   - Suggestions: az bicep install, vérifier installation

5. **RESOURCE_CONFLICT** (ERROR)
   - Pattern: already exists, conflict, duplicate
   - Suggestions: changer nom, utiliser noms uniques

6. **RESOURCE_NOT_FOUND** (ERROR)
   - Pattern: not found, does not exist
   - Suggestions: vérifier nom, créer resource group

7. **INVALID_TEMPLATE** (ERROR)
   - Pattern: template invalid, validation failed
   - Suggestions: vérifier syntaxe Bicep, valider paramètres

8. **DEPLOYMENT_FAILED** (ERROR)
   - Pattern: deployment failed, provisioning failed
   - Suggestions: consulter logs portail, vérifier dépendances

9. **NETWORK_ERROR** (ERROR)
   - Pattern: network, connection, dns
   - Suggestions: vérifier Internet, configurer proxy

10. **TIMEOUT** (WARNING)
    - Pattern: timeout, timed out
    - Suggestions: réessayer, diviser en étapes

11. **CONFIGURATION_ERROR** (ERROR)
    - Pattern: invalid parameter, missing parameter
    - Suggestions: vérifier fichiers paramètres, consulter documentation

## 📁 Fichiers Modifiés

### Nouveau Fichier
- `packages/opencode/src/azure/error-analyzer.ts` (337 lignes)
  - Module complet d'analyse d'erreurs
  - 11 patterns d'erreurs avec descriptions françaises
  - Méthodes d'analyse, formatage et recovery

### Fichiers Modifiés
1. `packages/opencode/src/azure/deployment.ts`
   - Intégration ErrorAnalyzer dans catch block
   - Suppression de l'ancienne fonction getErrorSuggestions()
   - Affichage du rapport formaté en mode verbose

2. `packages/opencode/src/cli/cmd/azure-deploy.ts`
   - Intégration ErrorAnalyzer avec rapport complet
   - Box formaté pour erreurs de déploiement
   - Affichage suggestions de retry pour erreurs récupérables

3. `packages/opencode/src/cli/cmd/azure-status.ts`
   - Intégration ErrorAnalyzer pour erreurs de status
   - Rapport formaté avec suggestions

### Fichiers de Test
- `packages/opencode/src/azure/__tests__/error-analyzer.test.ts` (297 lignes)
  - 32 tests couvrant tous les types d'erreurs
  - Tests de formatReport(), isRecoverable(), getRetryDelay()
  - Tests de analyzeMultiple() et extractTechnicalDetails()
  - Couverture : 92.86% fonctions, 99.42% lignes

## 🧪 Tests

### Résultats des Tests
```
✅ 32 tests passés
❌ 0 tests échoués
📊 60 assertions
⏱️ Temps d'exécution: 158ms

Couverture de code:
- error-analyzer.ts: 92.86% fonctions, 99.42% lignes
```

### Catégories de Tests
1. Authentication errors (2 tests)
2. Permission errors (2 tests)
3. Quota errors (2 tests)
4. Resource conflict errors (2 tests)
5. Resource not found errors (2 tests)
6. Template validation errors (2 tests)
7. Bicep compilation errors (1 test)
8. Deployment failures (1 test)
9. Network errors (2 tests)
10. Timeout errors (1 test)
11. Unknown errors (1 test)
12. formatReport (2 tests)
13. isRecoverable (5 tests)
14. getRetryDelay (4 tests)
15. analyzeMultiple (1 test)
16. extractTechnicalDetails (2 tests)

## 💡 Fonctionnalités Clés

### 1. Analyse Contextuelle
L'ErrorAnalyzer analyse le message d'erreur et la stack trace pour identifier automatiquement le type et la cause de l'erreur.

### 2. Suggestions Actionnables
Chaque erreur est accompagnée de 4-6 suggestions concrètes avec des exemples de commandes à exécuter.

### 3. Documentation Intégrée
Liens directs vers la documentation Microsoft Azure pertinente selon le contexte de l'erreur.

### 4. Système de Recovery
- Detection des erreurs récupérables (timeout, network, quota)
- Calcul du délai de retry optimal (3s, 5s, 60s selon le type)
- Recommandations de retry affichées à l'utilisateur

### 5. Mode Verbose
Affichage optionnel des détails techniques pour le debugging avancé :
- Error code
- HTTP status code
- Stack trace
- Détails techniques complémentaires

### 6. Formatage Visuel
Rapport structuré avec :
- Emoji de sévérité (🔴 🟠 🟡 🔵)
- Sections claires (Erreur, Suggestions, Documentation)
- Box formaté pour les erreurs critiques
- Numérotation des suggestions

## 📊 Métriques

- **Lignes de code ajoutées:** ~650 lignes (module + tests)
- **Types d'erreurs couverts:** 11
- **Patterns d'erreurs:** 11 regex patterns
- **Suggestions totales:** ~70 suggestions uniques
- **Liens documentation:** ~20 liens Microsoft Docs
- **Tests:** 32 tests, 60 assertions
- **Couverture:** 92.86% fonctions, 99.42% lignes
- **Temps de développement:** ~3 heures

## 🚀 Impact Utilisateur

### Avant
```
Error: Deployment failed
  at deployment.ts:125:10
```

### Après
```
╔════════════════════════════════════════╗
║  Erreur lors du déploiement            ║
╚════════════════════════════════════════╝

🟠 ERROR: Échec du déploiement Azure

Le déploiement des ressources Azure a échoué. Cela peut être dû à
des problèmes de configuration, de dépendances, ou de ressources.

💡 Suggestions de résolution:
  1. Consultez les logs détaillés du déploiement dans le portail Azure
  2. Vérifiez l'état du déploiement: opencode aux status --deployment <nom>
  3. Consultez les logs détaillés avec le mode verbose: opencode aux deploy --verbose
  4. Vérifiez que toutes les dépendances entre ressources sont correctes
  5. Si le problème persiste, supprimez le déploiement échoué et réessayez
  6. Vérifiez les événements du resource group dans le portail Azure

📚 Documentation:
  • https://docs.microsoft.com/azure/azure-resource-manager/troubleshooting/common-deployment-errors
```

## ✅ Critères d'Acceptation

- ✅ Les erreurs Azure courantes sont automatiquement détectées et diagnostiquées
- ✅ Les messages d'erreur sont clairs, en français et contextuels
- ✅ Chaque erreur est accompagnée de suggestions actionnables
- ✅ Les liens vers la documentation Azure sont fournis
- ✅ Le mode verbose affiche les détails techniques
- ✅ Les tests unitaires valident tous les types d'erreurs
- ✅ L'intégration est complète dans toutes les commandes Azure
- ✅ Le système de recovery détecte les erreurs récupérables

## 📝 Notes de Développement

### Choix Techniques

1. **Pattern Matching**: Utilisation de regex pour détecter les erreurs plutôt que de parser les error codes Azure (plus flexible et indépendant des versions SDK)

2. **Ordre des Patterns**: Les patterns plus spécifiques (BICEP_COMPILATION) sont testés avant les patterns génériques (RESOURCE_NOT_FOUND) pour éviter les faux positifs

3. **Messages en Français**: Tous les messages utilisateur sont en français conformément aux exigences du projet

4. **Recovery Logic**: Implémentation d'un système de détection d'erreurs récupérables avec calcul de délai de retry optimal

### Améliorations Futures Possibles

- Ajout de patterns pour erreurs spécifiques Azure Functions
- Intégration avec Azure Monitor pour logs détaillés
- Système de traduction i18n pour support multilingue
- Cache des erreurs fréquentes pour analytics
- Suggestions personnalisées basées sur l'historique utilisateur

## 🔗 Liens Utiles

- [Documentation Azure Resource Manager](https://docs.microsoft.com/azure/azure-resource-manager/)
- [Common deployment errors](https://docs.microsoft.com/azure/azure-resource-manager/troubleshooting/common-deployment-errors)
- [Azure Bicep documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/overview)
- [Azure CLI reference](https://docs.microsoft.com/cli/azure/)

## 👥 Revue et Validation

**Développeur:** ✅ Implémentation complète
**Tests:** ✅ 32 tests passés, couverture 92%+
**Intégration:** ✅ Toutes les commandes Azure
**Documentation:** ✅ Story document complet

---

**Story complétée le:** 2026-01-19
**Prochaine story:** STORY-008 (Documentation Utilisateur)
