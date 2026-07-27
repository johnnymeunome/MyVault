export interface Vault {
  id: string;
  name: string;
  fileName: string;
  color: 'indigo' | 'emerald';
  entryCount: number;
}

export interface VaultGroup {
  id: string;
  vaultId: string;
  name: string;
  icon?: string;
}
