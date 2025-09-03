/**
 * Tests for custom error classes
 */

import {
  ImagePlaceholderError,
  ValidationError,
  ProviderError,
  ConfigurationError,
  ServerError,
} from '../../src/errors/index.js';

describe('Error Classes', () => {
  describe('ImagePlaceholderError', () => {
    it('should create error with message only', () => {
      const error = new ImagePlaceholderError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImagePlaceholderError);
      expect(error.name).toBe('ImagePlaceholderError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.context).toBeUndefined();
      expect(error.stack).toBeDefined();
    });

    it('should create error with code and context', () => {
      const context = { userId: 123, action: 'generate' };
      const error = new ImagePlaceholderError('Test error', 'TEST_CODE', context);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.context).toEqual(context);
      expect(error.name).toBe('ImagePlaceholderError');
    });

    it('should capture stack trace when available', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      const mockCaptureStackTrace = jest.fn();
      Error.captureStackTrace = mockCaptureStackTrace;

      const error = new ImagePlaceholderError('Test error');

      expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, ImagePlaceholderError);

      // Restore original function
      Error.captureStackTrace = originalCaptureStackTrace;
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field and value', () => {
      const error = new ValidationError('width', 0);

      expect(error).toBeInstanceOf(ImagePlaceholderError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid width: 0');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toEqual({
        field: 'width',
        value: 0,
        constraints: undefined,
      });
    });

    it('should create validation error with constraints', () => {
      const error = new ValidationError('height', -5, 'Must be positive integer');

      expect(error.message).toBe('Invalid height: -5. Must be positive integer');
      expect(error.context).toEqual({
        field: 'height',
        value: -5,
        constraints: 'Must be positive integer',
      });
    });

    it('should handle complex values', () => {
      const complexValue = { nested: { value: true } };
      const error = new ValidationError('config', complexValue);

      expect(error.message).toBe('Invalid config: [object Object]');
      expect(error.context?.value).toEqual(complexValue);
    });
  });

  describe('ProviderError', () => {
    it('should create provider error with basic message', () => {
      const error = new ProviderError('placehold', 'Connection timeout');

      expect(error).toBeInstanceOf(ImagePlaceholderError);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error.name).toBe('ProviderError');
      expect(error.message).toBe('Provider "placehold" error: Connection timeout');
      expect(error.code).toBe('PROVIDER_ERROR');
      expect(error.context).toEqual({
        provider: 'placehold',
      });
    });

    it('should create provider error with additional context', () => {
      const context = { statusCode: 500, retries: 3 };
      const error = new ProviderError('lorem-picsum', 'Service unavailable', context);

      expect(error.message).toBe('Provider "lorem-picsum" error: Service unavailable');
      expect(error.context).toEqual({
        provider: 'lorem-picsum',
        statusCode: 500,
        retries: 3,
      });
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error without expected format', () => {
      const error = new ConfigurationError('maxWidth', 'invalid');

      expect(error).toBeInstanceOf(ImagePlaceholderError);
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.name).toBe('ConfigurationError');
      expect(error.message).toBe('Configuration error for "maxWidth": invalid');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.context).toEqual({
        setting: 'maxWidth',
        value: 'invalid',
        expectedFormat: undefined,
      });
    });

    it('should create configuration error with expected format', () => {
      const error = new ConfigurationError('logLevel', 'invalid', 'debug|info|warn|error');

      expect(error.message).toBe(
        'Configuration error for "logLevel": invalid. Expected: debug|info|warn|error'
      );
      expect(error.context).toEqual({
        setting: 'logLevel',
        value: 'invalid',
        expectedFormat: 'debug|info|warn|error',
      });
    });
  });

  describe('ServerError', () => {
    it('should create server error with message only', () => {
      const error = new ServerError('Failed to start server');

      expect(error).toBeInstanceOf(ImagePlaceholderError);
      expect(error).toBeInstanceOf(ServerError);
      expect(error.name).toBe('ServerError');
      expect(error.message).toBe('Failed to start server');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.context).toBeUndefined();
    });

    it('should create server error with context', () => {
      const context = { port: 3000, reason: 'Port already in use' };
      const error = new ServerError('Failed to bind to port', context);

      expect(error.message).toBe('Failed to bind to port');
      expect(error.context).toEqual(context);
    });
  });
});
