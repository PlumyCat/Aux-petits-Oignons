# STORY-001: Setup Initial et Configuration de Base

**Epic:** EPIC-FOUNDATION - Infrastructure de base
**Priority:** Must Have
**Story Points:** 3
**Status:** Not Started
**Assigned To:** Unassigned
**Created:** 2026-01-18
**Sprint:** Sprint 1 (Semaines 1-2)

---

## User Story

En tant que **développeur**,
Je veux **forker OpenCode et configurer l'environnement de base pour "Aux petits Oignons"**,
Afin que **je puisse commencer le développement des personnalisations entreprise sur une base stable et fonctionnelle**.

---

## Description

### Background

"Aux petits Oignons" est un fork personnalisé d'OpenCode destiné aux consultants internes pour automatiser les déploiements Azure de bots Copilot Studio. Avant de pouvoir implémenter les fonctionnalités spécifiques (page d'accueil personnalisée, multi-modèles IA, templates Azure), nous devons établir une base stable en forkant le projet OpenCode et en configurant l'environnement de développement.

Cette story est la **fondation** du projet. Elle établit :
- Le repository Git forké
- L'environnement de développement fonctionnel (Bun + TypeScript + SolidJS)
- Le branding initial "Aux petits Oignons"
- La structure de base pour les personnalisations futures

### Scope

**In scope:**
- Forker le repository OpenCode depuis https://github.com/anomalyco/opencode
- Configurer l'environnement de développement local (Bun, dependencies)
- Renommer le projet en "Aux petits Oignons" dans les fichiers de configuration
- Build réussi du fork (pas d'erreurs TypeScript)
- Tests de base passants
- Documentation du setup pour autres développeurs (si applicable)
- Nettoyage des fonctionnalités OpenCode non nécessaires pour usage entreprise

**Out of scope:**
- Personnalisations fonctionnelles (page d'accueil, modèles IA, etc.) → stories suivantes
- Intégration Azure → STORY-005, STORY-006
- Configuration entreprise verrouillée → STORY-004
- Packaging exe → géré dans projet séparé (deploy-trad-bot-container)

### User Flow

1. **Développeur clone le fork** depuis le nouveau repository
2. **Installe Bun** (si pas déjà installé)
3. **Exécute `bun install`** pour installer les dépendances
4. **Exécute `bun run dev`** pour lancer l'application en mode développement
5. **Vérifie que l'application démarre** sans erreur
6. **Exécute `bun run typecheck`** pour vérifier les types TypeScript
7. **Vérifie le branding** "Aux petits Oignons" dans l'interface
8. **Commit et push** les changements initiaux

---

## Acceptance Criteria

### Setup et Environnement

- [ ] **Repository forké** : Fork d'OpenCode créé et clonable
- [ ] **Dependencies installées** : `bun install` s'exécute sans erreur
- [ ] **Build réussi** : `bun run dev` démarre l'application sans erreur
- [ ] **TypeScript valide** : `bun run typecheck` passe sans erreur TypeScript
- [ ] **Tests de base passants** : Tests existants d'OpenCode passent (si applicable)

### Branding "Aux petits Oignons"

- [ ] **Nom du projet** : `package.json` contient `"name": "aux-petits-oignons"`
- [ ] **Description mise à jour** : `package.json` description reflète le projet entreprise
- [ ] **Titre affiché** : L'interface affiche "Aux petits Oignons" au lieu de "OpenCode"
- [ ] **README personnalisé** : README.md contient les informations du projet entreprise

### Structure et Nettoyage

- [ ] **Fonctionnalités inutiles supprimées** : Fonctionnalités OpenCode non nécessaires pour usage entreprise retirées ou désactivées
- [ ] **Structure prête** : Dossiers/fichiers préparés pour futures personnalisations :
  - `/src/enterprise/` pour code spécifique entreprise
  - `/config/enterprise-config.json` placeholder (sera configuré dans STORY-004)
  - `/docs/` pour documentation projet

### Documentation

- [ ] **Setup documenté** : Instructions claires dans README pour cloner, installer, et lancer le projet
- [ ] **Environnement spécifié** : Versions de Bun, Node, et autres tools requises documentées
- [ ] **Architecture initiale** : Document de base expliquant structure du fork et différences avec OpenCode upstream

---

## Technical Notes

### Components Involved

**Repository & Git:**
- Fork depuis : `https://github.com/anomalyco/opencode`
- Nouveau repository : `aux-petits-oignons` (ou nom défini par l'organisation)
- Branch principale : `main`
- Branch de développement : `dev`

**Build System:**
- **Runtime:** Bun 1.3.5+
- **Package Manager:** Bun (défini dans `package.json` : `"packageManager": "bun@1.3.5"`)
- **Monorepo:** Turbo pour orchestration des workspaces

**Stack Technique:**
- **TypeScript:** 5.8.2 (strict mode)
- **Frontend:** SolidJS 1.9.10
- **Backend:** Hono 4.10.7
- **Build:** Vite 7.1.4

### Changes Required

**1. Fork et Clone:**
```bash
# Forker depuis GitHub UI
# Ensuite cloner localement
git clone https://github.com/<organization>/aux-petits-oignons.git
cd aux-petits-oignons
```

**2. Installation:**
```bash
# Installer Bun (si nécessaire)
curl -fsSL https://bun.sh/install | bash

# Installer dependencies
bun install
```

**3. Renommage et Branding:**

Fichiers à modifier :
- `package.json` :
  ```json
  {
    "name": "aux-petits-oignons",
    "description": "Outil CLI entreprise pour déploiements Azure de bots Copilot Studio"
  }
  ```
- `README.md` : Réécrire pour le projet entreprise
- `packages/opencode/package.json` : Mettre à jour le nom
- Fichiers UI affichant "OpenCode" → remplacer par "Aux petits Oignons"

**4. Structure de Répertoires:**

Créer les dossiers pour futures stories :
```
/src/enterprise/           # Code spécifique entreprise
  /config/                 # Configuration entreprise
  /models/                 # Configuration modèles IA
  /azure/                  # Intégration Azure
  /ui/                     # Composants UI personnalisés
/config/
  enterprise-config.json   # Config entreprise (placeholder)
/docs/
  setup.md                 # Documentation setup
  architecture.md          # Architecture du fork
```

**5. Nettoyage (Optionnel - si identifié):**

Désactiver ou retirer fonctionnalités OpenCode non nécessaires :
- Certaines intégrations tierces non utilisées
- Exemples/demos OpenCode
- Features expérimentales non nécessaires

### Security Considerations

- **Pas de credentials en dur** : Vérifier qu'aucun secret OpenCode n'est commité
- **Dependencies audit** : Exécuter `bun audit` pour vérifier vulnérabilités
- **Gitignore** : Vérifier que `.env`, `*.key`, etc. sont bien ignorés

### Edge Cases

- **Conflits de merge avec upstream** : Documenter stratégie de sync avec OpenCode upstream
- **Breaking changes Bun** : Spécifier version exacte de Bun dans README
- **Workspaces complexes** : Si monorepo pose problème, documenter structure

---

## Dependencies

### Prerequisite Stories

**Aucune** - C'est la première story du projet

### Blocked Stories

Cette story **bloque toutes les autres stories** du projet :
- STORY-002: Configuration Multi-Modèles IA
- STORY-003: Page d'Accueil Personnalisée
- STORY-004: Configuration Entreprise Verrouillée
- STORY-005: Templates de Déploiement Azure
- STORY-006: Intégration Azure SDK
- STORY-007: Messages d'Erreur et Guidance
- STORY-008: Documentation Utilisateur
- STORY-009: Tests avec Consultants Pilotes

### External Dependencies

**Tools Requis:**
- **Bun 1.3.5+** installé sur machine de développement
- **Git** configuré
- **GitHub** accès au repository OpenCode pour fork

**Infrastructure:**
- **Repository Git** créé et accessible
- **Permissions** : Accès en écriture au repository

**Documentation:**
- **OpenCode README** : Pour comprendre structure existante
- **Bun documentation** : Pour setup et troubleshooting

---

## Definition of Done

### Code et Build

- [ ] Code forké et commité sur repository "aux-petits-oignons"
- [ ] `bun install` s'exécute sans erreur ni warning critique
- [ ] `bun run dev` lance l'application en mode développement
- [ ] `bun run typecheck` passe sans erreur TypeScript
- [ ] Tous les tests existants d'OpenCode passent (si applicable)

### Branding et Configuration

- [ ] Tous les fichiers de configuration contiennent "Aux petits Oignons"
- [ ] Interface affiche "Aux petits Oignons" au lancement
- [ ] README.md reflète le projet entreprise avec instructions claires

### Structure de Projet

- [ ] Dossiers `/src/enterprise/` créés avec structure de base
- [ ] Fichier `/config/enterprise-config.json` placeholder créé
- [ ] Documentation `/docs/setup.md` et `/docs/architecture.md` créée

### Validation et Approbation

- [ ] Code reviewé par au moins 1 développeur (si équipe)
- [ ] Documentation validée (setup fonctionnel pour autre développeur)
- [ ] Responsable technique approuve le setup de base
- [ ] Aucune régression par rapport à OpenCode (build, tests)

### Déploiement

- [ ] Code mergé sur branch `main`
- [ ] Tag git créé : `v0.1.0-setup`
- [ ] CI/CD setup (si applicable) fonctionne

---

## Story Points Breakdown

**Estimation : 3 Story Points** (équivalent ~1 jour de travail)

### Breakdown Détaillé

| Tâche | Complexité | Points |
|-------|------------|--------|
| Fork repository et clone local | Trivial | 0.5 |
| Installation Bun + dependencies | Simple | 0.5 |
| Renommage et branding (package.json, UI, README) | Simple | 1 |
| Création structure de dossiers | Trivial | 0.5 |
| Documentation setup | Simple | 0.5 |
| **Total** | | **3** |

### Rationale

- **Complexité modérée** : Pas de code métier complexe, principalement du setup
- **Tâches bien définies** : Fork, install, renommage sont des opérations standard
- **Peu d'inconnus** : OpenCode est un projet open source documenté
- **Pas de dépendances bloquantes** : Tout peut être fait en autonomie
- **Estimation conservative** : Inclut temps pour documentation et validation

**Risques augmentant l'effort :**
- Problèmes de compatibilité Bun (déjà testé, risque faible)
- Structure monorepo complexe (nécessite exploration, +0.5 jour possible)
- Nettoyage approfondi de fonctionnalités OpenCode (si nécessaire, +0.5 jour)

---

## Additional Notes

### Upstream Sync Strategy

Bien que cette story ne l'implémente pas, il faut penser à la stratégie de sync avec OpenCode upstream :

**Option recommandée :** Merge périodique de `upstream/main` dans `dev`
```bash
git remote add upstream https://github.com/anomalyco/opencode.git
git fetch upstream
git merge upstream/main
# Résoudre conflits si nécessaire
```

**Fréquence :** Mensuelle ou quand nouvelles features intéressantes

**Documentation :** À ajouter dans `/docs/upstream-sync.md` (STORY future si nécessaire)

### Testing Strategy

**Unit Tests :**
- Aucun nouveau test requis pour cette story (setup uniquement)
- Vérifier que tests OpenCode existants passent toujours

**Integration Tests :**
- Test manuel : Lancer `bun run dev` et vérifier l'affichage
- Test manuel : Vérifier que le branding "Aux petits Oignons" est visible

**Manual Testing Checklist :**
- [ ] Clone depuis repository → `bun install` → `bun run dev` fonctionne
- [ ] Application se lance et affiche "Aux petits Oignons"
- [ ] `bun run typecheck` passe
- [ ] README est clair et permet à un nouveau développeur de setup le projet

### Rollout Plan

**Pas de rollout nécessaire** - Setup de développement local uniquement

---

## Progress Tracking

### Status History

- **2026-01-18** : Créé par eric (Scrum Master)
- **TBD** : Started by [Developer]
- **TBD** : Code review by [Reviewer]
- **TBD** : Completed

### Actual Effort

**TBD** (sera rempli pendant/après implémentation)

**Effort estimé :** 3 points (~1 jour)
**Effort réel :** ___ points
**Variance :** ___ points
**Raison de la variance :** ___

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation Planning)**

*Prochaine étape : Exécuter `/dev-story STORY-001` pour commencer l'implémentation.*
