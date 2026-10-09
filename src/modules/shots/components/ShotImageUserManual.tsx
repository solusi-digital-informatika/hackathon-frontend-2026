import { useEffect, useState } from 'react';
import { shotsApi } from '../api/shots-api';
import type { ShotImageConfig, ShotImage } from '../types/shot.types';
import { imageError } from '../hooks/useShotImages';

export function ShotImageUserManual({ projectId, issues = [] }: { projectId: string; issues?: ShotImage[] }) {
  const [config, setConfig] = useState<ShotImageConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try { const value = await shotsApi.getImageConfig(projectId); if (alive) setConfig(value); }
      catch (err) { if (alive) setError(err instanceof Error ? err.message : 'Konfigurasi belum dapat dibaca.'); }
    };
    void load();
    return () => { alive = false; };
  }, [projectId]);
  return <details className="shot-image-manual" open={config?.configured === false}>
    <summary>User Manual{config?.configured === false ? ' — Setup gambar belum lengkap' : ''}</summary>
    <h3>Generate gambar storyboard</h3>
    {config && <p>Provider: <strong>{config.provider}</strong> · Model: <code>{config.model}</code> · {config.configured ? 'Konfigurasi tersedia; akses model dan kuota tetap ditentukan provider.' : `Belum tersedia: ${config.missing_key}.`}</p>}
    {error && <p role="status">{error} Muat ulang halaman setelah backend tersedia.</p>}
    {issues.length > 0 && <><h4>Kendala saat ini</h4><ul>{issues.map(image => <li key={image.revision_id}>Shot {image.shot_id} · v{image.version_number}: {imageError(image.error_code)}{image.error_code === 'image_rate_limited' && ' Google/provider mengembalikan HTTP 429. Periksa kuota atau billing akun sebelum retry.'}</li>)}</ul></>}
    <ol>
      <li>Review detail shot, kemudian klik <strong>Approve &amp; Merge</strong>. Versi pertama juga bisa langsung disetujui.</li>
      <li>Klik <strong>Generate Image</strong> pada versi aktif, atau <strong>Generate All Approved Images</strong> untuk seluruh shot approved, termasuk shot tersembunyi.</li>
      <li>Proses berjalan di background. Gambar muncul di kartu dan detail shot setelah selesai. Moodboard approved yang tersedia digunakan sebagai referensi.</li>
      <li>Jika gagal, periksa pesan error. Setelah kendalanya diperbaiki, klik generate kembali untuk retry.</li>
    </ol>
    <h4>Setup Gemini API langsung</h4>
    <p>Buat key di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>, lalu isi di <code>hackathon-backend-2026/.env</code>. Simpan key hanya di backend.</p>
    <pre>{'GEMINI_API_KEY=isi_key_Google_Anda\nAI_IMAGE_API_MODE=gemini\nAI_IMAGE_MODEL=gemini-3.1-flash-image'}</pre>
    <p>Restart backend setelah mengubah .env, kemudian refresh halaman. Key gateway AI sebelumnya tetap dipakai untuk brief/shot dan tidak menggantikan key Gemini.</p>
    <h4>Kendala yang memerlukan tindakan Anda</h4>
    <ul>
      <li>Pembuatan API key, pengaktifan billing, izin model, dan penambahan kuota Google memerlukan akses akun Anda; saya tidak dapat mengurusnya dari workspace ini.</li>
      <li>Uji generate nyata ke Google belum dapat dilakukan jika GEMINI_API_KEY belum tersedia. Tes lokal tidak membuktikan akses model atau kuota akun.</li>
      <li>Error 401/403: periksa key dan akses akun. Error 429: periksa kuota/billing atau tunggu sebelum mencoba lagi.</li>
      <li>Jika versi shot berubah saat gambar diproses, hasil tersebut tidak diterapkan. Generate kembali versi aktif yang sudah approved.</li>
    </ul>
  </details>;
}
