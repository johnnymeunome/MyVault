import { invoke, isTauri } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export type KdbxErrorCode =
  | 'CANCELLED'
  | 'FILE_NOT_FOUND'
  | 'FILE_UNREADABLE'
  | 'UNSUPPORTED_VERSION'
  | 'INVALID_KEY'
  | 'INTEGRITY_FAILED'
  | 'FORMAT_INVALID'
  | 'RESOURCE_LIMIT_EXCEEDED'
  | 'INTERNAL';

export interface OpenKdbxRequest {
  path: string;
  password: string;
  keyFilePath?: string;
}

export interface KdbxGroupSummary {
  id: string;
  parentId?: string;
  name: string;
  depth: number;
}

export interface KdbxEntrySummary {
  id: string;
  groupId: string;
  title: string;
  username: string;
  url: string;
  favorite: boolean;
  updatedAt?: string;
}

export interface OpenKdbxResult {
  sessionId: string;
  database: {
    name: string;
    format: string;
    groups: KdbxGroupSummary[];
    entries: KdbxEntrySummary[];
  };
  capabilities: {
    read: true;
    write: false;
    revealSecrets: false;
  };
}

interface PublicKdbxError {
  code?: KdbxErrorCode;
  message?: string;
}

export class KdbxGatewayError extends Error {
  constructor(
    public readonly code: KdbxErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'KdbxGatewayError';
  }
}

export const isDesktopRuntime = () => isTauri();

export async function selectKdbxFile(): Promise<string | null> {
  ensureDesktop();
  return open({
    title: 'Abrir fixture KDBX',
    multiple: false,
    directory: false,
    filters: [{ name: 'KeePass database', extensions: ['kdbx'] }],
  });
}

export async function selectKeyFile(): Promise<string | null> {
  ensureDesktop();
  return open({
    title: 'Selecionar arquivo-chave público da fixture',
    multiple: false,
    directory: false,
  });
}

export async function openKdbxReadOnly(request: OpenKdbxRequest): Promise<OpenKdbxResult> {
  ensureDesktop();
  try {
    return await invoke<OpenKdbxResult>('open_kdbx_read_only', { request });
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function closeKdbxSession(sessionId: string): Promise<void> {
  if (!isDesktopRuntime()) return;
  try {
    await invoke('close_kdbx_session', { request: { sessionId } });
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function clearKdbxSessions(): Promise<void> {
  if (!isDesktopRuntime()) return;
  try {
    await invoke('clear_kdbx_sessions');
  } catch (error) {
    throw normalizeError(error);
  }
}

function ensureDesktop() {
  if (!isDesktopRuntime()) {
    throw new KdbxGatewayError(
      'INTERNAL',
      'A abertura KDBX está disponível somente no aplicativo desktop.',
    );
  }
}

function normalizeError(error: unknown): KdbxGatewayError {
  if (error instanceof KdbxGatewayError) return error;
  if (typeof error === 'object' && error !== null) {
    const candidate = error as PublicKdbxError;
    if (candidate.code && candidate.message) {
      return new KdbxGatewayError(candidate.code, candidate.message);
    }
  }
  return new KdbxGatewayError('INTERNAL', 'O MyVault não conseguiu concluir a abertura.');
}
