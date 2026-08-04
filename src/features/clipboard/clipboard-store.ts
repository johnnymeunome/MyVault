import { create } from 'zustand';
import {
  browserClipboardGateway,
  type ClipboardGateway,
  type ClipboardReceipt,
} from '../../infrastructure/tauri/clipboard-gateway';

export interface ClipboardState {
  label: string | null;
  secondsRemaining: number;
  copy: (value: string, label: string) => Promise<void>;
  reset: () => void;
}

export const createClipboardStore = (gateway: ClipboardGateway) => {
  let countdown: number | undefined;
  let receipt: ClipboardReceipt | undefined;
  let operation = 0;
  let writeQueue = Promise.resolve();

  const stopCountdown = () => {
    if (countdown !== undefined) window.clearInterval(countdown);
    countdown = undefined;
  };

  const clearTrackedValue = () => {
    const trackedReceipt = receipt;
    receipt = undefined;
    if (trackedReceipt) {
      void gateway.clearIfUnchanged(trackedReceipt).catch(() => undefined);
    }
  };

  return create<ClipboardState>((set) => ({
    label: null,
    secondsRemaining: 0,
    copy: async (value, label) => {
      const currentOperation = ++operation;
      const write = writeQueue.then(() => gateway.write(value));
      writeQueue = write.then(
        () => undefined,
        () => undefined,
      );
      const nextReceipt = await write;

      if (currentOperation !== operation) {
        void gateway.clearIfUnchanged(nextReceipt).catch(() => undefined);
        return;
      }

      stopCountdown();
      receipt = nextReceipt;
      set({ label, secondsRemaining: 15 });
      countdown = window.setInterval(() => {
        set((state) => {
          if (state.secondsRemaining <= 1) {
            stopCountdown();
            clearTrackedValue();
            return { label: null, secondsRemaining: 0 };
          }
          return { secondsRemaining: state.secondsRemaining - 1 };
        });
      }, 1000);
    },
    reset: () => {
      operation += 1;
      stopCountdown();
      clearTrackedValue();
      set({ label: null, secondsRemaining: 0 });
    },
  }));
};

export const useClipboardStore = createClipboardStore(browserClipboardGateway);
