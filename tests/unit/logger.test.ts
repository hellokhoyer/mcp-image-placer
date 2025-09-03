/**
 * Tests for logger utility
 */

import { createLogger, logger } from '../../src/utils/logger.js';

describe('Logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('createLogger', () => {
    it('should create logger with default settings', () => {
      const testLogger = createLogger();

      testLogger.info('Test message');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('INFO: Test message'));
    });

    it('should create logger with custom log level', () => {
      const testLogger = createLogger('error');

      testLogger.info('This should not appear');
      testLogger.error('This should appear');

      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should create logger with custom environment', () => {
      const testLogger = createLogger('info', 'production');

      testLogger.info('Test message', { key: 'value' });

      expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringMatching(/^{.*"level":"info".*}$/));
    });
  });

  describe('Log Levels', () => {
    it('should respect debug log level', () => {
      const testLogger = createLogger('debug');

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should respect info log level', () => {
      const testLogger = createLogger('info');

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should respect warn log level', () => {
      const testLogger = createLogger('warn');

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should respect error log level', () => {
      const testLogger = createLogger('error');

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Development Environment Formatting', () => {
    let testLogger: ReturnType<typeof createLogger>;

    beforeEach(() => {
      testLogger = createLogger('debug', 'development');
    });

    it('should format debug messages', () => {
      testLogger.debug('Debug message');

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] DEBUG: Debug message/
        )
      );
    });

    it('should format info messages', () => {
      testLogger.info('Info message');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Info message/)
      );
    });

    it('should format warn messages', () => {
      testLogger.warn('Warn message');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] WARN: Warn message/)
      );
    });

    it('should format messages with metadata', () => {
      const meta = { userId: 123, action: 'test' };
      testLogger.info('Message with meta', meta);

      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('INFO: Message with meta');
      expect(logCall).toContain('Meta: {');
      expect(logCall).toContain('"userId": 123');
      expect(logCall).toContain('"action": "test"');
    });

    it('should format error messages with error object', () => {
      const testError = new Error('Test error');
      testLogger.error('Error occurred', testError);

      const logCall = consoleSpy.error.mock.calls[0][0];
      expect(logCall).toContain('ERROR: Error occurred');
      expect(logCall).toContain('Error: Error: Test error');
      expect(logCall).toContain('Stack:');
    });

    it('should format error messages with error and metadata', () => {
      const testError = new Error('Test error');
      const meta = { context: 'test' };
      testLogger.error('Error with meta', testError, meta);

      const logCall = consoleSpy.error.mock.calls[0][0];
      expect(logCall).toContain('ERROR: Error with meta');
      expect(logCall).toContain('Meta: {');
      expect(logCall).toContain('"context": "test"');
      expect(logCall).toContain('Error: Error: Test error');
    });

    it('should handle empty metadata', () => {
      testLogger.info('Message', {});

      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).not.toContain('Meta:');
    });

    it('should handle error without stack trace', () => {
      const testError = new Error('Test error');
      delete testError.stack;
      testLogger.error('Error without stack', testError);

      const logCall = consoleSpy.error.mock.calls[0][0];
      expect(logCall).toContain('Error: Error: Test error');
      expect(logCall).not.toContain('Stack:');
    });
  });

  describe('Production Environment Formatting', () => {
    let testLogger: ReturnType<typeof createLogger>;

    beforeEach(() => {
      testLogger = createLogger('info', 'production');
    });

    it('should format as JSON in production', () => {
      testLogger.info('Production message');

      const logCall = consoleSpy.info.mock.calls[0][0];
      const parsed = JSON.parse(logCall);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Production message');
      expect(parsed.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should include metadata in JSON format', () => {
      const meta = { userId: 456 };
      testLogger.info('Message with meta', meta);

      const logCall = consoleSpy.info.mock.calls[0][0];
      const parsed = JSON.parse(logCall);

      expect(parsed.meta).toEqual(meta);
    });

    it('should include error in JSON format', () => {
      const testError = new Error('Production error');
      testLogger.error('Error in production', testError);

      const logCall = consoleSpy.error.mock.calls[0][0];
      const parsed = JSON.parse(logCall);

      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Production error');
      expect(parsed.error.stack).toBeDefined();
    });
  });

  describe('Default Logger Instance', () => {
    it('should be available as named export', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should work with default settings', () => {
      logger.info('Default logger test');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });
  });
});
