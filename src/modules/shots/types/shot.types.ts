export type ShotStatus = 'draft' | 'in_progress' | 'in_review' | 'approved';
export interface ShotImageConfig { provider: string; mode: string; model: string; configured: boolean; missing_key: string | null }
export interface ShotImage { shot_id: string; revision_id: string; version_number: number; job_id: string; status: 'queued' | 'running' | 'succeeded' | 'failed' | 'stale'; url: string | null; error_code: string | null }
export interface ShotRevision { id: string; shot_id: string; version_number: number; parent_id: string | null; title: string; description: string; details: Record<string, string>; change_note: string; status: 'baseline' | 'pending_review' | 'approved' | 'rejected'; created_at: string; reviewed_at: string | null; review_note: string }
export interface ShotRevisionHistory { active_revision_id: string; items: (ShotRevision & { can_generate_image?: boolean })[] }

export interface Shot {
  revision_summary?: { version: number; status: string; pending: number; protected?: boolean };
  generation_details?: Record<string, string> | null;
  id: string;
  project_id: string;
  sequence_order: number;
  title: string;
  description?: string | null;
  status: ShotStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateShotPayload {
  title: string;
  description?: string | null;
  sequence_order?: number;
}

export interface UpdateShotPayload {
  title?: string;
  description?: string | null;
  status?: ShotStatus;
  sequence_order?: number;
}

export interface ShotsListResponse {
  items: Shot[];
  total: number;
}
