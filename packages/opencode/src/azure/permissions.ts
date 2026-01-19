/**
 * Azure Permissions Validation Service
 * Validates user permissions before deployment operations
 */

import { AuthorizationManagementClient } from "@azure/arm-authorization"
import { AzureAuth } from "./auth"

export interface PermissionCheck {
  role: string
  scope: string
  allowed: boolean
  reason?: string
}

export interface PermissionValidationResult {
  hasPermissions: boolean
  checks: PermissionCheck[]
  missingPermissions: string[]
  suggestions: string[]
}

export class AzurePermissions {
  /**
   * Required roles for deploying Azure Functions infrastructure
   */
  private static readonly REQUIRED_ROLES = ["Contributor", "Owner"]

  /**
   * Validate user has required permissions for resource group
   * Uses a simplified role-based approach
   */
  static async validateResourceGroupPermissions(
    subscriptionId: string,
    resourceGroupName: string,
  ): Promise<PermissionValidationResult> {
    try {
      const credential = AzureAuth.getCredential()
      const authClient = new AuthorizationManagementClient(credential, subscriptionId)

      const scope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`
      const checks: PermissionCheck[] = []

      // Get role assignments for the resource group
      const roleAssignments = await authClient.roleAssignments.listForScope(scope)
      const roleDefinitionIds: string[] = []

      for await (const assignment of roleAssignments) {
        if (assignment.roleDefinitionId) {
          roleDefinitionIds.push(assignment.roleDefinitionId)
        }
      }

      // Check if user has any of the required roles
      let hasRequiredRole = false
      for (const roleDefId of roleDefinitionIds) {
        try {
          const roleDefinition = await authClient.roleDefinitions.getById(roleDefId)
          const roleName = roleDefinition.roleName || ""

          const isRequired = this.REQUIRED_ROLES.includes(roleName)
          if (isRequired) {
            hasRequiredRole = true
            checks.push({
              role: roleName,
              scope,
              allowed: true,
            })
          }
        } catch (error) {
          // Ignore errors for individual role lookups
        }
      }

      const missingPermissions: string[] = []
      const suggestions: string[] = []

      if (!hasRequiredRole) {
        missingPermissions.push("Contributor or Owner role")
        suggestions.push("Vous devez avoir au minimum le rôle 'Contributor' sur le resource group")
        suggestions.push(
          `Contactez votre administrateur Azure pour obtenir les permissions nécessaires sur: ${resourceGroupName}`,
        )
        suggestions.push(
          "Vous pouvez vérifier vos permissions avec: az role assignment list --resource-group " +
            resourceGroupName,
        )
      }

      return {
        hasPermissions: hasRequiredRole,
        checks,
        missingPermissions,
        suggestions,
      }
    } catch (error) {
      // If we can't check permissions, assume we have them
      // (better to try and fail than block unnecessarily)
      return {
        hasPermissions: true,
        checks: [],
        missingPermissions: [],
        suggestions: ["Impossible de vérifier les permissions, poursuite du déploiement"],
      }
    }
  }

  /**
   * Get recommended role for deployment
   */
  static getRecommendedRole(): string {
    return "Contributor"
  }

  /**
   * Get minimum required role for deployment
   */
  static getMinimumRole(): string {
    return "Contributor"
  }
}
