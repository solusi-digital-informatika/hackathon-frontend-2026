import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../core/config/api';
import { shotsApi } from '../api/shots-api';
import type { ShotImage } from '../types/shot.types';

export function shotImageUrl(image: ShotImage) {
  return image.url ? `${API_BASE_URL}${image.url}` : '';
}

export function imageError(code: string | null) {
  const messages: Record<string, string> = {
    image_output_missing: 'Model yang dipilih tidak mengembalikan gambar. Periksa dukungan output gambar pada provider.',
    image_provider_tool_error: 'Model gagal menjalankan tool gambar (malformed_function_call). Periksa konfigurasi model di provider.',
    image_provider_blocked: 'Provider menolak pembuatan gambar untuk konten ini. Tinjau detail shot.',
    image_request_rejected: 'Provider menolak permintaan gambar. Periksa model dan API key.',
    gemini_not_configured: 'GEMINI_API_KEY belum tersedia. Ikuti setup pada User Manual.',
    image_access_denied: 'Key atau akun tidak memiliki akses ke model gambar (401/403). Periksa setup pada User Manual.',
    image_approval_changed: 'Versi aktif berubah. Hasil lama tidak diterapkan.',
    image_timeout: 'Provider melewati batas waktu. Coba lagi.',
    image_rate_limited: 'Batas request provider tercapai. Coba lagi nanti.',
    image_interrupted: 'Proses terhenti saat backend dimuat ulang. Coba lagi.',
  };
  return messages[code || ''] || 'Gambar gagal dibuat. Silakan coba lagi.';
}

export function useShotImages(projectId: string) {
  const [state, setState] = useState<{ projectId: string; items: ShotImage[] }>({ projectId, items: [] });
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try { const response = await shotsApi.getImages(projectId); setState({ projectId, items: response.items }); setError(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load images'); }
  }, [projectId]);
  useEffect(() => {
    let alive = true;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await shotsApi.getImages(projectId);
        if (!alive) return;
        setState({ projectId, items: response.items }); setError(null);
      } catch (err) { if (alive) setError(err instanceof Error ? err.message : 'Unable to load images'); }
      if (alive) timeout = setTimeout(poll, 3000);
    };
    void poll();
    return () => { alive = false; clearTimeout(timeout); };
  }, [projectId]);
  return { images: state.projectId === projectId ? state.items : [], reload, error };
}
