export type ShotStatus = 'draft' | 'in_progress' | 'in_review' | 'approved';

export interface Shot {
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
