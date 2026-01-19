# Guide de Tests Pilotes - OpenCode Enterprise

**Version:** 1.0
**Date:** 2026-01-19
**Story:** STORY-009

## 🎯 Objectif des Tests Pilotes

Valider OpenCode Enterprise "Aux petits Oignons" avec 1-2 consultants pilotes avant le déploiement complet auprès de tous les consultants Tradebyte. Cette phase permet de :

- ✅ Valider que l'outil répond aux besoins réels des consultants
- ✅ Identifier les bugs et problèmes d'ergonomie
- ✅ Collecter du feedback pour améliorer l'expérience utilisateur
- ✅ Confirmer que les déploiements Azure fonctionnent en conditions réelles
- ✅ Ajuster la documentation et la formation si nécessaire

## 👥 Sélection des Consultants Pilotes

### Critères de Sélection

**Profil idéal :**
- ✓ Consultant travaillant activement sur des projets Power Apps
- ✓ Familiarité de base avec Azure et les concepts cloud
- ✓ Utilise déjà des outils CLI (bonus mais non obligatoire)
- ✓ Disponible pour 2-3 sessions de 1-2 heures sur une semaine
- ✓ À l'aise pour donner du feedback constructif
- ✓ Bon communicateur, capable d'exprimer clairement les problèmes rencontrés

**Nombre recommandé :** 1-2 consultants
- 1 consultant permet une validation approfondie avec feedback détaillé
- 2 consultants permettent de croiser les retours et d'identifier les patterns

### Processus de Sélection

1. **Identifier les candidats potentiels** auprès des leads consultants
2. **Expliquer l'objectif** : aider à valider un nouvel outil d'automatisation Azure
3. **Estimer le temps nécessaire** : 4-5 heures réparties sur 5 jours
4. **Confirmer la disponibilité** et obtenir l'engagement
5. **Planifier les sessions** dès que possible

## 📅 Planning des Tests (5 jours)

### Jour 1 : Formation Initiale (1.5-2 heures)

**Objectif :** Introduire l'outil et former sur les bases

**Programme :**
1. **Présentation du contexte** (15 min)
   - Pourquoi OpenCode Enterprise a été créé
   - Problèmes qu'il résout (automatisation Azure, configuration complexe)
   - Architecture générale (fork OpenCode + extensions Azure)

2. **Installation et Setup** (30 min)
   - Installation d'OpenCode via npm/bun
   - Vérification des prérequis (Azure CLI, Node.js)
   - Configuration de base (authentication Azure)
   - Premier `opencode aux help quickstart`

3. **Démonstration guidée** (30 min)
   - Déploiement dev simple : `opencode aux deploy`
   - Vérification du statut : `opencode aux status`
   - Navigation dans la documentation : `opencode aux help`
   - Gestion d'une erreur courante (simulée)

4. **Questions & Réponses** (15 min)

**Livrables :**
- ✅ Consultant a OpenCode installé et configuré
- ✅ Premier déploiement dev réussi
- ✅ Consultant sait où trouver l'aide

### Jour 2-3 : Tests Autonomes (2 heures)

**Objectif :** Le consultant teste l'outil sur ses propres scénarios

**Scénarios de test à réaliser :**

**Scénario 1 : Déploiement Environnement de Dev**
```bash
opencode aux deploy
opencode aux status
```
- ✓ Déploiement réussi ?
- ✓ Resources créées correctement ?
- ✓ Temps de déploiement acceptable ?
- ✓ Messages clairs et compréhensibles ?

**Scénario 2 : Déploiement Environnement de Staging**
```bash
opencode aux deploy staging
opencode aux status rg-opencode-staging
```
- ✓ Paramètres staging appliqués ?
- ✓ Ressources distinctes de dev ?
- ✓ Configuration appropriée pour staging ?

**Scénario 3 : Consultation de la Documentation**
```bash
opencode aux help
opencode aux help quickstart
opencode aux help deploy
opencode aux help errors
```
- ✓ Documentation accessible et claire ?
- ✓ Navigation intuitive ?
- ✓ Exemples pertinents et utiles ?
- ✓ FAQ couvre les questions du consultant ?

**Scénario 4 : Gestion d'Erreurs**
- Provoquer une erreur intentionnelle (ex: mauvais resource group)
- Observer les messages d'erreur et suggestions
- ✓ Message d'erreur clair ?
- ✓ Suggestions actionnables ?
- ✓ Consultant a pu résoudre le problème seul ?

**Scénario 5 : Déploiement Personnalisé**
```bash
opencode aux deploy --resource-group rg-custom --location eastus
```
- ✓ Options personnalisées fonctionnent ?
- ✓ Flexibilité suffisante ?

**Instructions pour le consultant :**
- Tester chaque scénario dans l'ordre
- Noter toutes les difficultés rencontrées
- Capturer les messages d'erreur (screenshots si possible)
- Noter le temps passé sur chaque scénario
- Utiliser le formulaire de feedback (voir section Feedback)

### Jour 4 : Session de Feedback (1 heure)

**Objectif :** Collecter le feedback détaillé et identifier les améliorations

**Structure de la session :**

1. **Retour d'expérience général** (15 min)
   - Impression globale de l'outil
   - Points forts et points faibles
   - Comparaison avec l'approche actuelle (manuelle)

2. **Revue des scénarios** (30 min)
   - Parcourir chaque scénario testé
   - Identifier les blocages rencontrés
   - Discuter des messages d'erreur et leur clarté
   - Évaluer la documentation

3. **Suggestions d'amélioration** (15 min)
   - Fonctionnalités manquantes
   - Améliorations UX souhaitées
   - Questions restées sans réponse

**Formulaire de feedback à compléter** (voir PILOT-FEEDBACK-FORM.md)

### Jour 5 : Corrections et Re-test (1 heure optionnelle)

**Objectif :** Si des bugs critiques sont identifiés, les corriger et re-tester

**Processus :**
1. Correction des bugs identifiés
2. Déploiement de la nouvelle version
3. Re-test des scénarios problématiques
4. Validation finale

## ✅ Critères d'Acceptation pour les Tests Pilotes

### Critères de Succès Obligatoires

**Installation & Setup :**
- [ ] Le consultant a pu installer OpenCode sans aide technique avancée
- [ ] Les prérequis Azure CLI sont clairs et vérifiables
- [ ] La configuration initiale est intuitive

**Déploiements Azure :**
- [ ] Au moins 2 déploiements (dev + staging) réussis par consultant
- [ ] Temps de déploiement < 5 minutes par environnement
- [ ] Aucune erreur bloquante lors des déploiements standard
- [ ] Les ressources Azure sont créées correctement

**Documentation & Aide :**
- [ ] Le consultant a pu résoudre au moins 1 problème seul via `aux help`
- [ ] La navigation dans la documentation est claire
- [ ] Les exemples sont pertinents et utilisables directement

**Messages d'Erreur :**
- [ ] Tous les messages d'erreur sont en français et compréhensibles
- [ ] Les suggestions de résolution sont actionnables
- [ ] Le mode verbose fournit suffisamment de détails pour le debugging

**Experience Utilisateur :**
- [ ] Le consultant recommanderait l'outil à ses collègues (Net Promoter Score ≥ 8/10)
- [ ] Le temps gagné vs approche manuelle est significatif (≥ 50%)
- [ ] Aucun bug critique bloquant identifié

### Critères de Succès Optionnels (Nice-to-Have)

- [ ] Le consultant est autonome après 1 seule session de formation
- [ ] Zéro question de support après Jour 2
- [ ] Le consultant a suggéré des améliorations pertinentes
- [ ] Le consultant a testé des scénarios avancés non prévus

## 📊 Métriques à Collecter

### Métriques Quantitatives

**Temps :**
- Durée installation : _____ minutes
- Durée premier déploiement : _____ minutes
- Durée déploiement staging : _____ minutes
- Temps total de formation : _____ heures

**Succès :**
- Nombre de déploiements réussis : _____ / _____
- Nombre d'erreurs rencontrées : _____
- Nombre d'erreurs résolues en autonomie : _____ / _____

**Utilisation :**
- Commandes les plus utilisées : _________________
- Sections d'aide les plus consultées : _________________
- Nombre de consultations de la documentation : _____

### Métriques Qualitatives

**Satisfaction (échelle 1-10) :**
- Facilité d'installation : _____ / 10
- Clarté de la documentation : _____ / 10
- Utilité des messages d'erreur : _____ / 10
- Expérience globale : _____ / 10
- Recommandation à collègues : _____ / 10 (NPS)

**Feedback ouvert :**
- Ce qui a bien fonctionné : _________________
- Ce qui doit être amélioré : _________________
- Fonctionnalités manquantes : _________________

## 🐛 Process de Gestion des Bugs

### Catégorisation des Bugs

**Critique (P0) :**
- Empêche complètement l'utilisation de l'outil
- Corruption de données ou ressources Azure
- Faille de sécurité
- **Action :** Correction immédiate (Jour 5)

**Majeur (P1) :**
- Fonctionnalité importante non fonctionnelle
- Message d'erreur trompeur menant à de mauvaises actions
- Performance inacceptable (> 10 min pour déploiement standard)
- **Action :** Correction avant rollout complet

**Mineur (P2) :**
- Bug d'ergonomie ou de formatage
- Fonctionnalité secondaire non fonctionnelle
- Documentation incomplète ou peu claire
- **Action :** Correction dans itération suivante

**Enhancement (P3) :**
- Amélioration suggérée
- Nouvelle fonctionnalité
- Optimisation de performance
- **Action :** Backlog pour évaluation future

### Template de Rapport de Bug

```markdown
**Titre :** [Description courte du bug]

**Sévérité :** P0 / P1 / P2 / P3

**Scénario :** [Quel scénario de test ?]

**Étapes pour reproduire :**
1.
2.
3.

**Résultat attendu :**


**Résultat obtenu :**


**Logs / Screenshots :**


**Impact :** [En quoi cela bloque/gêne le consultant ?]

**Workaround trouvé :** [Le consultant a-t-il trouvé une solution de contournement ?]
```

## 📝 Documentation à Fournir aux Consultants

**Avant Jour 1 :**
- [ ] Email d'introduction avec planning des 5 jours
- [ ] Lien vers prérequis (Azure CLI, Node.js)
- [ ] Objectifs des tests pilotes

**Jour 1 :**
- [ ] Ce guide de test (PILOT-TEST-GUIDE.md)
- [ ] Checklist des critères d'acceptation (ACCEPTANCE-CRITERIA-CHECKLIST.md)
- [ ] Formulaire de feedback (PILOT-FEEDBACK-FORM.md)

**Jour 2 :**
- [ ] Rappel : scénarios de test à réaliser
- [ ] Lien vers documentation intégrée (`aux help`)

**Jour 4 :**
- [ ] Confirmation session de feedback

## 🎓 Résultats Attendus

À la fin de la phase de tests pilotes, nous devons avoir :

**Validations :**
- ✅ Confirmation que l'outil fonctionne en conditions réelles
- ✅ Validation que la documentation est suffisante
- ✅ Validation que les messages d'erreur guident efficacement

**Corrections :**
- ✅ Tous les bugs P0 corrigés
- ✅ Tous les bugs P1 corrigés ou planifiés
- ✅ Améliorations UX mineures (P2) documentées pour itération suivante

**Feedback :**
- ✅ Au moins 5 points de feedback constructif par consultant
- ✅ Net Promoter Score ≥ 8/10
- ✅ Liste de fonctionnalités enhancement pour backlog

**Préparation Rollout :**
- ✅ Plan de formation pour tous les consultants
- ✅ Documentation à jour et validée
- ✅ Process de support défini

## 📞 Support Pendant les Tests

**Disponibilité :** Développeur disponible pendant Jours 1-4 pour support

**Canaux de communication :**
- Email : [developer-email]
- Slack : #opencode-pilot-testing
- Réunion ad-hoc si blocage majeur

**Temps de réponse attendu :**
- Bug critique (P0) : < 2 heures
- Bug majeur (P1) : < 1 jour
- Questions générales : < 4 heures

## ✅ Validation Finale

**Avant de passer au rollout complet :**

- [ ] Tous les critères d'acceptation obligatoires validés
- [ ] Tous les bugs P0/P1 corrigés
- [ ] NPS moyen ≥ 8/10
- [ ] Documentation mise à jour suite au feedback
- [ ] Plan de formation général créé
- [ ] Process de support défini

**Approbation :**
- [ ] Consultant(s) pilote(s) : Approuvé
- [ ] Lead technique : Approuvé
- [ ] Product Owner : Approuvé

---

**Document préparé pour STORY-009**
**Version:** 1.0
**Dernière mise à jour:** 2026-01-19
