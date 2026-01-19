/**
 * Azure Authentication Service
 * Handles Azure CLI authentication and credential management
 */

import { AzureCliCredential } from "@azure/identity"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export interface AzureAccount {
  id: string
  name: string
  tenantId: string
  state: string
  isDefault: boolean
}

export interface AzureAuthError extends Error {
  code: string
  suggestion?: string
}

export class AzureAuth {
  private static credential: AzureCliCredential | null = null

  /**
   * Check if Azure CLI is installed
   */
  static async isAzureCliInstalled(): Promise<boolean> {
    try {
      await execAsync("az --version")
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if user is logged in to Azure CLI
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("az account show")
      return stdout.trim().length > 0
    } catch {
      return false
    }
  }

  /**
   * Get current Azure account
   */
  static async getCurrentAccount(): Promise<AzureAccount | null> {
    try {
      const { stdout } = await execAsync("az account show --output json")
      const account = JSON.parse(stdout)
      return {
        id: account.id,
        name: account.name,
        tenantId: account.tenantId,
        state: account.state,
        isDefault: account.isDefault || true,
      }
    } catch {
      return null
    }
  }

  /**
   * Get all Azure accounts
   */
  static async listAccounts(): Promise<AzureAccount[]> {
    try {
      const { stdout } = await execAsync("az account list --output json")
      const accounts = JSON.parse(stdout)
      return accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        tenantId: account.tenantId,
        state: account.state,
        isDefault: account.isDefault || false,
      }))
    } catch {
      return []
    }
  }

  /**
   * Set active Azure subscription
   */
  static async setSubscription(subscriptionId: string): Promise<void> {
    try {
      await execAsync(`az account set --subscription "${subscriptionId}"`)
    } catch (error: any) {
      const authError: AzureAuthError = new Error(
        `Failed to set subscription: ${error.message}`,
      ) as AzureAuthError
      authError.code = "SUBSCRIPTION_ERROR"
      authError.suggestion = "Verify the subscription ID is correct and you have access to it"
      throw authError
    }
  }

  /**
   * Get Azure CLI credential for SDK authentication
   */
  static getCredential(): AzureCliCredential {
    if (!this.credential) {
      this.credential = new AzureCliCredential()
    }
    return this.credential
  }

  /**
   * Validate Azure authentication and throw descriptive errors
   */
  static async validate(): Promise<void> {
    // Check if Azure CLI is installed
    if (!(await this.isAzureCliInstalled())) {
      const error: AzureAuthError = new Error(
        "Azure CLI n'est pas installé",
      ) as AzureAuthError
      error.code = "AZURE_CLI_NOT_INSTALLED"
      error.suggestion = 
        "Installez Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli"
      throw error
    }

    // Check if logged in
    if (!(await this.isLoggedIn())) {
      const error: AzureAuthError = new Error(
        "Vous n'êtes pas connecté à Azure",
      ) as AzureAuthError
      error.code = "NOT_LOGGED_IN"
      error.suggestion = "Exécutez 'az login' pour vous connecter à Azure"
      throw error
    }

    // Get current account to verify access
    const account = await this.getCurrentAccount()
    if (!account) {
      const error: AzureAuthError = new Error(
        "Impossible de récupérer les informations du compte Azure",
      ) as AzureAuthError
      error.code = "ACCOUNT_ERROR"
      error.suggestion = "Exécutez 'az account show' pour vérifier votre configuration"
      throw error
    }

    // Verify account is active
    if (account.state !== "Enabled") {
      const error: AzureAuthError = new Error(
        `L'abonnement Azure est dans l'état: ${account.state}`,
      ) as AzureAuthError
      error.code = "SUBSCRIPTION_DISABLED"
      error.suggestion = "Contactez votre administrateur Azure pour activer l'abonnement"
      throw error
    }
  }

  /**
   * Get access token for Azure Resource Manager
   */
  static async getAccessToken(): Promise<string> {
    try {
      const { stdout } = await execAsync(
        'az account get-access-token --resource https://management.azure.com/ --query accessToken -o tsv'
      )
      return stdout.trim()
    } catch (error: any) {
      const authError: AzureAuthError = new Error(
        `Failed to get access token: ${error.message}`,
      ) as AzureAuthError
      authError.code = "TOKEN_ERROR"
      authError.suggestion = "Try running 'az login' again"
      throw authError
    }
  }
}
