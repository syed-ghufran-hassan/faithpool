/**
 * Logger Utility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createPerformanceLogger, logTransaction } from '../logger';

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.configure({ minLevel: 'debug', enableConsole: true });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('log levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });
      expect(console.debug).toHaveBeenCalled();
    });
    
    it('should log info messages', () => {
      logger.info('Info message');
      expect(console.info).toHaveBeenCalled();
    });
    
    it('should log warn messages', () => {
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
    });
    
    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Error message', error, { context: 'test' });
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', error);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('log filtering', () => {
    it('should respect min level configuration', () => {
      logger.configure({ minLevel: 'warn' });
      logger.info('Should not log');
      expect(console.info).not.toHaveBeenCalled();
    });
    
    it('should disable console output when configured', () => {
      logger.configure({ enableConsole: false });
      logger.info('Should not log');
      expect(console.info).not.toHaveBeenCalled();
    });
  });
  
  describe('child loggers', () => {
    it('should create child logger with default context', () => {
      const child = logger.child({ component: 'Test' });
      child.info('Test message');
      expect(console.info).toHaveBeenCalled();
    });
  });
});

describe('Performance Logger', () => {
  it('should measure and log operation timing', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    const measure = createPerformanceLogger('test-operation');
    measure.end();
    
    expect(consoleSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
  
  it('should log intermediate steps', () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    
    const measure = createPerformanceLogger('test-operation');
    measure.step('step-1');
    
    expect(consoleSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('Transaction Logger', () => {
  it('should log transaction events', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    logTransaction('create-circle', '0x123...', 'pending', { circleId: 1 });
    
    expect(consoleSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
