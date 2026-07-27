import type { PasswordStrength } from '../entities/entry';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const characterSets = {
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%&*+-=?',
} as const;

export const buildCharacterPool = (options: PasswordOptions): string =>
  Object.entries(characterSets)
    .filter(([key]) => options[key as keyof typeof characterSets])
    .map(([, value]) => value)
    .join('');

export const generatePassword = (options: PasswordOptions, randomValues: Uint32Array): string => {
  const pool = buildCharacterPool(options);
  if (!pool) throw new Error('Selecione ao menos um conjunto de caracteres.');
  if (options.length < 8 || options.length > 64) {
    throw new Error('O comprimento deve ficar entre 8 e 64 caracteres.');
  }
  if (randomValues.length < options.length) {
    throw new Error('Valores aleatórios insuficientes.');
  }

  return Array.from({ length: options.length }, (_, index) => {
    const randomValue = randomValues[index] ?? 0;
    return pool[randomValue % pool.length] ?? '';
  }).join('');
};

export const evaluatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 18) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, level: 'weak', label: 'Fraca' };
  if (score === 2) return { score: 2, level: 'fair', label: 'Razoável' };
  if (score <= 4) return { score: 3, level: 'good', label: 'Boa' };
  return { score: 4, level: 'strong', label: 'Forte' };
};
