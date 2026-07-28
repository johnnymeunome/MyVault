export interface Vault {
  id: string;
  name: string;
  fileName: string;
  color: 'indigo' | 'emerald' | 'steel';
  entryCount: number;
}

export interface VaultGroup {
  id: string;
  vaultId: string;
  name: string;
  parentId?: string;
  depth?: number;
  icon?: string;
}
