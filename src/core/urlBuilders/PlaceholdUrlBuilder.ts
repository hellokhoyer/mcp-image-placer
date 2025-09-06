/**
 * URL builder for placehold.co provider
 */

import { BaseUrlBuilder } from './BaseUrlBuilder.js';
import {
  PlaceholdOptions,
  PlaceholdUrlBuilder as IPlaceholdUrlBuilder,
  Logger,
} from '../../types/index.js';
import { ValidationError } from '../../errors/index.js';

export class PlaceholdUrlBuilder extends BaseUrlBuilder implements IPlaceholdUrlBuilder {
  private readonly supportedFormats = ['svg', 'png', 'jpeg', 'gif', 'webp', 'avif'];
  private readonly supportedFonts = [
    'lato',
    'lora',
    'montserrat',
    'noto-sans',
    'open-sans',
    'oswald',
    'playfair-display',
    'poppins',
    'pt-sans',
    'raleway',
    'roboto',
    'source-sans-pro',
  ];
  private readonly retinaFormats = ['png', 'jpeg', 'gif', 'webp', 'avif'];

  constructor(baseUrl: string, logger: Logger) {
    super(baseUrl, logger);
  }

  /**
   * Builds placehold.co URL with all supported options
   * URL Structure: https://placehold.co/\{size\}\[@2x\|@3x\]\[/\{bg_color\}/\{text_color\}\]\[.\{format\}\]\[\?text\=Your+Text\]\[\&font\=FontName\]
   */
  buildUrl(width: number, height?: number, options?: PlaceholdOptions): string {
    this.validateDimensions(width, height);

    if (options) {
      this.validateOptions(options);
    }

    const effectiveHeight = height || width;
    let url = this.baseUrl;

    // Size component
    url += `/${width}`;
    if (height && height !== width) {
      url += `x${height}`;
    }

    // Retina scaling
    if (options?.retina) {
      url += `@${options.retina}`;
    }

    // Colors (both must be specified together)
    if (options?.backgroundColor && options?.textColor) {
      url += `/${options.backgroundColor}/${options.textColor}`;
    }

    // Format extension
    if (options?.format && options.format !== 'svg') {
      url += `.${options.format}`;
    }

    // Query parameters
    const queryParams: string[] = [];

    if (options?.customText) {
      queryParams.push(`text=${this.encodeText(options.customText)}`);
    }

    if (options?.font && options.font !== 'lato') {
      queryParams.push(`font=${options.font.replace('-', '+')}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    this.logger.debug('Built placehold.co URL', {
      width,
      height: effectiveHeight,
      options,
      url,
    });

    return url;
  }

  /**
   * Validates placehold.co specific options
   */
  validateOptions(options?: PlaceholdOptions): boolean {
    if (!options) return true;

    // Validate format
    if (options.format && !this.supportedFormats.includes(options.format)) {
      throw new ValidationError(
        'format',
        options.format,
        `Format must be one of: ${this.supportedFormats.join(', ')}`
      );
    }

    // Validate retina format compatibility
    if (options.retina && options.format && !this.retinaFormats.includes(options.format)) {
      throw new ValidationError(
        'retina',
        `${options.retina} with ${options.format}`,
        `Retina scaling is only supported for: ${this.retinaFormats.join(', ')}`
      );
    }

    // Validate colors (both or neither)
    if (options.backgroundColor || options.textColor) {
      if (!options.backgroundColor || !options.textColor) {
        throw new ValidationError(
          'colors',
          `bg: ${options.backgroundColor || 'missing'}, text: ${options.textColor || 'missing'}`,
          'Both backgroundColor and textColor must be specified together'
        );
      }

      if (!this.isValidColor(options.backgroundColor)) {
        throw new ValidationError(
          'backgroundColor',
          options.backgroundColor,
          'Invalid color format (use hex codes, CSS color names, or "transparent")'
        );
      }

      if (!this.isValidColor(options.textColor)) {
        throw new ValidationError(
          'textColor',
          options.textColor,
          'Invalid color format (use hex codes or CSS color names)'
        );
      }
    }

    // Validate font
    if (options.font && !this.supportedFonts.includes(options.font)) {
      throw new ValidationError(
        'font',
        options.font,
        `Font must be one of: ${this.supportedFonts.join(', ')}`
      );
    }

    // Validate retina option
    if (options.retina && !['2x', '3x'].includes(options.retina)) {
      throw new ValidationError('retina', options.retina, 'Retina must be "2x" or "3x"');
    }

    return true;
  }
}
