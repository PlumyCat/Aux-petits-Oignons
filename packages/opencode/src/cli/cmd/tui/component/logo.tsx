import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"

export function Logo() {
  const { theme } = useTheme()

  return (
    <box flexDirection="column" alignItems="center" gap={0}>
      <text fg={theme.primary} attributes={TextAttributes.BOLD}>
        Aux petits Oignons
      </text>
    </box>
  )
}
