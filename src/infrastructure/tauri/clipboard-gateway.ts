export interface ClipboardGateway {
  write(value: string): Promise<void>;
  clear(): Promise<void>;
}

export const browserClipboardGateway: ClipboardGateway = {
  async write(value: string) {
    await navigator.clipboard.writeText(value);
  },
  async clear() {
    await navigator.clipboard.writeText('');
  },
};
