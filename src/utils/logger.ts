/**
 * Logger utility with structured logging
 */

import { Logger } from '../types/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class ConsoleLogger implements Logger {
  private logLevel: LogLevel;
  private environment: string;

  constructor(logLevel: LogLevel = 'info', environment: string = 'development') {
    this.logLevel = logLevel;
    this.environment = environment;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    meta?: Record<string, unknown>
  ): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    if (this.environment === 'production') {
      return JSON.stringify(entry);
    }

    // Pretty format for development
    let output = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;

    if (meta && Object.keys(meta).length > 0) {
      output += `\n  Meta: ${JSON.stringify(meta, null, 2)}`;
    }

    if (error) {
      output += `\n  Error: ${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`;
      }
    }

    return output;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLogEntry('debug', message, undefined, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(this.formatLogEntry('info', message, undefined, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLogEntry('warn', message, undefined, meta));
    }
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatLogEntry('error', message, error, meta));
    }
  }
}

// Factory function to create logger instance
export function createLogger(logLevel?: LogLevel, environment?: string): Logger {
  return new ConsoleLogger(logLevel, environment);
}

// Default logger instance
export const logger = createLogger();
