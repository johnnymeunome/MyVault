import { describe, expect, it } from 'vitest';
import { buildCharacterPool, evaluatePasswordStrength, generatePassword } from './password';

describe('password rules', () => {
  it('builds a pool only from enabled character sets', () => {
    const pool = buildCharacterPool({
      length: 12,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    });
    expect(pool).toBe('23456789');
  });

  it('generates a deterministic password from injected values', () => {
    const password = generatePassword(
      { length: 8, uppercase: false, lowercase: false, numbers: true, symbols: false },
      new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7]),
    );
    expect(password).toBe('23456789');
  });

  it('rejects an empty pool', () => {
    expect(() =>
      generatePassword(
        { length: 12, uppercase: false, lowercase: false, numbers: false, symbols: false },
        new Uint32Array(12),
      ),
    ).toThrow('Selecione ao menos um conjunto');
  });

  it('rates longer mixed passwords more strongly', () => {
    expect(evaluatePasswordStrength('abc').level).toBe('weak');
    expect(evaluatePasswordStrength('Demonstracao-Longa-42!').level).toBe('strong');
  });
});
