export type EntryType = 'login' | 'secure-note' | 'card' | 'identity';

export interface Tag {
  id: string;
  label: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}

export interface TotpConfiguration {
  issuer: string;
  accountName: string;
  digits: 6 | 8;
  period: number;
  mockCode: string;
}

interface VaultEntryBase {
  id: string;
  vaultId: string;
  groupId: string;
  type: EntryType;
  title: string;
  notes: string;
  tags: Tag[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  trashedAt?: string;
  accent: string;
}

export interface LoginEntry extends VaultEntryBase {
  type: 'login';
  username: string;
  password: string;
  url: string;
  totp?: TotpConfiguration;
}

export interface SecureNoteEntry extends VaultEntryBase {
  type: 'secure-note';
  content: string;
}

export interface CardEntry extends VaultEntryBase {
  type: 'card';
  cardholderName: string;
  lastFour: string;
  expiresAt: string;
}

export interface IdentityEntry extends VaultEntryBase {
  type: 'identity';
  fullName: string;
  email: string;
}

export type VaultEntry = LoginEntry | SecureNoteEntry | CardEntry | IdentityEntry;

export type LoginEntryInput = Pick<
  LoginEntry,
  'title' | 'username' | 'password' | 'url' | 'notes' | 'favorite'
> & {
  tags: string[];
};
