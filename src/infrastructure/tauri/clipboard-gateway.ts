export interface ClipboardReceipt {
  fingerprint: string;
}

export type ClipboardClearResult = 'cleared' | 'changed' | 'unavailable';

export interface ClipboardGateway {
  write(value: string): Promise<ClipboardReceipt>;
  clearIfUnchanged(receipt: ClipboardReceipt): Promise<ClipboardClearResult>;
}

interface ClipboardPort {
  readText(): Promise<string>;
  writeText(value: string): Promise<void>;
}

const fingerprint = async (value: string, subtle: SubtleCrypto): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const createBrowserClipboardGateway = (
  clipboard: ClipboardPort = navigator.clipboard,
  subtle: SubtleCrypto = crypto.subtle,
): ClipboardGateway => ({
  async write(value) {
    const valueFingerprint = await fingerprint(value, subtle);
    await clipboard.writeText(value);
    return { fingerprint: valueFingerprint };
  },
  async clearIfUnchanged(receipt) {
    let currentValue: string;
    try {
      currentValue = await clipboard.readText();
    } catch {
      return 'unavailable';
    }

    if ((await fingerprint(currentValue, subtle)) !== receipt.fingerprint) return 'changed';

    try {
      await clipboard.writeText('');
      return 'cleared';
    } catch {
      return 'unavailable';
    }
  },
});

export const browserClipboardGateway = createBrowserClipboardGateway();
