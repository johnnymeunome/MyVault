import { describe, expect, it } from 'vitest';
import {
  buildCharacterPool,
  estimatePassphraseEntropy,
  estimatePasswordEntropy,
  evaluatePasswordStrength,
  generatePassphrase,
  generatePassword,
} from './password';

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

  it('generates a deterministic passphrase from injected values', () => {
    const phrase = generatePassphrase(
      { wordCount: 3, separator: '-', capitalize: true, includeNumber: true },
      new Uint32Array([0, 1, 2, 42]),
    );
    expect(phrase).toBe('Acorde-Agora-Alameda-42');
  });

  it('estimates entropy for passwords and passphrases', () => {
    expect(
      estimatePasswordEntropy({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      }),
    ).toBeGreaterThan(100);
    expect(
      estimatePassphraseEntropy({
        wordCount: 5,
        separator: '-',
        capitalize: false,
        includeNumber: false,
      }),
    ).toBeGreaterThan(25);
  });
});
