import { API_BASE_URL } from '../../../core/config/api';
import { ApiClientError, requestJson } from '../../../core/network/api-client';
import type { Moodboard, Source, Version, ExportArtifact, Decision, Instruction } from '../types/moodboard.types';
const boardPath = (project: string, board: string) => `${API_BASE_URL}/projects/${encodeURIComponent(project)}/moodboards/${encodeURIComponent(board)}`;
export const sourceUrl = (project: string, board: string, source: string, preview = true) =>
  `${boardPath(project, board)}/sources/${encodeURIComponent(source)}/file?preview=${preview}`;
export const exportUrl = (project: string, board: string, id: string) => `${boardPath(project, board)}/exports/${encodeURIComponent(id)}`;
const json = (method: string, body: unknown, key?: string): RequestInit => ({ method, body: JSON.stringify(body),
  headers: key ? { 'Idempotency-Key': key } : undefined });
export const newKey = () => crypto.randomUUID();
export function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.code === 'ai_not_configured') return 'Layanan analisis belum aktif. Minta pengelola workspace menghubungkan layanan AI.';
    if (error.code === 'stale_revision') return 'Data telah berubah. Muat ulang sebelum menyimpan. Perubahan Anda masih ada di form.';
    if (error.isNetworkError) return 'Workspace tidak dapat dihubungi. Periksa koneksi lalu coba lagi.';
    return error.message + (error.fields.length ? ' ' + error.fields.map(f => `${f.field}: ${f.message}`).join('; ') : '');
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.';
}
export const moodboardsApi = {
  health: () => requestJson<{ status: string; ai_configured: boolean }>(`${API_BASE_URL}/health`),
  list: (project: string, archived = false, offset = 0) => requestJson<{items: Moodboard[]; total: number; limit: number; offset: number}>(`${API_BASE_URL}/projects/${encodeURIComponent(project)}/moodboards?archived=${archived}&limit=20&offset=${offset}`),
  get: (project: string, board: string, signal?: AbortSignal) => requestJson<Moodboard>(boardPath(project, board), { signal }),
  create: (project: string, body: { title: string; context: string; intended_use: string }) =>
    requestJson<Moodboard>(`${API_BASE_URL}/projects/${encodeURIComponent(project)}/moodboards`, json('POST', body)),
  update: (project: string, board: string, body: unknown) => requestJson<Moodboard>(boardPath(project, board), json('PATCH', body)),
  upload: (project: string, board: string, revision: number, files: File[]) => {
    const form = new FormData(); form.append('revision', String(revision)); files.forEach(file => form.append('files', file));
    return requestJson<{ revision: number; items: { filename: string; status: string; message?: string; source?: Source }[] }>(
      boardPath(project, board) + '/sources', { method: 'POST', body: form });
  },
  updateSource: (project: string, board: string, source: string, body: unknown) =>
    requestJson<{ revision: number; source: Source }>(boardPath(project, board) + `/sources/${encodeURIComponent(source)}`, json('PATCH', body)),
  versions: (project: string, board: string, signal?: AbortSignal) => requestJson<{ items: Version[] }>(boardPath(project, board) + '/versions', { signal }),
  version: (project: string, board: string, version: string, signal?: AbortSignal) => requestJson<Version>(boardPath(project, board) + `/versions/${version}`, { signal }),
  analyze: (project: string, board: string, revision: number, key: string) => requestJson<Version>(boardPath(project, board) + '/analyses', json('POST', { revision }, key)),
  jobAction: (project: string, board: string, version: string, action: 'retry' | 'cancel') =>
    requestJson<Version>(boardPath(project, board) + `/analyses/${version}/${action}`, { method: 'POST' }),
  review: (project: string, board: string, version: string, body: { revision: number; decisions: Decision[]; conflict_resolutions: Record<string, string>; instructions: Instruction[] }) =>
    requestJson<Version>(boardPath(project, board) + `/versions/${version}/review`, json('PATCH', body)),
  approve: (project: string, board: string, version: string, revision: number) =>
    requestJson<Version>(boardPath(project, board) + `/versions/${version}/approve`, json('POST', { revision })),
  export: (project: string, board: string, version: string, language: 'id' | 'en', key: string) =>
    requestJson<ExportArtifact>(boardPath(project, board) + `/versions/${version}/exports`, json('POST', { language }, key)),
  confirmExport: (project: string, board: string, id: string) => requestJson<ExportArtifact>(boardPath(project, board) + `/exports/${id}/confirm`, { method: 'POST' }),
};

