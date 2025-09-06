/**
 * Enhanced placeholder generator with provider-specific URL generation
 */

import {
  ImagePlaceholderParams,
  ImagePlaceholderResult,
  Provider,
  ProviderConfig,
  Logger,
} from '../types/index.js';
import { ProviderError } from '../errors/index.js';
import { PlaceholderValidator } from './validator.js';
import { UrlBuilderFactory } from './urlBuilders/index.js';

export class PlaceholderGenerator {
  private validator: PlaceholderValidator;
  private providerConfig: ProviderConfig;
  private logger: Logger;

  constructor(validator: PlaceholderValidator, providerConfig: ProviderConfig, logger: Logger) {
    this.validator = validator;
    this.providerConfig = providerConfig;
    this.logger = logger;
  }

  /**
   * Generates a placeholder image URL based on the provided parameters
   *
   * @param params - Parameters for image generation including provider-specific options
   * @returns Promise resolving to image placeholder result
   * @throws {ValidationError} When parameters are invalid
   * @throws {ProviderError} When provider-specific generation fails
   */
  async generatePlaceholder(params: ImagePlaceholderParams): Promise<ImagePlaceholderResult> {
    this.logger.debug('Generating placeholder image', { params });

    // Validate basic parameters
    this.validator.validateParams(params);

    try {
      // Use URL builder factory to create provider-specific builder
      const urlBuilder = UrlBuilderFactory.createBuilder(params.provider, this.logger);

      let url: string;
      const effectiveHeight = params.height || params.width;

      // Generate URL based on provider
      if (params.provider === 'placehold') {
        url = urlBuilder.buildUrl(params.width, params.height, params.placeholdOptions);
      } else if (params.provider === 'lorem-picsum') {
        url = urlBuilder.buildUrl(params.width, params.height, params.picsumOptions);
      } else {
        throw new ProviderError(params.provider, 'Unsupported provider');
      }

      const result: ImagePlaceholderResult = {
        url,
        provider: params.provider,
        dimensions: {
          width: params.width,
          height: effectiveHeight,
        },
        appliedOptions: {
          ...(params.placeholdOptions && { placeholdOptions: params.placeholdOptions }),
          ...(params.picsumOptions && { picsumOptions: params.picsumOptions }),
        },
      };

      this.logger.info('Placeholder image generated successfully', {
        provider: params.provider,
        dimensions: `${params.width}x${effectiveHeight}`,
        url,
        hasOptions: !!(params.placeholdOptions || params.picsumOptions),
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to generate placeholder image', error as Error, { params });
      throw error;
    }
  }

  /**
   * Gets list of supported providers
   *
   * @returns Array of supported provider names
   */
  getSupportedProviders(): Provider[] {
    return UrlBuilderFactory.getSupportedProviders();
  }

  /**
   * Gets provider configuration for a specific provider
   *
   * @param provider - Provider to get configuration for
   * @returns Provider configuration or undefined if not found
   */
  getProviderConfig(provider: Provider): ProviderConfig[Provider] | undefined {
    return this.providerConfig[provider];
  }

  /**
   * Gets base URL for a provider (using URL builder factory)
   *
   * @param provider - Provider to get base URL for
   * @returns Base URL or undefined if provider not supported
   */
  getProviderBaseUrl(provider: Provider): string | undefined {
    return UrlBuilderFactory.getProviderBaseUrl(provider);
  }
}
