/**
 * Type definitions for MCP Image Placeholder server
 */

export type Provider = 'placehold' | 'lorem-picsum';

export interface ImagePlaceholderParams {
  provider: Provider;
  width: number;
  height: number;
}

export interface ImagePlaceholderResult {
  url: string;
  provider: Provider;
  dimensions: {
    width: number;
    height: number;
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
