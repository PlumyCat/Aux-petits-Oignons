# Product Brief: OpenCode Enterprise (Aux petits Oignons)

**Date:** 2026-01-18
**Author:** eric
**Version:** 1.0
**Project Type:** CLI
**Project Level:** 1

---

## Executive Summary

OpenCode Enterprise, commercialisé sous le nom "Aux petits Oignons", est un outil CLI qui permet aux consultants internes (experts Power Apps mais débutants Azure) de déployer de manière autonome la partie Azure (Azure Functions + services) lors de déploiements de bots Microsoft Copilot Studio chez les clients. L'outil offre une installation zero-friction via exe, une page d'accueil personnalisée avec guidance, et des modèles de déploiement pré-configurés optimisés pour réduire les erreurs, autonomiser les 5 consultants, et gérer le nombre croissant de déploiements clients sans créer de goulot d'étranglement.

---

## Problem Statement

### The Problem

Les consultants internes, bien qu'experts en Power Apps, sont débutants totaux sur Azure et ne peuvent pas déployer la partie infrastructure Azure de manière autonome. Actuellement, ils doivent faire appel au responsable technique pour chaque déploiement, ce qui crée un goulot d'étranglement. Un déploiement manuel prend environ 1 heure, et en cas de problème, les consultants ne savent pas diagnostiquer ou résoudre les erreurs Azure. Le responsable technique doit intervenir systématiquement alors que ce n'est pas son rôle principal.

### Why Now?

L'activité de déploiement de bots Copilot Studio chez les clients est en phase de lancement et doit scaler rapidement. Le responsable technique doit se concentrer sur ses tâches stratégiques principales et ne peut pas continuer à assurer tous les déploiements Azure. La délégation aux consultants est nécessaire maintenant pour permettre la croissance de l'activité.

### Impact if Unsolved

Si le problème n'est pas résolu, le responsable technique reste le goulot d'étranglement pour tous les déploiements Azure, rendant impossible la scalabilité de l'activité de déploiement clients. Les projets clients risquent d'être retardés, et le responsable technique ne peut pas se concentrer sur ses responsabilités principales.

---

## Target Audience

### Primary Users

**5 consultants internes** spécialisés en Power Apps et Microsoft Copilot Studio :
- **Niveau Power Apps :** Experts, maîtrisent parfaitement la plateforme
- **Niveau Azure :** Débutants totaux, aucune expérience Azure
- **Niveau Terminal/CLI :** Moyen, à l'aise mais pas experts
- **Comportement actuel :** Suivent une documentation qui explique les déploiements via l'interface graphique Azure Portal. En cas de blocage sur Azure, sollicitent systématiquement le responsable technique.
- **Environnement :** Windows, utilisent principalement des outils graphiques pour Power Apps

### Secondary Users

**Responsable technique (créateur du projet) :**
- Utilisation pour maintenance, évolutions de l'outil, support des cas exceptionnels complexes
- Objectif : libérer son temps des déploiements de routine

### User Needs

Les 3 besoins principaux des consultants :

1. **Simplicité d'utilisation** : Interface CLI intuitive qui ne nécessite pas d'expertise Azure
2. **Guidance étape par étape** : Assistance IA qui guide le déploiement du début à la fin
3. **Modèles prêts à l'emploi** : Templates de déploiement Azure pré-configurés et validés
4. **Messages d'erreur clairs et débogage** : Aide au diagnostic en cas de problème, avec suggestions de résolution

---

## Solution Overview

### Proposed Solution

"Aux petits Oignons" est un fork personnalisé d'OpenCode pour usage entreprise, spécialement adapté aux déploiements Azure de bots Copilot Studio. L'outil fonctionne en CLI dans le terminal et offre :

- **Installation zero-friction :** Distribution via un fichier exe avec auto-update intégré (pas besoin d'installer Node.js, VSCode, ou autres dépendances)
- **Page d'accueil personnalisée :** Message de bienvenue, guide de démarrage rapide, liste des commandes disponibles contextualisées pour les déploiements Azure
- **Modèle IA pré-configuré :** Modèle optimisé (coût/performance) pour guider les consultants dans leurs déploiements, accessible via Azure AI Foundry
- **Templates de déploiement :** Modèles pré-configurés pour Azure Functions + services standards
- **Configuration entreprise verrouillée :** Standards de sécurité et bonnes pratiques Azure appliqués automatiquement

### Key Features

**Fonctionnalités Core (Must-Have) :**

1. **Installation automatique via exe avec auto-update**
   - Pas de configuration manuelle, l'exe gère tout
   - Mises à jour automatiques sans intervention utilisateur

2. **Environnement CLI standalone**
   - Pas de dépendances externes (VSCode, Node.js, etc.)
   - Tout fonctionne dans le terminal intégré

3. **Page d'accueil personnalisée "Aux petits Oignons"**
   - Message de bienvenue personnalisé pour l'équipe
   - Guide de démarrage rapide pour premier déploiement
   - Liste contextuelle des commandes disponibles

4. **Modèle IA pré-configuré pour Azure**
   - Optimisé pour le coût (modèle plus simple que Claude Sonnet)
   - Configuré spécifiquement pour guider les déploiements Azure Functions + services
   - Accessible via Azure AI Foundry

5. **Déploiement Azure automatisé**
   - Templates pour Azure Functions
   - Configuration des services Azure associés
   - Application automatique des standards de sécurité entreprise

6. **Configuration entreprise standardisée et verrouillée**
   - Bonnes pratiques Azure appliquées par défaut
   - Nomenclature et tags standardisés
   - Paramètres de sécurité conformes aux politiques entreprise

7. **Messages d'erreur clairs et guidance de débogage**
   - Diagnostic automatique des erreurs courantes
   - Suggestions de résolution contextuelles
   - Liens vers documentation pertinente

8. **Documentation utilisateur intégrée**
   - Guide de démarrage rapide
   - Exemples de déploiement
   - FAQ et troubleshooting

### Value Proposition

"Aux petits Oignons" permet aux consultants Power Apps de déployer la partie Azure de manière totalement autonome, sans connaissances Azure préalables, grâce à une installation zero-friction et une assistance IA guidée étape par étape. L'outil élimine le goulot d'étranglement du responsable technique tout en garantissant des déploiements conformes aux standards de sécurité entreprise.

---

## Business Objectives

### Goals

**Objectif 1 : Autonomie des consultants (2 mois)**
- Les 5 consultants sont capables de réaliser 90% des déploiements Azure sans assistance d'ici 2 mois

**Objectif 2 : Libération du temps du responsable technique (3 mois)**
- Réduire le temps d'intervention du responsable technique sur les déploiements de 100% à moins de 10% (interventions exceptionnelles uniquement) d'ici 3 mois

**Objectif 3 : Efficacité opérationnelle (1 mois)**
- Réduire le temps moyen de déploiement de 60 minutes (manuel via portail) à 15-20 minutes (avec "Aux petits Oignons") d'ici 1 mois

**Objectif 4 : Scalabilité (6 mois)**
- Passer de la capacité actuelle (dépendante du responsable technique) à 10-15 déploiements clients par mois d'ici 6 mois

### Success Metrics

- **Taux de déploiements réussis sans intervention :** >90%
- **Temps moyen de déploiement :** <20 minutes
- **Taux d'adoption de l'outil :** 100% (5/5 consultants)
- **Taux d'erreur de déploiement :** <5%
- **Nombre de déploiements mensuels :** 10-15 d'ici 6 mois

### Business Value

- **Gain de temps :** Le responsable technique libère ~80% de son temps actuellement consacré aux déploiements pour se concentrer sur ses tâches principales (architecture, innovation, projets stratégiques)
- **Scalabilité :** Capacité à scaler l'activité de déploiement x3 à x5 sans ajouter de ressources
- **Réduction des délais :** Déploiements clients 3x plus rapides (60min → 15-20min), amélioration de la satisfaction client
- **Qualité et conformité :** Standardisation des déploiements selon les bonnes pratiques Azure, réduction des erreurs et risques de sécurité
- **Autonomie d'équipe :** Les consultants gagnent en compétences et autonomie, réduisant la dépendance organisationnelle

---

## Scope

### In Scope

**Cette version d'"Aux petits Oignons" inclut :**

- Fork et personnalisation d'OpenCode pour usage entreprise
- Développement de la page d'accueil personnalisée "Aux petits Oignons" (message bienvenue, guide démarrage, liste commandes)
- Sélection limitée de modèles IA pré-configurés et optimisés coût/performance pour déploiements Azure
- Configuration entreprise standardisée et verrouillée (sécurité, nomenclature, tags)
- Packaging et distribution via exe avec système d'auto-update (développé dans projet séparé)
- Automatisation du déploiement Azure (Azure Functions + services associés)
- Documentation utilisateur complète pour les consultants
- Messages d'erreur clairs et système de guidance pour le débogage
- Gestion sécurisée des credentials Azure (via Azure CLI authentication)

### Out of Scope

**Explicitement HORS périmètre pour cette version :**

- Déploiement de la partie Power Apps (déjà maîtrisée par les consultants)
- Support multi-cloud (AWS, GCP) - Azure uniquement
- Interface graphique / UI web - CLI uniquement
- Gestion des utilisateurs / système de permissions / rôles
- Formation Azure approfondie ou certification
- Support de scénarios Azure complexes au-delà de Azure Functions + services standards
- Monitoring / observabilité avancée des déploiements
- Pipeline CI/CD complet
- Tests automatisés des déploiements

### Future Considerations

**Fonctionnalités potentielles pour versions ultérieures (non planifiées) :**

- Extension des templates Azure pour scénarios plus complexes
- Tableau de bord de monitoring des déploiements
- Intégration avec d'autres services Azure (Container Apps, AKS, etc.)
- Support multi-environnements avancé (dev/staging/prod)
- Analytics sur l'utilisation de l'outil et KPIs de déploiement
- Bibliothèque de snippets et exemples de code Azure
- Intégration avec système de ticketing entreprise

---

## Key Stakeholders

**Responsable technique (créateur du projet) - Influence : High**
- Porteur du projet, développeur principal, responsable technique
- Délègue les déploiements Azure aux consultants
- Assure la maintenance et le support de l'outil
- Objectif : Se libérer du temps pour se concentrer sur ses responsabilités principales

**5 Consultants internes - Influence : Medium**
- Utilisateurs finaux quotidiens de l'outil
- Experts Power Apps, débutants Azure
- Leur adoption et satisfaction sont critiques pour le succès du projet
- Objectif : Gagner en autonomie pour les déploiements Azure sans devenir experts Azure

---

## Constraints and Assumptions

### Constraints

**Contraintes techniques :**
- Doit être basé sur OpenCode (fork du projet open source)
- Fonctionne uniquement en CLI/terminal (pas d'interface graphique)
- Environnement Azure uniquement (pas de support multi-cloud)
- Budget API/coût du modèle IA optimisé (nécessité d'utiliser un modèle moins coûteux que Claude Sonnet tout en conservant une guidance efficace)

**Contraintes de ressources :**
- Développement solo par le responsable technique
- Temps de développement limité (le responsable a d'autres tâches prioritaires)
- Budget limité pour les coûts d'API IA

**Contraintes utilisateur :**
- Les consultants ont un niveau Azure débutant total
- Niveau terminal/CLI moyen (peuvent nécessiter de l'accompagnement)
- Habitude des interfaces graphiques (risque de résistance au CLI)

### Assumptions

**Hypothèses techniques :**
- Les consultants ont accès à un ordinateur Windows avec droits d'installation d'applications
- Ils disposent de credentials Azure valides avec les permissions nécessaires pour déployer des ressources
- L'infrastructure Azure cible (subscription, resource groups) est déjà provisionnée et accessible
- Le système d'auto-update de l'exe fonctionne de manière fiable (développé dans projet séparé)

**Hypothèses utilisateur :**
- Les consultants accepteront d'utiliser un outil CLI plutôt que l'interface graphique Azure Portal
- Ils sont motivés à gagner en autonomie sur Azure
- Leur niveau terminal moyen est suffisant pour utiliser des commandes CLI guidées

**Hypothèses IA :**
- Le modèle IA optimisé (moins puissant que Claude Sonnet) sera suffisamment performant pour guider efficacement les débutants Azure
- L'assistance IA compensera le manque de connaissances Azure des consultants

**Hypothèses organisationnelles :**
- Les déploiements clients suivront un pattern standardisé (Azure Functions + services)
- Le volume de déploiements restera dans la capacité de 5 consultants
- Le responsable technique reste disponible pour les cas exceptionnels complexes

---

## Success Criteria

**Au-delà des métriques quantitatives, le projet sera considéré comme un succès si :**

1. **Adoption utilisateur complète**
   - Les 5 consultants utilisent "Aux petits Oignons" comme outil principal pour tous leurs déploiements Azure
   - Aucun retour à la documentation graphique ou demandes systématiques au responsable technique

2. **Autonomie réelle et diagnostique**
   - Les consultants sont capables de diagnostiquer et résoudre les erreurs de déploiement courantes sans aide
   - Ils comprennent les messages d'erreur et savent utiliser les outils de débogage fournis

3. **Satisfaction utilisateur élevée**
   - Les consultants considèrent l'outil comme une aide précieuse, pas une contrainte imposée
   - Feedback positif sur l'expérience utilisateur et la guidance IA
   - Les consultants gagnent en confiance sur Azure

4. **Qualité et conformité des déploiements**
   - Les déploiements réalisés via l'outil sont conformes aux standards de sécurité entreprise
   - Application systématique des bonnes pratiques Azure
   - Aucune dérive de configuration par rapport aux standards

5. **Scalabilité prouvée**
   - L'équipe réalise plusieurs déploiements clients en parallèle sans goulot d'étranglement
   - Les consultants se partagent naturellement la charge de travail

6. **ROI temps confirmé**
   - Le responsable technique ne consacre plus de temps aux déploiements de routine
   - Intervention uniquement pour cas exceptionnels complexes (<10% du temps initial)
   - Temps libéré réinvesti dans activités à plus forte valeur ajoutée

---

## Timeline and Milestones

### Target Launch

**Lancement complet : Fin semaine 6 (environ 1,5 mois à partir du démarrage)**

### Key Milestones

**Semaine 1-2 : Conception et préparation**
- Finaliser les spécifications techniques détaillées
- Préparer les templates de déploiement Azure (Azure Functions + services)
- Configurer et tester le modèle IA optimisé sur Azure AI Foundry
- Définir les standards et configurations entreprise à verrouiller

**Semaine 3-4 : Développement core**
- Fork et personnalisation initiale d'OpenCode
- Développement de la page d'accueil personnalisée "Aux petits Oignons"
- Intégration des modèles IA pré-configurés
- Implémentation de la configuration entreprise standardisée et verrouillée
- Développement des commandes de déploiement Azure automatisé

**Semaine 5 : Tests et ajustements**
- Tests internes par le responsable technique
- Tests pilotes avec 1-2 consultants volontaires
- Collecte de feedback et ajustements basés sur retours utilisateurs
- Corrections de bugs et amélioration UX
- Finalisation de la documentation utilisateur

**Semaine 6 : Déploiement et formation**
- Packaging final et distribution de l'exe à tous les consultants
- Session de formation / onboarding en équipe
- Démonstration des gains de temps et fonctionnalités clés
- Support actif et accompagnement pendant la phase d'adoption initiale
- Lancement officiel

**Post-lancement : Suivi et amélioration continue**
- Monitoring de l'adoption et des métriques de succès
- Support réactif pendant les premières semaines
- Ajustements et améliorations basés sur les retours terrain

---

## Risks and Mitigation

### Risk 1: Résistance au changement - Adoption de l'outil CLI

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Description :** Les consultants, habitués à l'interface graphique Azure Portal, peuvent résister à l'utilisation d'un outil en ligne de commande, perçu comme plus complexe ou moins intuitif.
- **Mitigation :**
  - Formation progressive avec démonstrations concrètes des gains de temps (60min → 15-20min)
  - Démarrage avec 1-2 consultants pilotes motivés pour créer des champions internes
  - Assistance IA très guidée avec prompts clairs et messages étape par étape
  - Communication sur les bénéfices : autonomie, rapidité, pas de dépendance au responsable technique
  - Support intensif pendant les premières semaines pour rassurer et accompagner

### Risk 2: Modèle IA insuffisant pour guider les débutants

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Description :** Le modèle IA optimisé (moins puissant et coûteux que Claude Sonnet) pourrait ne pas fournir une guidance suffisamment claire et complète pour des consultants débutants totaux sur Azure, entraînant frustration et échecs de déploiement.
- **Mitigation :**
  - Phase de tests approfondis du modèle IA avec scénarios réels de déploiement avant lancement
  - Enrichissement des prompts système et du contexte fourni au modèle
  - Documentation complémentaire détaillée intégrée à l'outil
  - Possibilité de revenir à un modèle plus puissant (ex: Claude Sonnet) si les tests montrent une insuffisance
  - Système de feedback utilisateur pour identifier les lacunes de guidance

### Risk 3: Scénarios Azure non couverts par les templates

- **Probabilité :** Moyenne
- **Impact :** Moyen
- **Description :** Les consultants rencontrent des cas d'usage ou configurations Azure non prévus dans les templates standardisés, nécessitant des adaptations ou solutions personnalisées.
- **Mitigation :**
  - Définir clairement le scope supporté dans la documentation (Azure Functions + services standards)
  - Process d'escalade formalisé vers le responsable technique pour cas complexes hors scope
  - Enrichissement progressif de la bibliothèque de templates basé sur les besoins récurrents
  - Communication transparente : l'outil couvre 90% des cas, les 10% complexes restent gérés par le responsable technique
  - Roadmap d'évolution basée sur les retours terrain

### Risk 4: Problèmes de credentials et sécurité Azure

- **Probabilité :** Moyenne
- **Impact :** Élevé
- **Description :** Gestion complexe des credentials Azure (authentication, permissions, secrets), risques de fuites de credentials, déploiements échoués par manque de permissions, ou mauvaise configuration de sécurité.
- **Mitigation :**
  - Utiliser Azure CLI authentication standard (az login) plutôt que gestion manuelle de secrets
  - Documentation claire et détaillée sur la configuration initiale des permissions Azure
  - Validation automatique des credentials avant déploiement
  - Application stricte des standards de sécurité entreprise (configuration verrouillée)
  - Audit et logging de tous les déploiements pour traçabilité
  - Formation sur les bonnes pratiques de gestion des credentials

### Risk 5: Dépendance persistante sur le responsable technique pendant la transition

- **Probabilité :** Élevée
- **Impact :** Moyen
- **Description :** Les consultants continuent de solliciter le responsable technique par habitude ou manque de confiance, même avec l'outil disponible, retardant l'atteinte de l'objectif d'autonomie.
- **Mitigation :**
  - Communication claire sur la transition et les attentes d'autonomie
  - Encouragement actif et valorisation de l'utilisation de l'outil
  - Support initial intensif (semaines 1-2 post-lancement) pour rassurer et former
  - Réduction progressive du support pour forcer l'autonomie
  - Partage des succès et célébration des premiers déploiements autonomes réussis
  - Feedback régulier sur les progrès individuels et d'équipe

---

## Next Steps

1. **Créer une Spécification Technique (Tech Spec)** - `/tech-spec`
   - Définir l'architecture technique d'OpenCode Enterprise
   - Détailler les modifications du fork OpenCode
   - Spécifier l'intégration du modèle IA et configuration Azure
   - Planifier l'implémentation de la page d'accueil personnalisée

2. **Optionnel : Sprint Planning** - `/sprint-planning`
   - Décomposer le projet en stories de développement
   - Prioriser les fonctionnalités
   - Planifier les sprints sur 6 semaines

---

**Ce document a été créé avec BMAD Method v6 - Phase 1 (Analysis)**

*Pour continuer : Exécutez `/workflow-status` pour voir votre progression et le prochain workflow recommandé.*
