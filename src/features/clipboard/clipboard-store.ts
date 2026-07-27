import { create } from 'zustand';
import { browserClipboardGateway } from '../../infrastructure/tauri/clipboard-gateway';

interface ClipboardState {
  label: string | null;
  secondsRemaining: number;
  copy: (value: string, label: string) => Promise<void>;
  reset: () => void;
}

let countdown: number | undefined;

const stopCountdown = () => {
  if (countdown !== undefined) window.clearInterval(countdown);
  countdown = undefined;
};

export const useClipboardStore = create<ClipboardState>((set) => ({
  label: null,
  secondsRemaining: 0,
  copy: async (value, label) => {
    await browserClipboardGateway.write(value);
    stopCountdown();
    set({ label, secondsRemaining: 15 });
    countdown = window.setInterval(() => {
      set((state) => {
        if (state.secondsRemaining <= 1) {
          stopCountdown();
          void browserClipboardGateway.clear().catch(() => undefined);
          return { label: null, secondsRemaining: 0 };
        }
        return { secondsRemaining: state.secondsRemaining - 1 };
      });
    }, 1000);
  },
  reset: () => {
    stopCountdown();
    set({ label: null, secondsRemaining: 0 });
  },
}));
