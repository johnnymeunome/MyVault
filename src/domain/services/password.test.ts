import { describe, expect, it } from 'vitest';
import {
  buildCharacterPool,
  estimatePassphraseEntropy,
  estimatePasswordEntropy,
  evaluatePasswordStrength,
  generatePassphrase,
  generatePassword,
  randomIndex,
  type RandomSource,
} from './password';

const sourceFrom = (values: number[]): RandomSource => {
  let index = 0;
  return () => {
    const value = values[index];
    index += 1;
    if (value === undefined) throw new Error('Valores aleatórios insuficientes.');
    return value;
  };
};

const seededSource = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};

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
      sourceFrom([0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1]),
    );
    expect(password).toBe('23456789');
  });

  it('guarantees every selected character set', () => {
    const source = seededSource(0x6d_79_56_61);
    for (let sample = 0; sample < 128; sample += 1) {
      const password = generatePassword(
        { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true },
        source,
      );
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%&*+\-=?]/);
    }
  });

  it('rejects the modulo tail and has a balanced deterministic sanity sample', () => {
    expect(randomIndex(3, sourceFrom([0xffff_ffff, 2]))).toBe(2);

    const source = seededSource(0x9e_37_79_b9);
    const counts = [0, 0, 0];
    for (let sample = 0; sample < 30_000; sample += 1) {
      const index = randomIndex(3, source);
      counts[index] = (counts[index] ?? 0) + 1;
    }
    for (const count of counts) expect(Math.abs(count - 10_000)).toBeLessThan(400);
  });

  it('rejects an empty pool', () => {
    expect(() =>
      generatePassword(
        { length: 12, uppercase: false, lowercase: false, numbers: false, symbols: false },
        sourceFrom([]),
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
      sourceFrom([0, 1, 2, 42]),
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
