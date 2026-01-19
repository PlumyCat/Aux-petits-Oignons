import { useTheme } from "@tui/context/theme"
import { TextAttributes } from "@opentui/core"
import { For } from "solid-js"

const QUICK_START_STEPS = [
  {
    number: "1",
    title: "Verifiez votre authentification Azure",
    command: "az login --tenant <TENANT_ID>",
    description: "Validation des credentials et permissions",
  },
  {
    number: "2",
    title: "Selectionnez un modele IA",
    command: "/models",
    description: "Choisissez parmi Claude, GPT-4o, GPT-4.5 Preview",
  },
  {
    number: "3",
    title: "Demarrez un deploiement",
    command: "aux deploy",
    description: "L'IA vous guidera pas a pas",
  },
  {
    number: "4",
    title: "Suivez le statut",
    command: "aux status",
    description: "Visualisez la progression en temps reel",
  },
]

export function QuickStartGuide() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" gap={1} width="100%" maxWidth={90}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.warning} attributes={TextAttributes.BOLD}>
          Guide de demarrage rapide
        </text>
      </box>
      <box flexDirection="column" gap={1} paddingLeft={2}>
        <For each={QUICK_START_STEPS}>
          {(step) => (
            <box flexDirection="column" gap={0}>
              <box flexDirection="row" gap={1}>
                <text fg={theme.success} attributes={TextAttributes.BOLD}>
                  {step.number}.
                </text>
                <text fg={theme.text}>{step.title}</text>
              </box>
              <box flexDirection="row" gap={1} paddingLeft={3}>
                <text fg={theme.textMuted}>→</text>
                <text fg={theme.primary} attributes={TextAttributes.BOLD}>
                  {step.command}
                </text>
                <text fg={theme.textMuted}>- {step.description}</text>
              </box>
            </box>
          )}
        </For>
      </box>
    </box>
  )
}
