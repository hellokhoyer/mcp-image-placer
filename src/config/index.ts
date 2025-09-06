/**
 * Configuration management with environment variable support
 */

import { ServerConfig, ValidationConstraints, ProviderConfig } from '../types/index.js';
import { ConfigurationError } from '../errors/index.js';

const DEFAULT_CONFIG: ServerConfig = {
  name: 'image-placeholder',
  version: '1.1.0',
  logLevel: 'info',
  environment: 'development',
};

const DEFAULT_CONSTRAINTS: ValidationConstraints = {
  minWidth: 1,
  maxWidth: 10000,
  minHeight: 1,
  maxHeight: 10000,
  supportedProviders: ['placehold', 'lorem-picsum'],
};

const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  placehold: {
    baseUrl: 'https://placehold.co',
    urlTemplate: '{baseUrl}/{width}x{height}',
  },
  'lorem-picsum': {
    baseUrl: 'https://picsum.photos',
    urlTemplate: '{baseUrl}/{width}/{height}',
  },
};

function getEnvironmentConfig(): Partial<ServerConfig> {
  const config: Partial<ServerConfig> = {};

  if (process.env.MCP_LOG_LEVEL) {
    const logLevel = process.env.MCP_LOG_LEVEL.toLowerCase();
    if (['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      config.logLevel = logLevel as ServerConfig['logLevel'];
    } else {
      throw new ConfigurationError(
        'MCP_LOG_LEVEL',
        process.env.MCP_LOG_LEVEL,
        'One of: debug, info, warn, error'
      );
    }
  }

  if (process.env.NODE_ENV) {
    const environment = process.env.NODE_ENV.toLowerCase();
    if (['development', 'production', 'test'].includes(environment)) {
      config.environment = environment as ServerConfig['environment'];
    } else {
      throw new ConfigurationError(
        'NODE_ENV',
        process.env.NODE_ENV,
        'One of: development, production, test'
      );
    }
  }

  return config;
}

function getEnvironmentConstraints(): Partial<ValidationConstraints> {
  const constraints: Partial<ValidationConstraints> = {};

  if (process.env.MCP_MIN_WIDTH) {
    const minWidth = parseInt(process.env.MCP_MIN_WIDTH, 10);
    if (isNaN(minWidth) || minWidth < 1) {
      throw new ConfigurationError(
        'MCP_MIN_WIDTH',
        process.env.MCP_MIN_WIDTH,
        'Positive integer >= 1'
      );
    }
    constraints.minWidth = minWidth;
  }

  if (process.env.MCP_MAX_WIDTH) {
    const maxWidth = parseInt(process.env.MCP_MAX_WIDTH, 10);
    if (isNaN(maxWidth) || maxWidth < 1) {
      throw new ConfigurationError(
        'MCP_MAX_WIDTH',
        process.env.MCP_MAX_WIDTH,
        'Positive integer >= 1'
      );
    }
    constraints.maxWidth = maxWidth;
  }

  if (process.env.MCP_MIN_HEIGHT) {
    const minHeight = parseInt(process.env.MCP_MIN_HEIGHT, 10);
    if (isNaN(minHeight) || minHeight < 1) {
      throw new ConfigurationError(
        'MCP_MIN_HEIGHT',
        process.env.MCP_MIN_HEIGHT,
        'Positive integer >= 1'
      );
    }
    constraints.minHeight = minHeight;
  }

  if (process.env.MCP_MAX_HEIGHT) {
    const maxHeight = parseInt(process.env.MCP_MAX_HEIGHT, 10);
    if (isNaN(maxHeight) || maxHeight < 1) {
      throw new ConfigurationError(
        'MCP_MAX_HEIGHT',
        process.env.MCP_MAX_HEIGHT,
        'Positive integer >= 1'
      );
    }
    constraints.maxHeight = maxHeight;
  }

  return constraints;
}

export function createConfig(): ServerConfig {
  const envConfig = getEnvironmentConfig();
  return { ...DEFAULT_CONFIG, ...envConfig };
}

export function createValidationConstraints(): ValidationConstraints {
  const envConstraints = getEnvironmentConstraints();
  const constraints = { ...DEFAULT_CONSTRAINTS, ...envConstraints };

  // Validate constraint relationships
  if (constraints.minWidth > constraints.maxWidth) {
    throw new ConfigurationError(
      'width constraints',
      `min: ${constraints.minWidth}, max: ${constraints.maxWidth}`,
      'minWidth must be <= maxWidth'
    );
  }

  if (constraints.minHeight > constraints.maxHeight) {
    throw new ConfigurationError(
      'height constraints',
      `min: ${constraints.minHeight}, max: ${constraints.maxHeight}`,
      'minHeight must be <= maxHeight'
    );
  }

  return constraints;
}

export function createProviderConfig(): ProviderConfig {
  // Future enhancement: allow provider config via environment variables
  return DEFAULT_PROVIDER_CONFIG;
}

// Export default configurations for testing
export { DEFAULT_CONFIG, DEFAULT_CONSTRAINTS, DEFAULT_PROVIDER_CONFIG };
