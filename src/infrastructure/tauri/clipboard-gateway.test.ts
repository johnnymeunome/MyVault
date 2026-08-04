import { webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { createBrowserClipboardGateway } from './clipboard-gateway';

describe('browser clipboard gateway', () => {
  it('clears only when the clipboard still contains the tracked value', async () => {
    let clipboardValue = '';
    const clipboard = {
      readText: vi.fn(() => Promise.resolve(clipboardValue)),
      writeText: vi.fn((value: string) => {
        clipboardValue = value;
        return Promise.resolve();
      }),
    };
    const gateway = createBrowserClipboardGateway(
      clipboard,
      webcrypto.subtle as unknown as SubtleCrypto,
    );

    const receipt = await gateway.write('valor do MyVault');
    clipboardValue = 'conteúdo copiado por outro aplicativo';

    await expect(gateway.clearIfUnchanged(receipt)).resolves.toBe('changed');
    expect(clipboardValue).toBe('conteúdo copiado por outro aplicativo');

    const currentReceipt = await gateway.write('novo valor do MyVault');
    await expect(gateway.clearIfUnchanged(currentReceipt)).resolves.toBe('cleared');
    expect(clipboardValue).toBe('');
  });

  it('leaves the clipboard untouched when read permission is unavailable', async () => {
    const clipboard = {
      readText: vi.fn(() => Promise.reject(new Error('permission denied'))),
      writeText: vi.fn(() => Promise.resolve()),
    };
    const gateway = createBrowserClipboardGateway(
      clipboard,
      webcrypto.subtle as unknown as SubtleCrypto,
    );
    const receipt = await gateway.write('valor do MyVault');

    await expect(gateway.clearIfUnchanged(receipt)).resolves.toBe('unavailable');
    expect(clipboard.writeText).toHaveBeenCalledTimes(1);
  });
});
