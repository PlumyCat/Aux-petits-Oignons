import { useTheme } from "@tui/context/theme"
import { TextAttributes } from "@opentui/core"
import { createSignal, For, Show } from "solid-js"
import { loadEnterpriseConfig } from "@/enterprise/config/loader"

export function ModelSelector() {
  const { theme } = useTheme()
  const config = loadEnterpriseConfig()
  const [selectedModel, setSelectedModel] = createSignal(
    config?.aiModels.find((m) => m.default)?.id || "claude-sonnet",
  )

  const models = config?.aiModels || []

  return (
    <box flexDirection="column" gap={1} width="100%" maxWidth={90}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.primary} attributes={TextAttributes.BOLD}>
          Modeles IA disponibles
        </text>
      </box>

      <box flexDirection="column" gap={0} paddingLeft={2}>
        <text fg={theme.textMuted}>
          Selectionnez le modele IA qui vous assistera pour vos deploiements Azure
        </text>
      </box>

      <box flexDirection="column" gap={0} paddingLeft={2}>
        <For each={models}>
          {(model) => {
            const isSelected = () => selectedModel() === model.id
            const isDefault = model.default === true

            return (
              <box flexDirection="row" gap={1}>
                <text fg={isSelected() ? theme.success : theme.textMuted}>{isSelected() ? "*" : " "}</text>
                <text fg={isSelected() ? theme.text : theme.textMuted} attributes={isSelected() ? TextAttributes.BOLD : undefined}>
                  {model.name}
                </text>
                <Show when={isDefault}>
                  <text fg={theme.warning}>(defaut)</text>
                </Show>
                <Show when={model.provider === "azure"}>
                  <text fg={theme.info}>via Azure AI Foundry</text>
                </Show>
                <Show when={model.provider === "anthropic"}>
                  <text fg={theme.info}>via Azure AI Foundry</text>
                </Show>
              </box>
            )
          }}
        </For>
      </box>

      <box flexDirection="row" gap={1} paddingLeft={2}>
        <text fg={theme.textMuted}>
          Utilisez <span style={{ fg: theme.primary }}>/models</span> pour changer de modele
        </text>
      </box>
    </box>
  )
}
