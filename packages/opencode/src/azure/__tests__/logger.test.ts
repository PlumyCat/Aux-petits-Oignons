/**
 * Azure Logger Tests
 */

import { describe, test, expect, beforeEach } from "bun:test"
import { AzureLogger, LogLevel } from "../logger"

describe("AzureLogger", () => {
  beforeEach(() => {
    // Clear logs before each test
    AzureLogger.clear()
    AzureLogger.setVerbose(false)
  })

  describe("Logging", () => {
    test("should log info messages", () => {
      AzureLogger.info("Test info message")
      const logs = AzureLogger.getLogs()

      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe(LogLevel.INFO)
      expect(logs[0].message).toBe("Test info message")
    })

    test("should log error messages", () => {
      AzureLogger.error("Test error message")
      const logs = AzureLogger.getLogs()

      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe(LogLevel.ERROR)
      expect(logs[0].message).toBe("Test error message")
    })

    test("should log warning messages", () => {
      AzureLogger.warn("Test warning message")
      const logs = AzureLogger.getLogs()

      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe(LogLevel.WARN)
      expect(logs[0].message).toBe("Test warning message")
    })

    test("should only log debug messages in verbose mode", () => {
      AzureLogger.debug("Test debug message")
      expect(AzureLogger.getLogs().length).toBe(0)

      AzureLogger.setVerbose(true)
      AzureLogger.debug("Test debug message")
      expect(AzureLogger.getLogs().length).toBe(1)
    })

    test("should include metadata in log entries", () => {
      const metadata = { key: "value", number: 42 }
      AzureLogger.info("Message with metadata", metadata)

      const logs = AzureLogger.getLogs()
      expect(logs[0].metadata).toEqual(metadata)
    })
  })

  describe("Operation tracking", () => {
    test("should track operation context", () => {
      AzureLogger.setOperation("deployment")
      AzureLogger.info("Deploying resources")

      const logs = AzureLogger.getLogs()
      expect(logs[0].operation).toBe("deployment")
    })

    test("should log operation start", () => {
      AzureLogger.startOperation("test-operation", "Testing operation")

      const logs = AzureLogger.getLogs()
      expect(logs.some((log) => log.message.includes("Testing operation"))).toBe(true)
    })

    test("should log operation completion", () => {
      AzureLogger.completeOperation("test-operation", 1500)

      const logs = AzureLogger.getLogs()
      expect(logs.some((log) => log.message.includes("test-operation"))).toBe(true)
      expect(logs.some((log) => log.message.includes("1500ms"))).toBe(true)
    })
  })

  describe("Log filtering", () => {
    test("should filter logs by level", () => {
      AzureLogger.debug("Debug message")
      AzureLogger.info("Info message")
      AzureLogger.warn("Warning message")
      AzureLogger.error("Error message")

      const errorLogs = AzureLogger.getLogs(LogLevel.ERROR)
      expect(errorLogs.length).toBe(1)
      expect(errorLogs[0].level).toBe(LogLevel.ERROR)

      const warnLogs = AzureLogger.getLogs(LogLevel.WARN)
      expect(warnLogs.length).toBe(2) // WARN + ERROR
    })
  })

  describe("Log management", () => {
    test("should clear all logs", () => {
      AzureLogger.info("Message 1")
      AzureLogger.info("Message 2")
      expect(AzureLogger.getLogs().length).toBe(2)

      AzureLogger.clear()
      expect(AzureLogger.getLogs().length).toBe(0)
    })

    test("should export logs as JSON", () => {
      AzureLogger.info("Test message")
      const exported = AzureLogger.export()

      expect(typeof exported).toBe("string")
      const parsed = JSON.parse(exported)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBe(1)
      expect(parsed[0].message).toBe("Test message")
    })
  })
})
