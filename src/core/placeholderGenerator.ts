/**
 * Placeholder generator with provider-specific URL generation
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
   * @param params - Parameters for image generation
   * @returns Promise resolving to image placeholder result
   * @throws {ValidationError} When parameters are invalid
   * @throws {ProviderError} When provider-specific generation fails
   */
  async generatePlaceholder(params: ImagePlaceholderParams): Promise<ImagePlaceholderResult> {
    this.logger.debug('Generating placeholder image', { params });

    // Validate parameters
    this.validator.validateParams(params);

    try {
      const url = this.buildProviderUrl(params.provider, params.width, params.height);

      const result: ImagePlaceholderResult = {
        url,
        provider: params.provider,
        dimensions: {
          width: params.width,
          height: params.height,
        },
      };

      this.logger.info('Placeholder image generated successfully', {
        provider: params.provider,
        dimensions: `${params.width}x${params.height}`,
        url,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to generate placeholder image', error as Error, { params });
      throw error;
    }
  }

  /**
   * Builds provider-specific URL for placeholder image
   *
   * @param provider - The provider to use
   * @param width - Image width
   * @param height - Image height
   * @returns Generated URL string
   * @throws {ProviderError} When provider configuration is invalid
   */
  private buildProviderUrl(provider: Provider, width: number, height: number): string {
    const config = this.providerConfig[provider];

    if (!config) {
      throw new ProviderError(provider, 'Provider configuration not found', {
        availableProviders: Object.keys(this.providerConfig),
      });
    }

    if (!config.baseUrl || !config.urlTemplate) {
      throw new ProviderError(
        provider,
        'Invalid provider configuration - missing baseUrl or urlTemplate',
        { config }
      );
    }

    const url = this.interpolateUrlTemplate(config.urlTemplate, {
      baseUrl: config.baseUrl,
      width: width.toString(),
      height: height.toString(),
    });

    this.logger.debug('Built provider URL', {
      provider,
      template: config.urlTemplate,
      url,
      dimensions: `${width}x${height}`,
    });

    return url;
  }

  /**
   * Interpolates URL template with provided variables
   *
   * @param template - URL template string
   * @param variables - Variables to interpolate
   * @returns Interpolated URL string
   */
  private interpolateUrlTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_match, key) => {
      if (variables[key] !== undefined) {
        return variables[key];
      }
      throw new ProviderError('template', `Template variable "${key}" not provided`, {
        template,
        variables,
        missingVariable: key,
      });
    });
  }

  /**
   * Gets list of supported providers
   *
   * @returns Array of supported provider names
   */
  getSupportedProviders(): Provider[] {
    return Object.keys(this.providerConfig) as Provider[];
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
}
