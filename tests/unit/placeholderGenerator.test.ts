/**
 * Enhanced unit tests for PlaceholderGenerator with comprehensive provider-specific features
 */

import { PlaceholderGenerator } from '../../src/core/placeholderGenerator';
import { PlaceholderValidator } from '../../src/core/validator';
import {
  ImagePlaceholderParams,
  ValidationConstraints,
  ProviderConfig,
  Logger,
} from '../../src/types/index';
import { ValidationError } from '../../src/errors/index';

// Mock logger
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('Enhanced PlaceholderGenerator', () => {
  let generator: PlaceholderGenerator;
  let validator: PlaceholderValidator;
  let constraints: ValidationConstraints;
  let providerConfig: ProviderConfig;

  beforeEach(() => {
    constraints = {
      minWidth: 10,
      maxWidth: 4000,
      minHeight: 10,
      maxHeight: 4000,
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

  describe('Basic functionality (backward compatibility)', () => {
    it('should generate basic placehold URL', async () => {
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
        appliedOptions: {},
      });
    });

    it('should generate basic picsum URL', async () => {
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
        appliedOptions: {},
      });
    });

    it('should generate square images when height is omitted', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
      };

      const result = await generator.generatePlaceholder(params);

      expect(result).toEqual({
        url: 'https://placehold.co/300',
        provider: 'placehold',
        dimensions: { width: 300, height: 300 },
        appliedOptions: {},
      });
    });
  });

  describe('Placehold.co enhanced features', () => {
    describe('File formats', () => {
      it('should generate PNG format URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: { format: 'png' },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400.png');
      });

      it('should generate WebP format URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: { format: 'webp' },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400.webp');
      });

      it('should default to SVG (no extension)', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: { format: 'svg' },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400');
      });
    });

    describe('Colors', () => {
      it('should generate URL with hex colors', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            backgroundColor: '000000',
            textColor: 'FFFFFF',
            format: 'png',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400/000000/FFFFFF.png');
      });

      it('should generate URL with CSS color names', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            backgroundColor: 'orange',
            textColor: 'white',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400/orange/white');
      });

      it('should generate URL with transparent background', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            backgroundColor: 'transparent',
            textColor: 'F00',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400/transparent/F00');
      });

      it('should throw error if only one color is specified', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            backgroundColor: 'red',
            // textColor missing
          },
        };

        await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
      });
    });

    describe('Custom text', () => {
      it('should generate URL with custom text', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            customText: 'Hello World',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400?text=Hello+World');
      });

      it('should handle text with newlines', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            customText: 'Hello\nWorld',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400?text=Hello\\nWorld');
      });
    });

    describe('Fonts', () => {
      it('should generate URL with custom font', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            font: 'roboto',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400?font=roboto');
      });

      it('should handle fonts with dashes', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 800,
          placeholdOptions: {
            customText: 'Hello World',
            font: 'playfair-display',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/800?text=Hello+World&font=playfair+display');
      });
    });

    describe('Retina support', () => {
      it('should generate 2x retina URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            retina: '2x',
            format: 'png',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/600x400@2x.png');
      });

      it('should generate 3x retina URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 800,
          placeholdOptions: {
            retina: '3x',
            format: 'webp',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://placehold.co/800@3x.webp');
      });

      it('should throw error for retina with SVG', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 600,
          height: 400,
          placeholdOptions: {
            retina: '2x',
            format: 'svg',
          },
        };

        await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
      });
    });

    describe('Complex combinations', () => {
      it('should generate full-featured URL from documentation example', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'placehold',
          width: 1200,
          height: 630,
          placeholdOptions: {
            retina: '2x',
            backgroundColor: 'f9fafb',
            textColor: '2563eb',
            format: 'png',
            customText: 'DeepakNess',
            font: 'playfair-display',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe(
          'https://placehold.co/1200x630@2x/f9fafb/2563eb.png?text=DeepakNess&font=playfair+display'
        );
      });
    });
  });

  describe('Picsum.photos enhanced features', () => {
    describe('Specific images', () => {
      it('should generate URL with specific image ID', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            imageId: 237,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/id/237/200/300');
      });
    });

    describe('Seeded random images', () => {
      it('should generate URL with seed', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            seed: 'picsum',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/seed/picsum/200/300');
      });
    });

    describe('Effects', () => {
      it('should generate grayscale URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            grayscale: true,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300?grayscale');
      });

      it('should generate blur URL with default intensity', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            blur: 1,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300?blur');
      });

      it('should generate blur URL with specific intensity', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            blur: 2,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300?blur=2');
      });

      it('should generate combined effects URL from documentation', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            imageId: 870,
            grayscale: true,
            blur: 2,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/id/870/200/300?grayscale&blur=2');
      });
    });

    describe('File formats', () => {
      it('should generate JPG format URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            format: 'jpg',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300.jpg');
      });

      it('should generate WebP format URL', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            format: 'webp',
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300.webp');
      });
    });

    describe('Cache busting', () => {
      it('should generate URL with random parameter', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            random: 1,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300?random=1');
      });

      it('should combine random with effects', async () => {
        const params: ImagePlaceholderParams = {
          provider: 'lorem-picsum',
          width: 200,
          height: 300,
          picsumOptions: {
            random: 2,
            grayscale: true,
          },
        };

        const result = await generator.generatePlaceholder(params);
        expect(result.url).toBe('https://picsum.photos/200/300?grayscale&random=2');
      });
    });
  });

  describe('Validation and error handling', () => {
    it('should reject mismatched provider options', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
        picsumOptions: { grayscale: true }, // Wrong options for placehold
      };

      await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
    });

    it('should reject invalid color combinations', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
        placeholdOptions: {
          backgroundColor: 'invalid-color',
          textColor: 'white',
        },
      };

      await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
    });

    it('should reject invalid blur values', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 300,
        height: 200,
        picsumOptions: {
          blur: 15, // Invalid: must be 1-10
        },
      };

      await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
    });

    it('should reject mutually exclusive picsum options', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'lorem-picsum',
        width: 300,
        height: 200,
        picsumOptions: {
          imageId: 123,
          seed: 'test', // Can't have both
        },
      };

      await expect(generator.generatePlaceholder(params)).rejects.toThrow(ValidationError);
    });
  });

  describe('Logging and debugging', () => {
    it('should include applied options in result', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
        placeholdOptions: {
          format: 'png',
          backgroundColor: 'red',
          textColor: 'white',
        },
      };

      const result = await generator.generatePlaceholder(params);

      expect(result.appliedOptions).toEqual({
        placeholdOptions: {
          format: 'png',
          backgroundColor: 'red',
          textColor: 'white',
        },
      });
    });

    it('should log generation with enhanced information', async () => {
      const params: ImagePlaceholderParams = {
        provider: 'placehold',
        width: 300,
        height: 200,
        placeholdOptions: { format: 'png' },
      };

      await generator.generatePlaceholder(params);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Placeholder image generated successfully',
        expect.objectContaining({
          provider: 'placehold',
          dimensions: '300x200',
          hasOptions: true,
        })
      );
    });
  });

  describe('Provider management', () => {
    it('should get supported providers from factory', () => {
      const providers = generator.getSupportedProviders();
      expect(providers).toContain('placehold');
      expect(providers).toContain('lorem-picsum');
    });

    it('should get provider base URL from factory', () => {
      const placeholdUrl = generator.getProviderBaseUrl('placehold');
      const picsumUrl = generator.getProviderBaseUrl('lorem-picsum');

      expect(placeholdUrl).toBe('https://placehold.co');
      expect(picsumUrl).toBe('https://picsum.photos');
    });
  });
});
