/**
 * Factory for creating provider-specific URL builders
 */

import { Provider, UrlBuilder, Logger } from '../../types/index.js';
import { PlaceholdUrlBuilder } from './PlaceholdUrlBuilder.js';
import { PicsumUrlBuilder } from './PicsumUrlBuilder.js';
import { ProviderError } from '../../errors/index.js';

export class UrlBuilderFactory {
  private static readonly PROVIDER_CONFIGS = {
    placehold: 'https://placehold.co',
    'lorem-picsum': 'https://picsum.photos',
  } as const;

  /**
   * Creates appropriate URL builder for the specified provider
   */
  static createBuilder(provider: Provider, logger: Logger): UrlBuilder {
    const baseUrl = this.PROVIDER_CONFIGS[provider];

    if (!baseUrl) {
      throw new ProviderError(provider, `Unsupported provider: ${provider}`, {
        supportedProviders: Object.keys(this.PROVIDER_CONFIGS),
      });
    }

    switch (provider) {
      case 'placehold':
        return new PlaceholdUrlBuilder(baseUrl, logger);

      case 'lorem-picsum':
        return new PicsumUrlBuilder(baseUrl, logger);

      default:
        throw new ProviderError(provider, `No URL builder implemented for provider: ${provider}`, {
          supportedProviders: Object.keys(this.PROVIDER_CONFIGS),
        });
    }
  }

  /**
   * Gets list of supported providers
   */
  static getSupportedProviders(): Provider[] {
    return Object.keys(this.PROVIDER_CONFIGS) as Provider[];
  }

  /**
   * Gets base URL for a provider
   */
  static getProviderBaseUrl(provider: Provider): string | undefined {
    return this.PROVIDER_CONFIGS[provider];
  }
}
