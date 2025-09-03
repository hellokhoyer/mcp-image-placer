/**
 * Image placeholder validator with comprehensive validation logic
 */

import { ImagePlaceholderParams, Provider, ValidationConstraints } from '../types/index.js';
import { ValidationError, ProviderError } from '../errors/index.js';

export class PlaceholderValidator {
  private constraints: ValidationConstraints;

  constructor(constraints: ValidationConstraints) {
    this.constraints = constraints;
  }

  /**
   * Validates image placeholder parameters
   *
   * @param params - The parameters to validate
   * @throws {ValidationError} When validation fails
   * @throws {ProviderError} When provider is not supported
   */
  validateParams(params: ImagePlaceholderParams): void {
    if (!params || typeof params !== 'object') {
      throw new ValidationError('params', params, 'Must be a valid object');
    }

    this.validateProvider(params.provider);
    this.validateDimension('width', params.width);
    this.validateDimension('height', params.height);
  }

  /**
   * Validates provider parameter
   *
   * @param provider - The provider to validate
   * @throws {ValidationError} When provider type is invalid
   * @throws {ProviderError} When provider is not supported
   */
  private validateProvider(provider: unknown): asserts provider is Provider {
    if (!provider || typeof provider !== 'string') {
      throw new ValidationError('provider', provider, 'Must be a non-empty string');
    }

    if (!this.constraints.supportedProviders.includes(provider as Provider)) {
      throw new ProviderError(
        provider,
        `Unsupported provider. Supported providers: ${this.constraints.supportedProviders.join(', ')}`
      );
    }
  }

  /**
   * Validates dimension (width or height) parameter
   *
   * @param dimensionName - Name of the dimension for error messages
   * @param value - The dimension value to validate
   * @throws {ValidationError} When dimension is invalid
   */
  private validateDimension(
    dimensionName: 'width' | 'height',
    value: unknown
  ): asserts value is number {
    if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
      throw new ValidationError(dimensionName, value, 'Must be a positive integer');
    }

    const minConstraint =
      dimensionName === 'width' ? this.constraints.minWidth : this.constraints.minHeight;
    const maxConstraint =
      dimensionName === 'width' ? this.constraints.maxWidth : this.constraints.maxHeight;

    if (value < minConstraint || value > maxConstraint) {
      throw new ValidationError(
        dimensionName,
        value,
        `Must be between ${minConstraint} and ${maxConstraint} pixels`
      );
    }
  }

  /**
   * Gets the validation constraints
   *
   * @returns Current validation constraints
   */
  getConstraints(): ValidationConstraints {
    return { ...this.constraints };
  }

  /**
   * Updates validation constraints
   *
   * @param newConstraints - New constraints to apply
   */
  updateConstraints(newConstraints: Partial<ValidationConstraints>): void {
    this.constraints = { ...this.constraints, ...newConstraints };
  }
}
