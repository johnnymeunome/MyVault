import type { PasswordStrength } from '../entities/entry';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: '-' | ' ' | '_';
  capitalize: boolean;
  includeNumber: boolean;
}

const characterSets = {
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%&*+-=?',
} as const;

const passphraseWords = [
  'acorde',
  'agora',
  'alameda',
  'ambar',
  'arco',
  'areia',
  'aurora',
  'bosque',
  'brisa',
  'campo',
  'cedro',
  'cifra',
  'claro',
  'delta',
  'duna',
  'eco',
  'estrela',
  'farol',
  'flora',
  'fluxo',
  'gelo',
  'harpa',
  'ilha',
  'jade',
  'lago',
  'leste',
  'lunar',
  'mapa',
  'marfim',
  'nexo',
  'norte',
  'nuvem',
  'onda',
  'orbe',
  'pedra',
  'piano',
  'ponte',
  'porto',
  'prisma',
  'pulso',
  'raiz',
  'rio',
  'rumo',
  'safira',
  'serra',
  'sinal',
  'sol',
  'sombra',
  'trama',
  'trilha',
  'vale',
  'vento',
  'verde',
  'vertice',
  'viga',
  'violeta',
  'vista',
  'zefiro',
] as const;

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

export const generatePassphrase = (
  options: PassphraseOptions,
  randomValues: Uint32Array,
): string => {
  if (options.wordCount < 3 || options.wordCount > 8) {
    throw new Error('A frase deve ter entre 3 e 8 palavras.');
  }
  const requiredValues = options.wordCount + (options.includeNumber ? 1 : 0);
  if (randomValues.length < requiredValues) {
    throw new Error('Valores aleatórios insuficientes.');
  }

  const words = Array.from({ length: options.wordCount }, (_, index) => {
    const randomValue = randomValues[index] ?? 0;
    const word = passphraseWords[randomValue % passphraseWords.length] ?? passphraseWords[0];
    return options.capitalize ? `${word[0]?.toLocaleUpperCase('pt-BR') ?? ''}${word.slice(1)}` : word;
  });

  if (options.includeNumber) {
    const value = randomValues[options.wordCount] ?? 0;
    words.push(String(value % 100).padStart(2, '0'));
  }

  return words.join(options.separator);
};

export const estimatePasswordEntropy = (options: PasswordOptions): number => {
  const poolSize = buildCharacterPool(options).length;
  return poolSize ? Math.round(options.length * Math.log2(poolSize)) : 0;
};

export const estimatePassphraseEntropy = (options: PassphraseOptions): number =>
  Math.round(options.wordCount * Math.log2(passphraseWords.length) + (options.includeNumber ? 6.64 : 0));

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
