/**
 * URL builder for picsum.photos provider
 */

import { BaseUrlBuilder } from './BaseUrlBuilder.js';
import { PicsumOptions, PicsumUrlBuilder as IPicsumUrlBuilder, Logger } from '../../types/index.js';
import { ValidationError } from '../../errors/index.js';

export class PicsumUrlBuilder extends BaseUrlBuilder implements IPicsumUrlBuilder {
  private readonly supportedFormats = ['jpg', 'webp'];

  constructor(baseUrl: string, logger: Logger) {
    super(baseUrl, logger);
  }

  /**
   * Builds picsum.photos URL with all supported options
   * URL Patterns:
   * - Random: https://picsum.photos/\{width\}/\{height\}\[.\{format\}\]\[\?\{effects\}\]
   * - Specific: https://picsum.photos/id/\{id\}/\{width\}/\{height\}\[.\{format\}\]\[\?\{effects\}\]
   * - Seeded: https://picsum.photos/seed/\{seed\}/\{width\}/\{height\}\[.\{format\}\]\[\?\{effects\}\]
   */
  buildUrl(width: number, height?: number, options?: PicsumOptions): string {
    this.validateDimensions(width, height);

    if (options) {
      this.validateOptions(options);
    }

    const effectiveHeight = height || width;
    let url = this.baseUrl;

    // ID or seed prefix
    if (options?.imageId) {
      url += `/id/${options.imageId}`;
    } else if (options?.seed) {
      url += `/seed/${encodeURIComponent(options.seed)}`;
    }

    // Dimensions
    url += `/${width}`;
    if (height && height !== width) {
      url += `/${height}`;
    }

    // Format extension
    if (options?.format) {
      url += `.${options.format}`;
    }

    // Query parameters for effects
    const queryParams: string[] = [];

    if (options?.grayscale) {
      queryParams.push('grayscale');
    }

    if (options?.blur !== undefined) {
      if (options.blur === 0 || options.blur === 1) {
        queryParams.push('blur');
      } else {
        queryParams.push(`blur=${options.blur}`);
      }
    }

    if (options?.random !== undefined) {
      queryParams.push(`random=${options.random}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.logger.debug('Built picsum.photos URL', {
      width,
      height: effectiveHeight,
      options,
      url,
    });

    return url;
  }

  /**
   * Validates picsum.photos specific options
   */
  validateOptions(options?: PicsumOptions): boolean {
    if (!options) return true;

    // Validate format
    if (options.format && !this.supportedFormats.includes(options.format)) {
      throw new ValidationError(
        'format',
        options.format,
        `Format must be one of: ${this.supportedFormats.join(', ')}`
      );
    }

    // Validate image ID
    if (options.imageId !== undefined) {
      if (!Number.isInteger(options.imageId) || options.imageId < 0) {
        throw new ValidationError(
          'imageId',
          options.imageId,
          'Image ID must be a non-negative integer'
        );
      }
    }

    // Validate seed
    if (options.seed !== undefined) {
      if (typeof options.seed !== 'string' || options.seed.trim().length === 0) {
        throw new ValidationError('seed', options.seed, 'Seed must be a non-empty string');
      }
    }

    // Validate blur
    if (options.blur !== undefined) {
      if (!Number.isInteger(options.blur) || options.blur < 1 || options.blur > 10) {
        throw new ValidationError('blur', options.blur, 'Blur must be an integer between 1 and 10');
      }
    }

    // Validate random
    if (options.random !== undefined) {
      if (!Number.isInteger(options.random) || options.random < 0) {
        throw new ValidationError(
          'random',
          options.random,
          'Random must be a non-negative integer'
        );
      }
    }

    // Validate mutually exclusive options
    if (options.imageId !== undefined && options.seed !== undefined) {
      throw new ValidationError(
        'options',
        'imageId and seed both specified',
        'Cannot specify both imageId and seed - they are mutually exclusive'
      );
    }

    return true;
  }
}
