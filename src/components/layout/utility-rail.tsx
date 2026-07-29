import { useVaultStore } from '../../stores/vault-store';

export function UtilityRail() {
  const readOnlySession = useVaultStore((state) => state.readOnlySession);

  if (!readOnlySession) return null;

  return (
    <aside className="read-only-context" aria-label="Estado da fixture KDBX">
      <strong>Leitura isolada</strong>
      <span>Metadados disponíveis; segredos e escrita permanecem no núcleo Rust.</span>
    </aside>
  );
}
