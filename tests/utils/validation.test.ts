import { describe, it, expect } from 'vitest';
import { validateZikrName, isDuplicateZikrName, validateCount } from '../../src/utils/validation';

describe('validateZikrName', () => {
  it('accepts a valid name', () => {
    expect(validateZikrName('SubhanAllah')).toBe('');
  });

  it('rejects empty string', () => {
    expect(validateZikrName('')).not.toBe('');
  });

  it('rejects whitespace-only string', () => {
    expect(validateZikrName('   ')).not.toBe('');
  });

  it('rejects names longer than 50 characters', () => {
    expect(validateZikrName('A'.repeat(51))).not.toBe('');
  });

  it('accepts names exactly 50 characters', () => {
    expect(validateZikrName('A'.repeat(50))).toBe('');
  });

  it('rejects names with numbers', () => {
    expect(validateZikrName('Zikr123')).not.toBe('');
  });

  it('rejects names with special characters', () => {
    expect(validateZikrName('SubhanAllah!')).not.toBe('');
  });

  it('accepts names with hyphens and spaces', () => {
    expect(validateZikrName('La ilaha ill-Allah')).toBe('');
  });
});

describe('isDuplicateZikrName', () => {
  it('detects exact duplicate', () => {
    expect(isDuplicateZikrName('SubhanAllah', ['SubhanAllah', 'Alhamdulillah'])).toBe(true);
  });

  it('detects case-insensitive duplicate', () => {
    expect(isDuplicateZikrName('subhanallah', ['SubhanAllah'])).toBe(true);
  });

  it('returns false when no duplicate exists', () => {
    expect(isDuplicateZikrName('AllahuAkbar', ['SubhanAllah', 'Alhamdulillah'])).toBe(false);
  });

  it('returns false for empty list', () => {
    expect(isDuplicateZikrName('SubhanAllah', [])).toBe(false);
  });
});

describe('validateCount', () => {
  it('accepts count of 1', () => {
    expect(validateCount(1)).toBe('');
  });

  it('accepts count of 10000', () => {
    expect(validateCount(10000)).toBe('');
  });

  it('rejects zero', () => {
    expect(validateCount(0)).not.toBe('');
  });

  it('rejects negative count', () => {
    expect(validateCount(-1)).not.toBe('');
  });

  it('rejects count exceeding 10000', () => {
    expect(validateCount(10001)).not.toBe('');
  });

  it('rejects NaN', () => {
    expect(validateCount(NaN)).not.toBe('');
  });
});
