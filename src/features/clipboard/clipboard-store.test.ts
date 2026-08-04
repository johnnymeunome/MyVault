import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ClipboardGateway,
  ClipboardReceipt,
} from '../../infrastructure/tauri/clipboard-gateway';
import { createClipboardStore } from './clipboard-store';

const receipt = (fingerprint: string): ClipboardReceipt => ({ fingerprint });

describe('clipboard lifecycle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('attempts a conditional clear after the countdown', async () => {
    const clearIfUnchanged = vi.fn<ClipboardGateway['clearIfUnchanged']>(() =>
      Promise.resolve('cleared'),
    );
    const gateway: ClipboardGateway = {
      write: vi.fn(() => Promise.resolve(receipt('tracked'))),
      clearIfUnchanged,
    };
    const store = createClipboardStore(gateway);

    await store.getState().copy('demo', 'Senha gerada');
    expect(store.getState().secondsRemaining).toBe(15);

    await vi.advanceTimersByTimeAsync(15_000);
    expect(clearIfUnchanged).toHaveBeenCalledWith(receipt('tracked'));
    expect(store.getState().label).toBeNull();
    expect(store.getState().secondsRemaining).toBe(0);
  });

  it('attempts an immediate conditional clear on reset', async () => {
    const clearIfUnchanged = vi.fn<ClipboardGateway['clearIfUnchanged']>(() =>
      Promise.resolve('changed'),
    );
    const gateway: ClipboardGateway = {
      write: vi.fn(() => Promise.resolve(receipt('tracked'))),
      clearIfUnchanged,
    };
    const store = createClipboardStore(gateway);

    await store.getState().copy('demo', 'Senha gerada');
    store.getState().reset();
    await Promise.resolve();

    expect(clearIfUnchanged).toHaveBeenCalledWith(receipt('tracked'));
    expect(store.getState().secondsRemaining).toBe(0);
  });

  it('cleans a stale write that resolves after reset without starting a timer', async () => {
    let resolveWrite: ((value: ClipboardReceipt) => void) | undefined;
    const clearIfUnchanged = vi.fn<ClipboardGateway['clearIfUnchanged']>(() =>
      Promise.resolve('cleared'),
    );
    const gateway: ClipboardGateway = {
      write: vi.fn(
        () =>
          new Promise<ClipboardReceipt>((resolve) => {
            resolveWrite = resolve;
          }),
      ),
      clearIfUnchanged,
    };
    const store = createClipboardStore(gateway);

    const copying = store.getState().copy('demo', 'Senha gerada');
    await Promise.resolve();
    store.getState().reset();
    resolveWrite?.(receipt('stale'));
    await copying;

    expect(clearIfUnchanged).toHaveBeenCalledWith(receipt('stale'));
    expect(store.getState().secondsRemaining).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
