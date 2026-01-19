/**
 * Azure Operations Logger
 * Provides detailed logging for Azure deployment operations
 */

import { UI } from "../cli/ui"

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  operation: string
  message: string
  metadata?: Record<string, any>
}

export class AzureLogger {
  private static logs: LogEntry[] = []
  private static verbose: boolean = false
  private static currentOperation: string = "default"

  /**
   * Enable verbose logging
   */
  static setVerbose(verbose: boolean): void {
    this.verbose = verbose
  }

  /**
   * Set current operation context
   */
  static setOperation(operation: string): void {
    this.currentOperation = operation
  }

  /**
   * Log debug message (only in verbose mode)
   */
  static debug(message: string, metadata?: Record<string, any>): void {
    if (this.verbose) {
      this.log(LogLevel.DEBUG, message, metadata)
      UI.println(UI.Style.TEXT_DIM + `[DEBUG] ${message}` + UI.Style.TEXT_NORMAL)
    }
  }

  /**
   * Log info message
   */
  static info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
    UI.println(UI.Style.TEXT_INFO + `ℹ ${message}` + UI.Style.TEXT_NORMAL)
  }

  /**
   * Log warning message
   */
  static warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata)
    UI.println(UI.Style.TEXT_WARNING + `⚠ ${message}` + UI.Style.TEXT_NORMAL)
  }

  /**
   * Log error message
   */
  static error(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata)
    UI.println(UI.Style.TEXT_DANGER + `✗ ${message}` + UI.Style.TEXT_NORMAL)
  }

  /**
   * Log success message
   */
  static success(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
    UI.println(UI.Style.TEXT_SUCCESS + `✓ ${message}` + UI.Style.TEXT_NORMAL)
  }

  /**
   * Log operation start
   */
  static startOperation(operation: string, description?: string): void {
    this.setOperation(operation)
    const message = description || operation
    this.info(`Démarrage: ${message}`)
    this.debug(`Operation: ${operation}`)
  }

  /**
   * Log operation completion
   */
  static completeOperation(operation: string, duration?: number): void {
    const durationStr = duration ? ` (${duration}ms)` : ""
    this.success(`Terminé: ${operation}${durationStr}`)
  }

  /**
   * Log operation failure
   */
  static failOperation(operation: string, error: Error): void {
    this.error(`Échec: ${operation}`)
    this.error(`Erreur: ${error.message}`)
    if (this.verbose && error.stack) {
      this.debug(`Stack trace: ${error.stack}`)
    }
  }

  /**
   * Internal logging
   */
  private static log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      operation: this.currentOperation,
      message,
      metadata,
    }
    this.logs.push(entry)
  }

  /**
   * Get all log entries
   */
  static getLogs(minLevel: LogLevel = LogLevel.DEBUG): LogEntry[] {
    return this.logs.filter((log) => log.level >= minLevel)
  }

  /**
   * Clear all logs
   */
  static clear(): void {
    this.logs = []
  }

  /**
   * Export logs as JSON
   */
  static export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Print deployment summary
   */
  static printDeploymentSummary(
    resourceGroupName: string,
    deploymentName: string,
    resources: string[],
    duration: number,
  ): void {
    UI.println("")
    UI.println(UI.Style.TEXT_SUCCESS_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_SUCCESS_BOLD + "  Déploiement Azure Réussi" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_SUCCESS_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println("")
    UI.println(UI.Style.TEXT_INFO + `Resource Group:  ${resourceGroupName}` + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_INFO + `Deployment Name: ${deploymentName}` + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_INFO + `Duration:        ${Math.round(duration / 1000)}s` + UI.Style.TEXT_NORMAL)
    UI.println("")
    UI.println(UI.Style.TEXT_SUCCESS + "Ressources déployées:" + UI.Style.TEXT_NORMAL)
    resources.forEach((resource) => {
      UI.println(UI.Style.TEXT_SUCCESS + `  ✓ ${resource}` + UI.Style.TEXT_NORMAL)
    })
    UI.println("")
  }

  /**
   * Print error summary with suggestions
   */
  static printErrorSummary(error: Error, suggestions?: string[]): void {
    UI.println("")
    UI.println(UI.Style.TEXT_DANGER_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_DANGER_BOLD + "  Erreur de Déploiement" + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_DANGER_BOLD + "═══════════════════════════════════════" + UI.Style.TEXT_NORMAL)
    UI.println("")
    UI.println(UI.Style.TEXT_DANGER + `Erreur: ${error.message}` + UI.Style.TEXT_NORMAL)

    if (suggestions && suggestions.length > 0) {
      UI.println("")
      UI.println(UI.Style.TEXT_WARNING + "Suggestions:" + UI.Style.TEXT_NORMAL)
      suggestions.forEach((suggestion) => {
        UI.println(UI.Style.TEXT_WARNING + `  • ${suggestion}` + UI.Style.TEXT_NORMAL)
      })
    }

    if (this.verbose && error.stack) {
      UI.println("")
      UI.println(UI.Style.TEXT_DIM + "Stack trace:" + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_DIM + error.stack + UI.Style.TEXT_NORMAL)
    }
    UI.println("")
  }
}
