/**
 * Base URL builder with common functionality
 */

import { UrlBuilder, Logger } from '../../types/index.js';
import { ValidationError } from '../../errors/index.js';

export abstract class BaseUrlBuilder implements UrlBuilder {
  protected baseUrl: string;
  protected logger: Logger;

  constructor(baseUrl: string, logger: Logger) {
    this.baseUrl = baseUrl;
    this.logger = logger;
  }

  abstract buildUrl(_width: number, _height?: number, _options?: unknown): string;
  abstract validateOptions(_options?: unknown): boolean;

  /**
   * Validates basic dimension parameters
   */
  protected validateDimensions(width: number, height?: number): void {
    if (!Number.isInteger(width) || width < 10 || width > 4000) {
      throw new ValidationError('width', width, 'Width must be an integer between 10 and 4000');
    }

    if (height !== undefined) {
      if (!Number.isInteger(height) || height < 10 || height > 4000) {
        throw new ValidationError(
          'height',
          height,
          'Height must be an integer between 10 and 4000'
        );
      }
    }
  }

  /**
   * Validates hex color format
   */
  protected isValidHexColor(color: string): boolean {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Validates CSS color names (common ones)
   */
  protected isValidCssColor(color: string): boolean {
    const cssColors = [
      'black',
      'white',
      'red',
      'green',
      'blue',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'gray',
      'grey',
      'cyan',
      'magenta',
      'lime',
      'maroon',
      'navy',
      'olive',
      'silver',
      'teal',
      'aqua',
      'fuchsia',
      'transparent',
    ];
    return cssColors.includes(color.toLowerCase());
  }

  /**
   * Validates color value (hex, CSS name, or transparent)
   */
  protected isValidColor(color: string): boolean {
    return color === 'transparent' || this.isValidHexColor(color) || this.isValidCssColor(color);
  }

  /**
   * Encodes text for URL (spaces to +, preserve newlines as \n)
   */
  protected encodeText(text: string): string {
    return text.replace(/ /g, '+').replace(/\n/g, '\\n');
  }
}
