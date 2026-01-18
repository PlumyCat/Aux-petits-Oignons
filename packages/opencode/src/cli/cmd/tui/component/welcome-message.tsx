import { useTheme } from "@tui/context/theme"
import { TextAttributes } from "@opentui/core"

export function WelcomeMessage() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" gap={1} width="100%" maxWidth={90} alignItems="center">
      <box flexDirection="row" gap={1}>
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Bienvenue dans "Aux petits Oignons"
        </text>
      </box>
      <box flexDirection="column" gap={0} alignItems="center">
        <text fg={theme.textMuted}>
          Votre assistant Azure AI pour déployer vos bots Copilot Studio
        </text>
        <text fg={theme.textMuted}>
          Déployez vos Azure Functions en moins de 20 minutes, sans expertise Azure requise
        </text>
      </box>
    </box>
  )
}
