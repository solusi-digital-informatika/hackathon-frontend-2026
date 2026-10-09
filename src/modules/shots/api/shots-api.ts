import { API_BASE_URL } from '../../../core/config/api';
import { requestStructuredJson } from '../../../core/network/structured-client';
import type { ShotRevisionHistory } from '../types/shot.types';
import type { ShotImage, ShotImageConfig } from '../types/shot.types';
import type {
  CreateShotPayload,
  Shot,
  ShotsListResponse,
  UpdateShotPayload,
} from '../types/shot.types';

export const shotsApi = {
  getImageConfig(projectId: string): Promise<ShotImageConfig> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shot-images/config`);
  },
  getImages(projectId: string): Promise<{ items: ShotImage[] }> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shot-images`);
  },
  generateImage(projectId: string, shotId: string, revisionId: string): Promise<ShotImage> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shot-images/generate`, { method: 'POST', body: JSON.stringify({ shot_id: shotId, revision_id: revisionId }) });
  },
  generateApprovedImages(projectId: string): Promise<{ queued: number; items: ShotImage[] }> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shot-images/generate-approved`, { method: 'POST' });
  },
  getRevisions(projectId: string, shotId: string): Promise<ShotRevisionHistory> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}/revisions`);
  },
  createRevision(projectId: string, shotId: string, payload: { parent_id: string; mode: 'manual' | 'ai'; change_note: string; title?: string; description?: string; details?: Record<string, string> }): Promise<ShotRevisionHistory> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}/revisions`, { method: 'POST', body: JSON.stringify(payload) });
  },
  reviewRevision(projectId: string, shotId: string, revisionId: string, payload: { decision: 'approve' | 'reject'; expected_active_id: string; note: string }): Promise<ShotRevisionHistory> {
    return requestStructuredJson(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}/revisions/${encodeURIComponent(revisionId)}/review`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async getShots(projectId: string): Promise<ShotsListResponse> {
    return requestStructuredJson<ShotsListResponse>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots`
    );
  },

  async getShot(projectId: string, shotId: string): Promise<Shot> {
    return requestStructuredJson<Shot>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`
    );
  },

  async createShot(projectId: string, payload: CreateShotPayload): Promise<Shot> {
    return requestStructuredJson<Shot>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async updateShot(
    projectId: string,
    shotId: string,
    payload: UpdateShotPayload
  ): Promise<Shot> {
    return requestStructuredJson<Shot>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteShot(projectId: string, shotId: string): Promise<void> {
    return requestStructuredJson<void>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`,
      {
        method: 'DELETE',
      }
    );
  },
};
