/**
 * Azure Error Analyzer Tests
 */

import { describe, test, expect } from "bun:test"
import { ErrorAnalyzer, ErrorType, ErrorSeverity } from "../error-analyzer"

describe("ErrorAnalyzer", () => {
  describe("Authentication errors", () => {
    test("should detect 'not logged in' errors", () => {
      const error = new Error("User is not logged in to Azure CLI")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.AUTHENTICATION)
      expect(analysis.severity).toBe(ErrorSeverity.CRITICAL)
      expect(analysis.title).toContain("authentification")
      expect(analysis.suggestions.length).toBeGreaterThan(0)
      expect(analysis.suggestions.some((s) => s.includes("az login"))).toBe(true)
    })

    test("should detect authentication failure errors", () => {
      const error = new Error("Authentication failed for Azure subscription")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.AUTHENTICATION)
      expect(analysis.documentationLinks.length).toBeGreaterThan(0)
    })
  })

  describe("Permission errors", () => {
    test("should detect permission denied errors", () => {
      const error = new Error("Access denied: permission required")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.PERMISSIONS)
      expect(analysis.severity).toBe(ErrorSeverity.CRITICAL)
      expect(analysis.suggestions.some((s) => s.includes("Contributor"))).toBe(true)
    })

    test("should detect unauthorized errors", () => {
      const error = new Error("Unauthorized to access resource group")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.PERMISSIONS)
      expect(analysis.suggestions.some((s) => s.includes("permissions"))).toBe(true)
    })
  })

  describe("Quota errors", () => {
    test("should detect quota exceeded errors", () => {
      const error = new Error("Quota limit exceeded for subscription")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.QUOTA_EXCEEDED)
      expect(analysis.severity).toBe(ErrorSeverity.ERROR)
      expect(analysis.suggestions.some((s) => s.includes("quota"))).toBe(true)
    })

    test("should detect throttling errors", () => {
      const error = new Error("Request throttled due to too many requests")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.QUOTA_EXCEEDED)
    })
  })

  describe("Resource conflict errors", () => {
    test("should detect 'already exists' errors", () => {
      const error = new Error("Storage account name already exists")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.RESOURCE_CONFLICT)
      expect(analysis.severity).toBe(ErrorSeverity.ERROR)
      expect(analysis.suggestions.some((s) => s.includes("unique") || s.includes("nom"))).toBe(true)
    })

    test("should detect conflict errors", () => {
      const error = new Error("Resource conflict: name not available")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.RESOURCE_CONFLICT)
    })
  })

  describe("Resource not found errors", () => {
    test("should detect 'not found' errors", () => {
      const error = new Error("Resource group not found")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.RESOURCE_NOT_FOUND)
      expect(analysis.severity).toBe(ErrorSeverity.ERROR)
    })

    test("should detect 'does not exist' errors", () => {
      const error = new Error("The specified resource does not exist")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.RESOURCE_NOT_FOUND)
    })
  })

  describe("Template validation errors", () => {
    test("should detect Bicep validation errors", () => {
      const error = new Error("Bicep template validation failed: parameter missing")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.INVALID_TEMPLATE)
      expect(analysis.suggestions.some((s) => s.includes("Bicep") || s.includes("template"))).toBe(
        true,
      )
    })

    test("should detect parameter validation errors", () => {
      const error = new Error("Required parameter 'location' is missing")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.INVALID_TEMPLATE)
    })
  })

  describe("Bicep compilation errors", () => {
    test("should detect Bicep CLI not found", () => {
      const error = new Error("az bicep command not found")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.BICEP_COMPILATION)
      expect(analysis.severity).toBe(ErrorSeverity.CRITICAL)
      expect(analysis.suggestions.some((s) => s.includes("install"))).toBe(true)
    })
  })

  describe("Deployment failures", () => {
    test("should detect deployment failed errors", () => {
      const error = new Error("Deployment operation failed with error")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.DEPLOYMENT_FAILED)
      expect(analysis.suggestions.some((s) => s.includes("logs") || s.includes("status"))).toBe(
        true,
      )
    })
  })

  describe("Network errors", () => {
    test("should detect connection timeout", () => {
      const error = new Error("Connection timeout to Azure management endpoint")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.NETWORK_ERROR)
      expect(analysis.suggestions.some((s) => s.includes("réseau") || s.includes("Internet"))).toBe(
        true,
      )
    })

    test("should detect DNS resolution errors", () => {
      const error = new Error("Failed to resolve DNS for management.azure.com")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.NETWORK_ERROR)
    })
  })

  describe("Timeout errors", () => {
    test("should detect timeout errors", () => {
      const error = new Error("Operation timed out after 30 seconds")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.TIMEOUT)
      expect(analysis.severity).toBe(ErrorSeverity.WARNING)
    })
  })

  describe("Unknown errors", () => {
    test("should handle unknown errors gracefully", () => {
      const error = new Error("Some completely unexpected error message")
      const analysis = ErrorAnalyzer.analyze(error)

      expect(analysis.errorType).toBe(ErrorType.UNKNOWN)
      expect(analysis.severity).toBe(ErrorSeverity.ERROR)
      expect(analysis.suggestions.length).toBeGreaterThan(0)
      expect(analysis.documentationLinks.length).toBeGreaterThan(0)
    })
  })

  describe("formatReport", () => {
    test("should format report with emoji and sections", () => {
      const error = new Error("Authentication failed")
      const analysis = ErrorAnalyzer.analyze(error)
      const report = ErrorAnalyzer.formatReport(analysis, false)

      expect(report).toContain("🔴") // Critical severity icon
      expect(report).toContain("💡") // Suggestions icon
      expect(report).toContain("📚") // Documentation icon
      expect(report).toContain("az login")
    })

    test("should include technical details in verbose mode", () => {
      const error = new Error("Test error")
      const analysis = ErrorAnalyzer.analyze(error)
      const reportVerbose = ErrorAnalyzer.formatReport(analysis, true)
      const reportNormal = ErrorAnalyzer.formatReport(analysis, false)

      // Verbose should have more content
      expect(reportVerbose.length).toBeGreaterThanOrEqual(reportNormal.length)
    })
  })

  describe("isRecoverable", () => {
    test("should identify network errors as recoverable", () => {
      const error = new Error("Network connection timeout")
      expect(ErrorAnalyzer.isRecoverable(error)).toBe(true)
    })

    test("should identify timeout errors as recoverable", () => {
      const error = new Error("Operation timed out")
      expect(ErrorAnalyzer.isRecoverable(error)).toBe(true)
    })

    test("should identify quota errors as recoverable", () => {
      const error = new Error("Quota limit exceeded")
      expect(ErrorAnalyzer.isRecoverable(error)).toBe(true)
    })

    test("should identify authentication errors as not recoverable", () => {
      const error = new Error("Not logged in to Azure")
      expect(ErrorAnalyzer.isRecoverable(error)).toBe(false)
    })

    test("should identify permission errors as not recoverable", () => {
      const error = new Error("Permission denied")
      expect(ErrorAnalyzer.isRecoverable(error)).toBe(false)
    })
  })

  describe("getRetryDelay", () => {
    test("should return 5s for timeout errors", () => {
      const error = new Error("Operation timed out")
      expect(ErrorAnalyzer.getRetryDelay(error)).toBe(5000)
    })

    test("should return 3s for network errors", () => {
      const error = new Error("Network unreachable")
      expect(ErrorAnalyzer.getRetryDelay(error)).toBe(3000)
    })

    test("should return 60s for quota errors", () => {
      const error = new Error("Quota exceeded")
      expect(ErrorAnalyzer.getRetryDelay(error)).toBe(60000)
    })

    test("should return 0 for non-recoverable errors", () => {
      const error = new Error("Authentication failed")
      expect(ErrorAnalyzer.getRetryDelay(error)).toBe(0)
    })
  })

  describe("analyzeMultiple", () => {
    test("should analyze multiple errors and sort by severity", () => {
      const errors = [
        new Error("Operation timed out"), // WARNING
        new Error("Authentication failed"), // CRITICAL
        new Error("Resource not found"), // ERROR
      ]

      const analyses = ErrorAnalyzer.analyzeMultiple(errors)

      expect(analyses.length).toBe(3)
      // Should be sorted: CRITICAL, ERROR, WARNING
      expect(analyses[0].severity).toBe(ErrorSeverity.CRITICAL)
      expect(analyses[1].severity).toBe(ErrorSeverity.ERROR)
      expect(analyses[2].severity).toBe(ErrorSeverity.WARNING)
    })
  })

  describe("extractTechnicalDetails", () => {
    test("should extract error code if available", () => {
      const error: any = new Error("Test error")
      error.code = "ERR_AZURE_001"

      const analysis = ErrorAnalyzer.analyze(error)
      expect(analysis.technicalDetails).toContain("ERR_AZURE_001")
    })

    test("should extract HTTP status code if available", () => {
      const error: any = new Error("HTTP error")
      error.statusCode = 403

      const analysis = ErrorAnalyzer.analyze(error)
      expect(analysis.technicalDetails).toContain("403")
    })
  })
})
