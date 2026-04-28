import {
  formatDate,
  formatNumber,
  formatFileSize,
  truncateText,
  capitalize,
  toSlug,
  pluralize,
} from '../formatters';

describe('Formatter Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });
  });

  describe('formatNumber', () => {
    it('formats number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs truncation';
      expect(truncateText(text, 20)).toBe('This is a very long ...');
    });

    it('does not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 20)).toBe('Short');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });
  });

  describe('toSlug', () => {
    it('converts to URL-friendly slug', () => {
      expect(toSlug('Hello World')).toBe('hello-world');
      expect(toSlug('Test & Example')).toBe('test-example');
    });
  });

  describe('pluralize', () => {
    it('pluralizes correctly', () => {
      expect(pluralize(1, 'item')).toBe('item');
      expect(pluralize(2, 'item')).toBe('items');
      expect(pluralize(0, 'item')).toBe('items');
    });
  });
});
