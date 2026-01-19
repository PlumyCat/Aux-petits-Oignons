# Checklist des Critères d'Acceptation - Tests Pilotes

**Story:** STORY-009 - Tests avec Consultants Pilotes
**Version:** 1.0
**Date:** 2026-01-19

## 📋 Instructions

Cette checklist doit être complétée par le consultant pilote et le développeur pour valider que OpenCode Enterprise est prêt pour le déploiement complet.

**Légende :**
- ✅ = Validé et fonctionnel
- ⚠️ = Partiellement validé avec remarques
- ❌ = Non validé / Problème identifié
- N/A = Non applicable

**Consultant Pilote :** _________________
**Date de Test :** _________________
**Développeur :** _________________

---

## 1️⃣ Installation et Configuration (Jour 1)

### 1.1 Prérequis Système

| Critère | Status | Notes |
|---------|--------|-------|
| Documentation des prérequis claire et complète | ☐ | |
| Node.js version ≥ 18 installé et vérifié | ☐ | |
| Azure CLI installé et fonctionnel | ☐ | |
| Bicep installé (`az bicep install`) | ☐ | |
| Accès à une subscription Azure | ☐ | |
| Permissions Contributor/Owner validées | ☐ | |

### 1.2 Installation d'OpenCode

| Critère | Status | Notes |
|---------|--------|-------|
| Installation npm/bun réussie | ☐ | |
| Commande `opencode --version` fonctionne | ☐ | |
| Commande `opencode aux help` fonctionne | ☐ | |
| Temps d'installation < 5 minutes | ☐ | |
| Aucune erreur lors de l'installation | ☐ | |

### 1.3 Authentication Azure

| Critère | Status | Notes |
|---------|--------|-------|
| `az login` réussi | ☐ | |
| Liste des subscriptions visible (`az account list`) | ☐ | |
| Subscription sélectionnée correctement | ☐ | |
| Messages d'erreur clairs si non authentifié | ☐ | |

**Score Section 1 :** _____ / 15

---

## 2️⃣ Déploiements Azure (Jours 2-3)

### 2.1 Déploiement Environnement Dev

| Critère | Status | Notes |
|---------|--------|-------|
| Commande `opencode aux deploy` exécutée avec succès | ☐ | |
| Resource group `rg-opencode-dev` créé | ☐ | |
| Function App créée et déployée | ☐ | |
| Storage Account créé | ☐ | |
| Application Insights créé | ☐ | |
| Temps de déploiement < 5 minutes | ☐ | |
| Messages de progression clairs pendant le déploiement | ☐ | |
| Message de succès final affiché | ☐ | |

### 2.2 Déploiement Environnement Staging

| Critère | Status | Notes |
|---------|--------|-------|
| Commande `opencode aux deploy staging` réussie | ☐ | |
| Resource group `rg-opencode-staging` créé | ☐ | |
| Resources distinctes de l'env dev | ☐ | |
| Paramètres staging appliqués correctement | ☐ | |
| Temps de déploiement < 5 minutes | ☐ | |

### 2.3 Vérification Status

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux status` affiche toutes les ressources dev | ☐ | |
| `opencode aux status rg-opencode-staging` affiche ressources staging | ☐ | |
| Informations affichées sont complètes et pertinentes | ☐ | |
| Formatage visuel clair et lisible | ☐ | |

### 2.4 Déploiement Personnalisé

| Critère | Status | Notes |
|---------|--------|-------|
| Options `--resource-group` fonctionnent | ☐ | |
| Options `--location` fonctionnent | ☐ | |
| Options `--verbose` affiche détails techniques | ☐ | |
| Flexibilité suffisante pour scénarios réels | ☐ | |

**Score Section 2 :** _____ / 21

---

## 3️⃣ Documentation et Aide (Jours 2-3)

### 3.1 Accessibilité

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help` affiche liste des topics | ☐ | |
| Navigation entre topics intuitive | ☐ | |
| Toute la documentation en français | ☐ | |
| Formatage visuel professionnel | ☐ | |

### 3.2 Quick Start Guide

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help quickstart` affiché correctement | ☐ | |
| 4 étapes clairement décrites | ☐ | |
| Commandes copiables-collables | ☐ | |
| Permet de démarrer en < 5 minutes | ☐ | |
| Prochaines étapes suggérées pertinentes | ☐ | |

### 3.3 Exemples de Déploiement

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help deploy` affiché correctement | ☐ | |
| 5 scénarios documentés | ☐ | |
| Exemples pertinents pour usage réel | ☐ | |
| Toutes les options expliquées | ☐ | |

### 3.4 FAQ Erreurs

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help errors` affiché correctement | ☐ | |
| 8 erreurs communes couvertes | ☐ | |
| Solutions claires et actionnables | ☐ | |
| Commandes de résolution prêtes à l'emploi | ☐ | |
| A résolu au moins 1 problème réel du consultant | ☐ | |

### 3.5 Troubleshooting Guide

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help troubleshoot` affiché correctement | ☐ | |
| 6 étapes de diagnostic décrites | ☐ | |
| Checklist complète et utile | ☐ | |
| Process systématique de résolution | ☐ | |

### 3.6 Référence Commandes

| Critère | Status | Notes |
|---------|--------|-------|
| `opencode aux help commands` affiché correctement | ☐ | |
| Toutes les commandes documentées | ☐ | |
| Tous les paramètres expliqués | ☐ | |
| Valeurs par défaut indiquées | ☐ | |

**Score Section 3 :** _____ / 25

---

## 4️⃣ Messages d'Erreur et Guidance (Jours 2-3)

### 4.1 Clarté des Messages

| Critère | Status | Notes |
|---------|--------|-------|
| Tous les messages d'erreur en français | ☐ | |
| Messages compréhensibles sans expertise technique | ☐ | |
| Formatage visuel des erreurs (emojis, couleurs) | ☐ | |
| Titre descriptif pour chaque erreur | ☐ | |

### 4.2 Suggestions de Résolution

| Critère | Status | Notes |
|---------|--------|-------|
| Chaque erreur a des suggestions actionnables | ☐ | |
| Suggestions numérotées par priorité | ☐ | |
| Commandes de résolution complètes fournies | ☐ | |
| Le consultant a pu résoudre 80%+ erreurs en autonomie | ☐ | |

### 4.3 Documentation Liée

| Critère | Status | Notes |
|---------|--------|-------|
| Liens vers documentation Azure fournis | ☐ | |
| Liens pertinents selon le contexte | ☐ | |
| Section "Documentation" dans rapport d'erreur | ☐ | |

### 4.4 Mode Verbose

| Critère | Status | Notes |
|---------|--------|-------|
| Flag `--verbose` fonctionne sur toutes les commandes | ☐ | |
| Détails techniques affichés (error code, stack) | ☐ | |
| Suffisamment de détails pour debugging avancé | ☐ | |
| N'encombre pas l'output en mode normal | ☐ | |

**Score Section 4 :** _____ / 15

---

## 5️⃣ Expérience Utilisateur Globale (Jours 1-4)

### 5.1 Facilité d'Utilisation

| Critère | Status | Notes |
|---------|--------|-------|
| Interface CLI intuitive et cohérente | ☐ | |
| Commandes faciles à mémoriser | ☐ | |
| Workflow logique et naturel | ☐ | |
| Aucune commande nécessitant aide technique | ☐ | |

### 5.2 Performance

| Critère | Status | Notes |
|---------|--------|-------|
| Déploiement dev < 5 minutes | ☐ | |
| Déploiement staging < 5 minutes | ☐ | |
| Commande `status` < 10 secondes | ☐ | |
| Commande `help` instantanée (< 1 seconde) | ☐ | |

### 5.3 Stabilité

| Critère | Status | Notes |
|---------|--------|-------|
| Aucun crash durant les tests | ☐ | |
| Aucune erreur non gérée (stack trace brute) | ☐ | |
| Récupération correcte après erreurs | ☐ | |
| Comportement déterministe et prévisible | ☐ | |

### 5.4 Valeur Ajoutée

| Critère | Status | Notes |
|---------|--------|-------|
| Gain de temps vs approche manuelle > 50% | ☐ | |
| Réduit la complexité des déploiements Azure | ☐ | |
| Consultant se sent plus autonome avec Azure | ☐ | |
| Outil répond aux besoins réels du consultant | ☐ | |

**Score Section 5 :** _____ / 16

---

## 6️⃣ Formation et Support (Jour 1 & 4)

### 6.1 Session de Formation Initiale

| Critère | Status | Notes |
|---------|--------|-------|
| Durée formation < 2 heures | ☐ | |
| Contenu clair et bien structuré | ☐ | |
| Démo guidée compréhensible | ☐ | |
| Questions du consultant répondues | ☐ | |
| Consultant autonome après formation | ☐ | |

### 6.2 Support Pendant Tests

| Critère | Status | Notes |
|---------|--------|-------|
| Support disponible et réactif | ☐ | |
| Temps de réponse < 4 heures | ☐ | |
| Bugs P0 corrigés < 2 heures | ☐ | |
| Communication claire avec développeur | ☐ | |

**Score Section 6 :** _____ / 9

---

## 7️⃣ Bugs et Problèmes Identifiés

### 7.1 Bugs Critiques (P0)

| Description | Status | Résolution |
|-------------|--------|------------|
| | ☐ Identifié ☐ Corrigé | |
| | ☐ Identifié ☐ Corrigé | |
| | ☐ Identifié ☐ Corrigé | |

**Total bugs P0 :** _____ identifiés, _____ corrigés

### 7.2 Bugs Majeurs (P1)

| Description | Status | Résolution |
|-------------|--------|------------|
| | ☐ Identifié ☐ Corrigé | |
| | ☐ Identifié ☐ Corrigé | |
| | ☐ Identifié ☐ Corrigé | |

**Total bugs P1 :** _____ identifiés, _____ corrigés

### 7.3 Bugs Mineurs (P2)

| Description | Status | Action |
|-------------|--------|--------|
| | ☐ Identifié | |
| | ☐ Identifié | |
| | ☐ Identifié | |

**Total bugs P2 :** _____ identifiés

---

## 📊 Scores et Évaluation Globale

### Scores par Section

| Section | Score | Pourcentage | Seuil | Status |
|---------|-------|-------------|-------|--------|
| 1. Installation et Configuration | ___ / 15 | ___% | 80% | ☐ |
| 2. Déploiements Azure | ___ / 21 | ___% | 85% | ☐ |
| 3. Documentation et Aide | ___ / 25 | ___% | 80% | ☐ |
| 4. Messages d'Erreur | ___ / 15 | ___% | 85% | ☐ |
| 5. Expérience Utilisateur | ___ / 16 | ___% | 80% | ☐ |
| 6. Formation et Support | ___ / 9 | ___% | 80% | ☐ |

**Score Total :** _____ / 101 = _____%

**Seuil de Validation :** 82% (83/101 critères validés)

### Net Promoter Score

**Question :** Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez OpenCode Enterprise à vos collègues ?

**Score :** _____ / 10

**Commentaire :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Seuil de Validation :** ≥ 8/10

---

## ✅ Validation Finale

### Critères Obligatoires (Tous doivent être ✅)

- [ ] Score global ≥ 82% (83/101)
- [ ] Net Promoter Score ≥ 8/10
- [ ] Tous les bugs P0 corrigés
- [ ] Au moins 80% bugs P1 corrigés
- [ ] Au moins 2 déploiements réussis (dev + staging)
- [ ] Consultant autonome pour déploiements standards
- [ ] Documentation suffisante pour résolution autonome

### Décision Finale

**OpenCode Enterprise est-il prêt pour le rollout complet ?**

☐ **OUI** - Tous les critères obligatoires validés
☐ **NON** - Critères manquants : _______________________________

### Signatures

**Consultant Pilote :**
- Nom : _________________
- Date : _________________
- Signature : _________________

**Développeur :**
- Nom : _________________
- Date : _________________
- Signature : _________________

**Product Owner :**
- Nom : _________________
- Date : _________________
- Signature : _________________

---

## 📝 Notes et Commentaires Additionnels

**Points Forts Identifiés :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Points Faibles Identifiés :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Améliorations Prioritaires Suggérées :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Autres Commentaires :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Document préparé pour STORY-009**
**Version:** 1.0
**Dernière mise à jour:** 2026-01-19
