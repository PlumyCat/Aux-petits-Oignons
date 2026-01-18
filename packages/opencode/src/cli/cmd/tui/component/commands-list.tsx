import { useTheme } from "@tui/context/theme"
import { TextAttributes } from "@opentui/core"
import { For } from "solid-js"

const AZURE_COMMANDS = [
  {
    command: "aux init",
    description: "Initialiser l'environnement (az login check)",
  },
  {
    command: "aux deploy",
    description: "Démarrer un déploiement guidé par IA",
  },
  {
    command: "aux status",
    description: "Voir le statut des déploiements",
  },
  {
    command: "aux logs [id]",
    description: "Voir les logs d'un déploiement",
  },
  {
    command: "aux cancel [id]",
    description: "Annuler un déploiement en cours",
  },
]

const CONFIG_COMMANDS = [
  {
    command: "aux config show",
    description: "Afficher la configuration entreprise",
  },
  {
    command: "aux models list",
    description: "Lister les modèles IA disponibles",
  },
  {
    command: "aux models select",
    description: "Changer de modèle IA",
  },
]

const HELP_COMMANDS = [
  {
    command: "aux help",
    description: "Aide générale",
  },
  {
    command: "aux quickstart",
    description: "Guide de démarrage rapide",
  },
  {
    command: "aux faq",
    description: "Questions fréquentes",
  },
  {
    command: "aux version",
    description: "Version de l'outil",
  },
]

export function CommandsList() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" gap={1} width="100%" maxWidth={90}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.info} attributes={TextAttributes.BOLD}>
          📋 Commandes disponibles
        </text>
      </box>

      <box flexDirection="column" gap={1} paddingLeft={2}>
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Déploiements Azure
        </text>
        <box flexDirection="column" gap={0} paddingLeft={2}>
          <For each={AZURE_COMMANDS}>
            {(cmd) => (
              <box flexDirection="row" gap={1}>
                <text fg={theme.primary} attributes={TextAttributes.BOLD}>
                  {cmd.command}
                </text>
                <text fg={theme.textMuted}>- {cmd.description}</text>
              </box>
            )}
          </For>
        </box>

        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Configuration
        </text>
        <box flexDirection="column" gap={0} paddingLeft={2}>
          <For each={CONFIG_COMMANDS}>
            {(cmd) => (
              <box flexDirection="row" gap={1}>
                <text fg={theme.primary} attributes={TextAttributes.BOLD}>
                  {cmd.command}
                </text>
                <text fg={theme.textMuted}>- {cmd.description}</text>
              </box>
            )}
          </For>
        </box>

        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Aide
        </text>
        <box flexDirection="column" gap={0} paddingLeft={2}>
          <For each={HELP_COMMANDS}>
            {(cmd) => (
              <box flexDirection="row" gap={1}>
                <text fg={theme.primary} attributes={TextAttributes.BOLD}>
                  {cmd.command}
                </text>
                <text fg={theme.textMuted}>- {cmd.description}</text>
              </box>
            )}
          </For>
        </box>
      </box>
    </box>
  )
}
