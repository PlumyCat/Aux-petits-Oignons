import { useTheme } from "@tui/context/theme"

export function WelcomeMessage() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" gap={0} width="100%" maxWidth={90} alignItems="center">
      <text fg={theme.textMuted}>
        Votre assistant IA pour deployer vos Azure Functions
      </text>
    </box>
  )
}
