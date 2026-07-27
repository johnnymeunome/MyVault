import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect } from 'react';
import { useVaultStore } from '../../stores/vault-store';

export function Toast() {
  const toast = useVaultStore((state) => state.toast);
  const clearToast = useVaultStore((state) => state.clearToast);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(clearToast, 3500);
    return () => window.clearTimeout(timeout);
  }, [clearToast, toast]);
  if (!toast) return null;
  const Icon =
    toast.tone === 'success' ? CheckCircle2 : toast.tone === 'danger' ? TriangleAlert : Info;
  return (
    <div className="toast" data-tone={toast.tone} role="status">
      <Icon size={18} />
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.description}</p>
      </div>
      <button onClick={clearToast} aria-label="Fechar notificação">
        <X size={15} />
      </button>
    </div>
  );
}
