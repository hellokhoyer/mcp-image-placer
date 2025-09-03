/**
 * Unit tests for PlaceholderGenerator
 */

import { PlaceholderGenerator } from '../../src/core/placeholderGenerator';
import { PlaceholderValidator } from '../../src/core/validator';
import {
  ImagePlaceholderParams,
  ValidationConstraints,
  ProviderConfig,
  Logger,
  Provider,
} from '../../src/types/index';
import { ProviderError } from '../../src/errors/index';

// Mock logger
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('PlaceholderGenerator', () => {
  let generator: PlaceholderGenerator;
  let validator: PlaceholderValidator;
  let constraints: ValidationConstraints;
  let providerConfig: ProviderConfig;

  beforeEach(() => {
    constraints = {
      minWidth: 1,
      maxWidth: 10000,
      minHeight: 1,
      maxHeight: 10000,
      supportedProviders: ['placehold', 'lorem-picsum'],
    };

    providerConfig = {
      placehold: {
        baseUrl: 'https://placehold.co',
        urlTemplate: '{baseUrl}/{width}x{height}',
      },
      'lorem-picsum': {
        baseUrl: 'https://picsum.photos',
        urlTemplate: '{baseUrl}/{width}/{height}',
      },
    };

    validator = new PlaceholderValidator(constraints);
    generator = new PlaceholderGenerator(validator, providerConfig, mockLogger);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generatePlaceholder', () => {
    it('should generate placeholder for placehold provider', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
      };

      const result = await generator.generatePlaceholder(params);

      expect(result).toEqual({
        url: 'https://placehold.co/300x200',
        provider: 'placehold',
        dimensions: { width: 300, height: 200 },
      });

      expect(mockLogger.debug).toHaveBeenCalledWith('Generating placeholder image', { params });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Placeholder image generated successfully',
        expect.objectContaining({
          provider: 'placehold',
          dimensions: '300x200',
          url: 'https://placehold.co/300x200',
        })
      );
    });

    it('should generate placeholder for lorem-picsum provider', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 400,
        height: 300,
      };

      const result = await generator.generatePlaceholder(params);

      expect(result).toEqual({
        url: 'https://picsum.photos/400/300',
        provider: 'lorem-picsum',
        dimensions: { width: 400, height: 300 },
      });
    });

    it('should handle provider configuration errors', async () => {
      // Create generator with missing provider config
      const incompleteConfig: Partial<ProviderConfig> = {
        placehold: {
          baseUrl: 'https://placehold.co',
          urlTemplate: '{baseUrl}/{width}x{height}',
        },
        // missing lorem-picsum config
      };

      const generatorWithBadConfig = new PlaceholderGenerator(
        validator,
        incompleteConfig as ProviderConfig,
        mockLogger
      );

      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 300,
        height: 200,
      };

      await expect(generatorWithBadConfig.generatePlaceholder(params)).rejects.toThrow(
        ProviderError
      );
    });

    it('should handle invalid provider configuration structure', async () => {
      const badConfig: ProviderConfig = {
        placehold: {
          baseUrl: '', // Empty baseUrl
          urlTemplate: '{baseUrl}/{width}x{height}',
        },
        'lorem-picsum': {
          baseUrl: 'https://picsum.photos',
          urlTemplate: '{baseUrl}/{width}/{height}',
        },
      };

      const generatorWithBadConfig = new PlaceholderGenerator(validator, badConfig, mockLogger);

      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
      };

      await expect(generatorWithBadConfig.generatePlaceholder(params)).rejects.toThrow(
        ProviderError
      );
    });
  });

  describe('buildProviderUrl', () => {
    it('should handle template with all required variables', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 150,
        height: 100,
      };

      const result = await generator.generatePlaceholder(params);
      expect(result.url).toBe('https://placehold.co/150x100');
    });

    it('should handle different URL templates', async () => {
      // Test lorem-picsum format
      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 500,
        height: 350,
      };

      const result = await generator.generatePlaceholder(params);
      expect(result.url).toBe('https://picsum.photos/500/350');
    });

    it('should throw ProviderError for missing template variables', async () => {
      const badConfig: ProviderConfig = {
        placehold: {
          baseUrl: 'https://placehold.co',
          urlTemplate: '{baseUrl}/{width}x{height}x{missing}', // Missing variable
        },
        'lorem-picsum': {
          baseUrl: 'https://picsum.photos',
          urlTemplate: '{baseUrl}/{width}/{height}',
        },
      };

      const generatorWithBadTemplate = new PlaceholderGenerator(validator, badConfig, mockLogger);

      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
      };

      await expect(generatorWithBadTemplate.generatePlaceholder(params)).rejects.toThrow(
        ProviderError
      );
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = generator.getSupportedProviders();
      expect(providers).toEqual(['placehold', 'lorem-picsum']);
    });

    it('should return providers from config', () => {
      const limitedConfig: ProviderConfig = {
        placehold: {
          baseUrl: 'https://placehold.co',
          urlTemplate: '{baseUrl}/{width}x{height}',
        },
        'lorem-picsum': {
          baseUrl: 'https://picsum.photos',
          urlTemplate: '{baseUrl}/{width}/{height}',
        },
      };

      const limitedGenerator = new PlaceholderGenerator(validator, limitedConfig, mockLogger);

      const providers = limitedGenerator.getSupportedProviders();
      expect(providers).toContain('placehold');
      expect(providers).toContain('lorem-picsum');
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider configuration for valid provider', () => {
      const config = generator.getProviderConfig('placehold');
      expect(config).toEqual({
        baseUrl: 'https://placehold.co',
        urlTemplate: '{baseUrl}/{width}x{height}',
      });
    });

    it('should return undefined for invalid provider', () => {
      const config = generator.getProviderConfig('invalid-provider' as Provider);
      expect(config).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should log debug information on generation start', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 100,
        height: 100,
      };

      await generator.generatePlaceholder(params);

      expect(mockLogger.debug).toHaveBeenCalledWith('Generating placeholder image', { params });
    });

    it('should log success information on completion', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 100,
        height: 100,
      };

      await generator.generatePlaceholder(params);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Placeholder image generated successfully',
        expect.objectContaining({
          provider: 'placehold',
          dimensions: '100x100',
          url: 'https://placehold.co/100x100',
        })
      );
    });

    it('should log debug information during URL building', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 200,
        height: 150,
      };

      await generator.generatePlaceholder(params);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Built provider URL',
        expect.objectContaining({
          provider: 'placehold',
          template: '{baseUrl}/{width}x{height}',
          url: 'https://placehold.co/200x150',
          dimensions: '200x150',
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle minimum dimensions', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 1,
        height: 1,
      };

      const result = await generator.generatePlaceholder(params);
      expect(result.url).toBe('https://placehold.co/1x1');
    });

    it('should handle maximum dimensions', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 10000,
        height: 10000,
      };

      const result = await generator.generatePlaceholder(params);
      expect(result.url).toBe('https://placehold.co/10000x10000');
    });

    it('should handle large dimension numbers as strings in URL', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 9999,
        height: 8888,
      };

      const result = await generator.generatePlaceholder(params);
      expect(result.url).toBe('https://picsum.photos/9999/8888');
    });
  });
});
