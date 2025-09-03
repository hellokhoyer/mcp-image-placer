/**
 * Main entry point for MCP Image Placeholder package
 * Provides both programmatic API and backward compatibility
 */

// Export all types for consumers
export type {
  Provider,
  ImagePlaceholderParams,
  ImagePlaceholderResult,
  ServerConfig,
  ValidationConstraints,
  ProviderConfig,
  Logger,
} from './types/index.js';

// Export core classes for programmatic usage
export { PlaceholderValidator } from './core/validator.js';
export { PlaceholderGenerator } from './core/placeholderGenerator.js';
export { MCPImagePlaceholderServer } from './core/mcpServer.js';

// Export configuration factories
export {
  createConfig,
  createValidationConstraints,
  createProviderConfig,
  DEFAULT_CONFIG,
  DEFAULT_CONSTRAINTS,
  DEFAULT_PROVIDER_CONFIG,
} from './config/index.js';

// Export utility functions
export { createLogger } from './utils/logger.js';

// Export error classes
export {
  ImagePlaceholderError,
  ValidationError,
  ProviderError,
  ConfigurationError,
  ServerError,
} from './errors/index.js';

// Backward compatibility: Legacy function that matches original API
import { PlaceholderValidator } from './core/validator.js';
import { createValidationConstraints, createProviderConfig } from './config/index.js';
import { Provider } from './types/index.js';

/**
 * Legacy function for backward compatibility with original API
 *
 * @deprecated Use PlaceholderGenerator class for better error handling and logging
 * @param provider - Image provider ('placehold' or 'lorem-picsum')
 * @param width - Image width (1-10000)
 * @param height - Image height (1-10000)
 * @returns Promise resolving to image URL string
 * @throws {Error} When parameters are invalid
 */
export function image_placeholder(provider: Provider, width: number, height: number): string {
  const constraints = createValidationConstraints();
  const providerConfig = createProviderConfig();
  const validator = new PlaceholderValidator(constraints);

  // Validate and generate synchronously for backward compatibility
  validator.validateParams({ provider, width, height });

  // Extract URL generation logic for synchronous operation
  const config = providerConfig[provider];
  if (!config) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  const url = config.urlTemplate
    .replace('{baseUrl}', config.baseUrl)
    .replace('{width}', width.toString())
    .replace('{height}', height.toString());

  return url;
}
