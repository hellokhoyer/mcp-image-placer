/**
 * Integration tests for core functionality
 */

import { PlaceholderGenerator } from '../../src/core/placeholderGenerator';
import { PlaceholderValidator } from '../../src/core/validator';
import { createValidationConstraints, createProviderConfig } from '../../src/config/index';
import { createLogger } from '../../src/utils/logger';

// Import legacy function implementation directly to avoid MCP server imports
import { Provider } from '../../src/types/index';

/**
 * Legacy function for backward compatibility - copied to avoid MCP imports in tests
 */
function image_placeholder(provider: Provider, width: number, height: number): string {
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

describe('Core Integration', () => {
  it('should integrate all core components successfully', async () => {
    const constraints = createValidationConstraints();
    const providerConfig = createProviderConfig();
    const logger = createLogger('error', 'test');

    const validator = new PlaceholderValidator(constraints);
    const generator = new PlaceholderGenerator(validator, providerConfig, logger);

    const result = await generator.generatePlaceholder({
      provider: 'placehold',
      width: 300,
      height: 200,
    });

    expect(result.url).toBe('https://placehold.co/300x200');
    expect(result.provider).toBe('placehold');
    expect(result.dimensions).toEqual({ width: 300, height: 200 });
  });

  it('should support legacy image_placeholder function', () => {
    const url = image_placeholder('lorem-picsum', 400, 300);
    expect(url).toBe('https://picsum.photos/400/300');
  });

  it('should handle validation errors in legacy function', () => {
    expect(() => {
      image_placeholder('placehold', 0, 100);
    }).toThrow('Invalid width: 0');
  });
});
