/**
 * Type definitions for MCP Image Placeholder server
 */

export type Provider = 'placehold' | 'lorem-picsum';

// Provider-specific options

/**
 * Options for placehold.co provider
 */
export interface PlaceholdOptions {
  /** Image format - default: svg */
  format?: 'svg' | 'png' | 'jpeg' | 'gif' | 'webp' | 'avif';
  /** Background color (hex, CSS name, or 'transparent') */
  backgroundColor?: string;
  /** Text color (hex or CSS name) - required if backgroundColor is specified */
  textColor?: string;
  /** Custom text to display (spaces become +, newlines become \n) */
  customText?: string;
  /** Font family to use - default: lato */
  font?:
    | 'lato'
    | 'lora'
    | 'montserrat'
    | 'noto-sans'
    | 'open-sans'
    | 'oswald'
    | 'playfair-display'
    | 'poppins'
    | 'pt-sans'
    | 'raleway'
    | 'roboto'
    | 'source-sans-pro';
  /** Retina scaling factor (only for png, jpeg, gif, webp, avif) */
  retina?: '2x' | '3x';
}

/**
 * Options for picsum.photos provider
 */
export interface PicsumOptions {
  /** Image format - default: none (random) */
  format?: 'jpg' | 'webp';
  /** Specific image ID */
  imageId?: number;
  /** Seed for consistent random image */
  seed?: string;
  /** Apply grayscale effect */
  grayscale?: boolean;
  /** Blur intensity (1-10) */
  blur?: number;
  /** Random parameter to prevent caching */
  random?: number;
}

/**
 * Parameters for generating placeholder images
 */
export interface ImagePlaceholderParams {
  provider: Provider;
  width: number;
  /** Height - optional for square images */
  height?: number;
  /** Options specific to placehold.co provider */
  placeholdOptions?: PlaceholdOptions;
  /** Options specific to picsum.photos provider */
  picsumOptions?: PicsumOptions;
}

/**
 * Result of placeholder image generation
 */
export interface ImagePlaceholderResult {
  url: string;
  provider: Provider;
  dimensions: {
    width: number;
    height: number;
  };
  /** Applied options for debugging/logging */
  appliedOptions?: {
    placeholdOptions?: PlaceholdOptions;
    picsumOptions?: PicsumOptions;
  };
}

export interface ServerConfig {
  name: string;
  version: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  environment: 'development' | 'production' | 'test';
}

export interface ValidationConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  supportedProviders: Provider[];
}

export interface Logger {
  debug(_message: string, _meta?: Record<string, unknown>): void;
  info(_message: string, _meta?: Record<string, unknown>): void;
  warn(_message: string, _meta?: Record<string, unknown>): void;
  error(_message: string, _error?: Error, _meta?: Record<string, unknown>): void;
}

export interface ProviderConfig {
  placehold: {
    baseUrl: string;
    urlTemplate: string;
  };
  'lorem-picsum': {
    baseUrl: string;
    urlTemplate: string;
  };
}

// URL Builder interfaces

/**
 * Base interface for URL builders
 */
export interface UrlBuilder {
  buildUrl(_width: number, _height?: number, _options?: unknown): string;
  validateOptions(_options?: unknown): boolean;
}

/**
 * Interface for placehold.co URL builder
 */
export interface PlaceholdUrlBuilder extends UrlBuilder {
  buildUrl(_width: number, _height?: number, _options?: PlaceholdOptions): string;
  validateOptions(_options?: PlaceholdOptions): boolean;
}

/**
 * Interface for picsum.photos URL builder
 */
export interface PicsumUrlBuilder extends UrlBuilder {
  buildUrl(_width: number, _height?: number, _options?: PicsumOptions): string;
  validateOptions(_options?: PicsumOptions): boolean;
}
