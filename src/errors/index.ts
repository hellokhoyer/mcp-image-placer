/**
 * Custom error classes for MCP Image Placeholder server
 */

export class ImagePlaceholderError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ImagePlaceholderError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ImagePlaceholderError);
    }
  }
}

export class ValidationError extends ImagePlaceholderError {
  constructor(field: string, value: unknown, constraints?: string) {
    const message = constraints
      ? `Invalid ${field}: ${value}. ${constraints}`
      : `Invalid ${field}: ${value}`;

    super(message, 'VALIDATION_ERROR', { field, value, constraints });
    this.name = 'ValidationError';
  }
}

export class ProviderError extends ImagePlaceholderError {
  constructor(provider: string, message: string, context?: Record<string, unknown>) {
    super(`Provider "${provider}" error: ${message}`, 'PROVIDER_ERROR', {
      provider,
      ...context,
    });
    this.name = 'ProviderError';
  }
}

export class ConfigurationError extends ImagePlaceholderError {
  constructor(setting: string, value: unknown, expectedFormat?: string) {
    const message = expectedFormat
      ? `Configuration error for "${setting}": ${value}. Expected: ${expectedFormat}`
      : `Configuration error for "${setting}": ${value}`;

    super(message, 'CONFIGURATION_ERROR', { setting, value, expectedFormat });
    this.name = 'ConfigurationError';
  }
}

export class ServerError extends ImagePlaceholderError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SERVER_ERROR', context);
    this.name = 'ServerError';
  }
}
