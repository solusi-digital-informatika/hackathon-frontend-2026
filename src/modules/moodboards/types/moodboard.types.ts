export interface Source {
  id: string; original_filename: string; checksum: string; mime_type: string;
  width: number; height: number; size_bytes: number; label: string; notes: string;
  roles: string[]; roles_confirmed: boolean; included: boolean; sequence_order: number; warnings: string[];
}
export interface Moodboard {
  id: string; project_id: string; title: string; context: string; intended_use: string;
  revision: number; archived: boolean; latest_approved_version_id: string | null;
  created_at: string; updated_at: string; sources?: Source[]; source_count?: number; latest_job_status?: string | null;
}
export interface Reference { id: string; lokasi: string; deskripsi_singkat: string }
export interface HumanSummary {
  status_analisis: string; status_panduan: string; ringkasan_visual: string; referensi: Reference[];
  gaya_utama: { deskripsi: string; ciri_utama: string[]; dasar: string; referensi: string[]; keyakinan: string };
  nuansa: { nama: string; penyebab_visual: string; dasar: string; referensi: string[]; keyakinan: string }[];
  palet_warna: { warna: string; hex_perkiraan: string | null; peran_visual: string; referensi: string[] }[];
  elemen_visual: Record<string, string[]>;
  kelompok_visual: { nama: string; deskripsi: string; referensi: string[] }[];
  panduan_bersama: Record<'gunakan' | 'hindari', { arahan: string; alasan: string; referensi: string[] }[]>;
  perbedaan_atau_konflik: { deskripsi: string; referensi: string[] }[];
  pertanyaan_klarifikasi: string[]; keterbatasan: string[];
}
export type Strength = 'must' | 'prefer' | 'avoid' | 'reference_only';
export type FindingValue = string | Record<string, unknown>;
export interface Finding {
  id: string; path: (string | number)[]; category: string; original_value: FindingValue;
  reviewed_value: FindingValue; referensi: string[]; dasar: string; keyakinan: string;
  review_state: 'pending' | 'accepted' | 'edited' | 'rejected'; strength: Strength; note: string;
}
export interface Decision {
  finding_id: string; decision: 'accepted' | 'edited' | 'rejected';
  value?: FindingValue; strength: Strength; note: string;
}
export interface Instruction { text: string; strength: Strength }
export interface SnapshotSource {
  id: string; prefix: string; original_filename: string; label: string; notes: string;
  roles: string[]; warnings: string[];
}
export interface Version {
  id: string; version_number: number; revision: number; based_on_version_id: string | null;
  review_status: string; job_status: string; stage: string;
  snapshot: { title: string; context: string; intended_use: string; sources: SnapshotSource[] };
  per_source: Record<string, { status: string; result?: HumanSummary; error_code?: string }>;
  original_result: HumanSummary | null; human_summary: HumanSummary | null;
  findings: Finding[]; conflict_resolutions: Record<string, string>; instructions: Instruction[];
  error_code: string | null; created_at: string; approved_at: string | null;
}
export interface ExportArtifact {
  id: string; language: 'id' | 'en'; status: string; filename: string;
  content: string; content_hash: string; created_at: string;
}
export const roles: Record<string, string> = {
  overall: 'Keseluruhan', color: 'Warna', lighting: 'Pencahayaan', composition: 'Komposisi',
  character: 'Karakter', environment: 'Lingkungan', texture_material: 'Tekstur & material',
  typography: 'Tipografi', negative_reference: 'Referensi yang dihindari',
};
export const categories: Record<string, string> = {
  ringkasan_visual: 'Ringkasan visual', gaya_utama: 'Gaya utama', nuansa: 'Nuansa', palet_warna: 'Palet warna',
  elemen_visual: 'Elemen visual', kelompok_visual: 'Kelompok visual', panduan_bersama: 'Panduan visual',
  pertanyaan_klarifikasi: 'Pertanyaan terbuka', keterbatasan: 'Keterbatasan',
  tekstur_dan_material: 'Tekstur & material', pencahayaan: 'Pencahayaan', bentuk_dan_garis: 'Bentuk & garis',
  komposisi_dan_ruang: 'Komposisi & ruang', subjek_dan_latar: 'Subjek & latar', tipografi: 'Tipografi',
};
export const strengths: Record<Strength, string> = {
  must: 'Wajib', prefer: 'Disarankan', avoid: 'Hindari', reference_only: 'Referensi saja',
};
export const isRunning = (version?: Version | null) => !!version && ['queued', 'running'].includes(version.job_status);
export function findingText(value: FindingValue): string {
  if (typeof value === 'string') return value;
  return String(value.arahan || value.deskripsi || value.nama || value.warna || 'Temuan visual');
}
export const dateLabel = (date: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
