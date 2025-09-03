/**
 * Unit tests for PlaceholderValidator
 */

import { PlaceholderValidator } from '../../src/core/validator';
import { ValidationConstraints, Provider } from '../../src/types/index';
import { ValidationError, ProviderError } from '../../src/errors/index';

describe('PlaceholderValidator', () => {
  let validator: PlaceholderValidator;
  let constraints: ValidationConstraints;

  beforeEach(() => {
    constraints = {
      minWidth: 1,
      maxWidth: 10000,
      minHeight: 1,
      maxHeight: 10000,
      supportedProviders: ['placehold', 'lorem-picsum'],
    };
    validator = new PlaceholderValidator(constraints);
  });

  describe('validateParams', () => {
    it('should validate valid parameters successfully', () => {
      const validParams = {
        provider: 'placehold' as Provider,
        width: 300,
        height: 200,
      };

      expect(() => validator.validateParams(validParams)).not.toThrow();
    });

    it('should throw ValidationError for null params', () => {
      expect(() => validator.validateParams(null as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for undefined params', () => {
      expect(() => validator.validateParams(undefined as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-object params', () => {
      expect(() => validator.validateParams('string' as any)).toThrow(ValidationError);
    });

    it('should validate all supported providers', () => {
      const providers: Provider[] = ['placehold', 'lorem-picsum'];

      providers.forEach(provider => {
        const params = { provider, width: 100, height: 100 };
        expect(() => validator.validateParams(params)).not.toThrow();
      });
    });
  });

  describe('provider validation', () => {
    it('should throw ValidationError for null provider', () => {
      const params = {
        provider: null as any,
        width: 100,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty string provider', () => {
      const params = {
        provider: '' as Provider,
        width: 100,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ProviderError for unsupported provider', () => {
      const params = {
        provider: 'unsupported-provider' as Provider,
        width: 100,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ProviderError);
    });

    it('should include available providers in error message', () => {
      const params = {
        provider: 'invalid' as Provider,
        width: 100,
        height: 100,
      };

      try {
        validator.validateParams(params);
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderError);
        expect((error as ProviderError).message).toContain('placehold');
        expect((error as ProviderError).message).toContain('lorem-picsum');
      }
    });
  });

  describe('width validation', () => {
    it('should throw ValidationError for non-number width', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 'not-a-number' as any,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for NaN width', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: NaN,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for float width', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100.5,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for width below minimum', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 0,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for width above maximum', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 10001,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should accept minimum valid width', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 1,
        height: 100,
      };

      expect(() => validator.validateParams(params)).not.toThrow();
    });

    it('should accept maximum valid width', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 10000,
        height: 100,
      };

      expect(() => validator.validateParams(params)).not.toThrow();
    });
  });

  describe('height validation', () => {
    it('should throw ValidationError for non-number height', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 'not-a-number' as any,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for NaN height', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: NaN,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for float height', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 100.5,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for height below minimum', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 0,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should throw ValidationError for height above maximum', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 10001,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });

    it('should accept minimum valid height', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 1,
      };

      expect(() => validator.validateParams(params)).not.toThrow();
    });

    it('should accept maximum valid height', () => {
      const params = {
        provider: 'placehold' as Provider,
        width: 100,
        height: 10000,
      };

      expect(() => validator.validateParams(params)).not.toThrow();
    });
  });

  describe('getConstraints', () => {
    it('should return a copy of constraints', () => {
      const returned = validator.getConstraints();

      expect(returned).toEqual(constraints);
      expect(returned).not.toBe(constraints); // Should be a copy
    });
  });

  describe('updateConstraints', () => {
    it('should update constraints partially', () => {
      const newConstraints = { maxWidth: 5000 };

      validator.updateConstraints(newConstraints);

      const updatedConstraints = validator.getConstraints();
      expect(updatedConstraints.maxWidth).toBe(5000);
      expect(updatedConstraints.minWidth).toBe(constraints.minWidth); // Unchanged
    });

    it('should validate with updated constraints', () => {
      validator.updateConstraints({ maxWidth: 500 });

      const params = {
        provider: 'placehold' as Provider,
        width: 600,
        height: 100,
      };

      expect(() => validator.validateParams(params)).toThrow(ValidationError);
    });
  });
});
