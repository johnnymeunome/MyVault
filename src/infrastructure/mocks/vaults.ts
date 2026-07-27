import type { Vault, VaultGroup } from '../../domain/entities/vault';

export const mockVaults: Vault[] = [
  { id: 'personal', name: 'Pessoal', fileName: 'Pessoal.kdbx', color: 'indigo', entryCount: 8 },
  { id: 'work', name: 'Trabalho', fileName: 'Trabalho.kdbx', color: 'emerald', entryCount: 3 },
];

export const mockGroups: VaultGroup[] = [
  { id: 'personal-root', vaultId: 'personal', name: 'Pessoal' },
  { id: 'work-root', vaultId: 'work', name: 'Trabalho' },
];
