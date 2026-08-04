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

export type RandomSource = () => number;

const UINT32_RANGE = 0x1_0000_0000;
const UINT32_MAX = UINT32_RANGE - 1;

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

export const createCryptoRandomSource = (): RandomSource => {
  const values = new Uint32Array(32);
  let offset = values.length;

  return () => {
    if (offset >= values.length) {
      crypto.getRandomValues(values);
      offset = 0;
    }
    const value = values[offset];
    offset += 1;
    if (value === undefined) throw new Error('Falha ao obter aleatoriedade da plataforma.');
    return value;
  };
};

export const randomIndex = (upperBound: number, source: RandomSource): number => {
  if (!Number.isSafeInteger(upperBound) || upperBound < 1 || upperBound > UINT32_RANGE) {
    throw new Error('Limite aleatório inválido.');
  }

  const acceptedRange = Math.floor(UINT32_RANGE / upperBound) * upperBound;
  for (;;) {
    const value = source();
    if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
      throw new Error('A fonte aleatória retornou um valor inválido.');
    }
    if (value < acceptedRange) return value % upperBound;
  }
};

const shuffle = (characters: string[], source: RandomSource): void => {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, source);
    const current = characters[index] ?? '';
    characters[index] = characters[swapIndex] ?? '';
    characters[swapIndex] = current;
  }
};

export const generatePassword = (
  options: PasswordOptions,
  source: RandomSource = createCryptoRandomSource(),
): string => {
  const enabledSets = Object.entries(characterSets)
    .filter(([key]) => options[key as keyof typeof characterSets])
    .map(([, value]) => value);
  const pool = enabledSets.join('');
  if (!pool) throw new Error('Selecione ao menos um conjunto de caracteres.');
  if (options.length < 8 || options.length > 64) {
    throw new Error('O comprimento deve ficar entre 8 e 64 caracteres.');
  }

  const characters = enabledSets.map((set) => set[randomIndex(set.length, source)] ?? '');
  while (characters.length < options.length) {
    characters.push(pool[randomIndex(pool.length, source)] ?? '');
  }
  shuffle(characters, source);

  return characters.join('');
};

export const generatePassphrase = (
  options: PassphraseOptions,
  source: RandomSource = createCryptoRandomSource(),
): string => {
  if (options.wordCount < 3 || options.wordCount > 8) {
    throw new Error('A frase deve ter entre 3 e 8 palavras.');
  }

  const words = Array.from({ length: options.wordCount }, () => {
    const word = passphraseWords[randomIndex(passphraseWords.length, source)] ?? passphraseWords[0];
    return options.capitalize
      ? `${word[0]?.toLocaleUpperCase('pt-BR') ?? ''}${word.slice(1)}`
      : word;
  });

  if (options.includeNumber) {
    words.push(String(randomIndex(100, source)).padStart(2, '0'));
  }

  return words.join(options.separator);
};

export const estimatePasswordEntropy = (options: PasswordOptions): number => {
  const poolSize = buildCharacterPool(options).length;
  return poolSize ? Math.round(options.length * Math.log2(poolSize)) : 0;
};

export const estimatePassphraseEntropy = (options: PassphraseOptions): number =>
  Math.round(
    options.wordCount * Math.log2(passphraseWords.length) + (options.includeNumber ? 6.64 : 0),
  );

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
