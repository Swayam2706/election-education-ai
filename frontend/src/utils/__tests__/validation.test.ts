import {
  isValidEmail,
  isValidPassword,
  isValidName,
  getPasswordStrength,
  isEmpty,
  isRequired,
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates strong password', () => {
      expect(isValidPassword('Test@1234')).toBe(true);
      expect(isValidPassword('MyP@ssw0rd')).toBe(true);
    });

    it('rejects weak password', () => {
      expect(isValidPassword('weak')).toBe(false);
      expect(isValidPassword('12345678')).toBe(false);
      expect(isValidPassword('NoSpecial1')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('validates correct name', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName("O'Brien")).toBe(true);
    });

    it('rejects invalid name', () => {
      expect(isValidName('A')).toBe(false);
      expect(isValidName('Name123')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('returns weak for simple password', () => {
      const result = getPasswordStrength('simple');
      expect(result.level).toBe('weak');
    });

    it('returns strong for complex password', () => {
      const result = getPasswordStrength('MyP@ssw0rd123!');
      expect(result.level).toBe('strong');
    });
  });

  describe('isEmpty', () => {
    it('detects empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('detects non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('validates required fields', () => {
      expect(isRequired('value')).toBe(true);
      expect(isRequired('')).toBe(false);
      expect(isRequired(null)).toBe(false);
    });
  });
});
