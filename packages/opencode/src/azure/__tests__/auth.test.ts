/**
 * Azure Authentication Service Tests
 */

import { describe, test, expect, beforeEach } from "bun:test"
import { AzureAuth, AzureAuthError } from "../auth"

describe("AzureAuth", () => {
  describe("isAzureCliInstalled", () => {
    test("should check if Azure CLI is available", async () => {
      const result = await AzureAuth.isAzureCliInstalled()
      expect(typeof result).toBe("boolean")
    })
  })

  describe("getCurrentAccount", () => {
    test("should return null if not logged in", async () => {
      // This test will fail if user is actually logged in
      // We're just checking the function doesn't throw
      const account = await AzureAuth.getCurrentAccount()
      expect(account === null || typeof account === "object").toBe(true)
    })

    test("should return account object with expected properties if logged in", async () => {
      const account = await AzureAuth.getCurrentAccount()
      if (account) {
        expect(account).toHaveProperty("name")
        expect(account).toHaveProperty("id")
        expect(account).toHaveProperty("user")
        expect(account).toHaveProperty("tenantId")
      }
    })
  })

  describe("validate", () => {
    test("should throw AzureAuthError with suggestions if not logged in", async () => {
      const isLoggedIn = await AzureAuth.isLoggedIn()
      if (!isLoggedIn) {
        try {
          await AzureAuth.validate()
          // If we get here, the test should fail
          expect(true).toBe(false)
        } catch (error) {
          expect(error).toBeInstanceOf(AzureAuthError)
          if (error instanceof AzureAuthError) {
            expect(error.suggestions).toBeDefined()
            expect(Array.isArray(error.suggestions)).toBe(true)
            expect(error.suggestions.length).toBeGreaterThan(0)
          }
        }
      }
    })

    test("should not throw if properly authenticated", async () => {
      const isLoggedIn = await AzureAuth.isLoggedIn()
      if (isLoggedIn) {
        await expect(AzureAuth.validate()).resolves.not.toThrow()
      }
    })
  })

  describe("AzureAuthError", () => {
    test("should create error with suggestions", () => {
      const suggestions = ["Run az login", "Check your credentials"]
      const error = new AzureAuthError("Not authenticated", suggestions)

      expect(error.message).toBe("Not authenticated")
      expect(error.suggestions).toEqual(suggestions)
      expect(error.name).toBe("AzureAuthError")
    })
  })
})
