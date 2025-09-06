/**
 * Tests for configuration module
 */

import {
  createConfig,
  createValidationConstraints,
  createProviderConfig,
  DEFAULT_CONFIG,
  DEFAULT_CONSTRAINTS,
  DEFAULT_PROVIDER_CONFIG,
} from '../../src/config/index.js';
import { ConfigurationError } from '../../src/errors/index.js';

describe('Configuration Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.MCP_LOG_LEVEL;
    delete process.env.NODE_ENV;
    delete process.env.MCP_MIN_WIDTH;
    delete process.env.MCP_MAX_WIDTH;
    delete process.env.MCP_MIN_HEIGHT;
    delete process.env.MCP_MAX_HEIGHT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createConfig', () => {
    it('should return default configuration when no environment variables are set', () => {
      const config = createConfig();

      expect(config).toEqual(DEFAULT_CONFIG);
      expect(config.name).toBe('image-placeholder');
      expect(config.version).toBe('1.1.0');
      expect(config.logLevel).toBe('info');
      expect(config.environment).toBe('development');
    });

    it('should override log level from MCP_LOG_LEVEL environment variable', () => {
      process.env.MCP_LOG_LEVEL = 'debug';

      const config = createConfig();

      expect(config.logLevel).toBe('debug');
      expect(config.name).toBe('image-placeholder');
      expect(config.version).toBe('1.1.0');
      expect(config.environment).toBe('development');
    });

    it('should override environment from NODE_ENV environment variable', () => {
      process.env.NODE_ENV = 'production';

      const config = createConfig();

      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('info');
    });

    it('should handle multiple environment overrides', () => {
      process.env.MCP_LOG_LEVEL = 'error';
      process.env.NODE_ENV = 'test';

      const config = createConfig();

      expect(config.logLevel).toBe('error');
      expect(config.environment).toBe('test');
    });

    it('should throw ConfigurationError for invalid log level', () => {
      process.env.MCP_LOG_LEVEL = 'invalid';

      expect(() => createConfig()).toThrow(ConfigurationError);
      expect(() => createConfig()).toThrow('Configuration error for "MCP_LOG_LEVEL": invalid');
    });

    it('should throw ConfigurationError for invalid environment', () => {
      process.env.NODE_ENV = 'invalid';

      expect(() => createConfig()).toThrow(ConfigurationError);
      expect(() => createConfig()).toThrow('Configuration error for "NODE_ENV": invalid');
    });

    it('should handle case insensitive log levels', () => {
      process.env.MCP_LOG_LEVEL = 'DEBUG';

      const config = createConfig();

      expect(config.logLevel).toBe('debug');
    });

    it('should handle case insensitive environments', () => {
      process.env.NODE_ENV = 'PRODUCTION';

      const config = createConfig();

      expect(config.environment).toBe('production');
    });
  });

  describe('createValidationConstraints', () => {
    it('should return default constraints when no environment variables are set', () => {
      const constraints = createValidationConstraints();

      expect(constraints).toEqual(DEFAULT_CONSTRAINTS);
      expect(constraints.minWidth).toBe(1);
      expect(constraints.maxWidth).toBe(10000);
      expect(constraints.minHeight).toBe(1);
      expect(constraints.maxHeight).toBe(10000);
      expect(constraints.supportedProviders).toEqual(['placehold', 'lorem-picsum']);
    });

    it('should override minWidth from environment variable', () => {
      process.env.MCP_MIN_WIDTH = '10';

      const constraints = createValidationConstraints();

      expect(constraints.minWidth).toBe(10);
      expect(constraints.maxWidth).toBe(10000);
    });

    it('should override maxWidth from environment variable', () => {
      process.env.MCP_MAX_WIDTH = '5000';

      const constraints = createValidationConstraints();

      expect(constraints.maxWidth).toBe(5000);
      expect(constraints.minWidth).toBe(1);
    });

    it('should override minHeight from environment variable', () => {
      process.env.MCP_MIN_HEIGHT = '5';

      const constraints = createValidationConstraints();

      expect(constraints.minHeight).toBe(5);
      expect(constraints.maxHeight).toBe(10000);
    });

    it('should override maxHeight from environment variable', () => {
      process.env.MCP_MAX_HEIGHT = '8000';

      const constraints = createValidationConstraints();

      expect(constraints.maxHeight).toBe(8000);
      expect(constraints.minHeight).toBe(1);
    });

    it('should handle multiple constraint overrides', () => {
      process.env.MCP_MIN_WIDTH = '50';
      process.env.MCP_MAX_WIDTH = '2000';
      process.env.MCP_MIN_HEIGHT = '30';
      process.env.MCP_MAX_HEIGHT = '1500';

      const constraints = createValidationConstraints();

      expect(constraints.minWidth).toBe(50);
      expect(constraints.maxWidth).toBe(2000);
      expect(constraints.minHeight).toBe(30);
      expect(constraints.maxHeight).toBe(1500);
    });

    it('should throw ConfigurationError for invalid minWidth', () => {
      process.env.MCP_MIN_WIDTH = 'invalid';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
      expect(() => createValidationConstraints()).toThrow(
        'Configuration error for "MCP_MIN_WIDTH": invalid'
      );
    });

    it('should throw ConfigurationError for invalid maxWidth', () => {
      process.env.MCP_MAX_WIDTH = 'not-a-number';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for invalid minHeight', () => {
      process.env.MCP_MIN_HEIGHT = '0';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
      expect(() => createValidationConstraints()).toThrow('Positive integer >= 1');
    });

    it('should throw ConfigurationError for invalid maxHeight', () => {
      process.env.MCP_MAX_HEIGHT = '-100';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when minWidth > maxWidth', () => {
      process.env.MCP_MIN_WIDTH = '1000';
      process.env.MCP_MAX_WIDTH = '500';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
      expect(() => createValidationConstraints()).toThrow('minWidth must be <= maxWidth');
    });

    it('should throw ConfigurationError when minHeight > maxHeight', () => {
      process.env.MCP_MIN_HEIGHT = '2000';
      process.env.MCP_MAX_HEIGHT = '1000';

      expect(() => createValidationConstraints()).toThrow(ConfigurationError);
      expect(() => createValidationConstraints()).toThrow('minHeight must be <= maxHeight');
    });

    it('should allow equal min and max values', () => {
      process.env.MCP_MIN_WIDTH = '500';
      process.env.MCP_MAX_WIDTH = '500';
      process.env.MCP_MIN_HEIGHT = '300';
      process.env.MCP_MAX_HEIGHT = '300';

      const constraints = createValidationConstraints();

      expect(constraints.minWidth).toBe(500);
      expect(constraints.maxWidth).toBe(500);
      expect(constraints.minHeight).toBe(300);
      expect(constraints.maxHeight).toBe(300);
    });
  });

  describe('createProviderConfig', () => {
    it('should return default provider configuration', () => {
      const config = createProviderConfig();

      expect(config).toEqual(DEFAULT_PROVIDER_CONFIG);
      expect(config.placehold.baseUrl).toBe('https://placehold.co');
      expect(config.placehold.urlTemplate).toBe('{baseUrl}/{width}x{height}');
      expect(config['lorem-picsum'].baseUrl).toBe('https://picsum.photos');
      expect(config['lorem-picsum'].urlTemplate).toBe('{baseUrl}/{width}/{height}');
    });

    it('should return consistent configuration object', () => {
      const config1 = createProviderConfig();
      const config2 = createProviderConfig();

      expect(config1).toEqual(config2);

      // Configuration should have expected structure
      expect(config1.placehold.baseUrl).toBe('https://placehold.co');
      expect(config1.placehold.urlTemplate).toBe('{baseUrl}/{width}x{height}');
      expect(config2['lorem-picsum'].baseUrl).toBe('https://picsum.photos');
      expect(config2['lorem-picsum'].urlTemplate).toBe('{baseUrl}/{width}/{height}');
    });
  });

  describe('Default Exports', () => {
    it('should export DEFAULT_CONFIG', () => {
      expect(DEFAULT_CONFIG).toBeDefined();
      expect(DEFAULT_CONFIG.name).toBe('image-placeholder');
      expect(DEFAULT_CONFIG.version).toBe('1.1.0');
      expect(DEFAULT_CONFIG.logLevel).toBe('info');
      expect(DEFAULT_CONFIG.environment).toBe('development');
    });

    it('should export DEFAULT_CONSTRAINTS', () => {
      expect(DEFAULT_CONSTRAINTS).toBeDefined();
      expect(DEFAULT_CONSTRAINTS.minWidth).toBe(1);
      expect(DEFAULT_CONSTRAINTS.maxWidth).toBe(10000);
      expect(DEFAULT_CONSTRAINTS.minHeight).toBe(1);
      expect(DEFAULT_CONSTRAINTS.maxHeight).toBe(10000);
      expect(DEFAULT_CONSTRAINTS.supportedProviders).toEqual(['placehold', 'lorem-picsum']);
    });

    it('should export DEFAULT_PROVIDER_CONFIG', () => {
      expect(DEFAULT_PROVIDER_CONFIG).toBeDefined();
      expect(DEFAULT_PROVIDER_CONFIG.placehold).toBeDefined();
      expect(DEFAULT_PROVIDER_CONFIG['lorem-picsum']).toBeDefined();
    });
  });
});
