import { API_BASE_URL } from '../../../core/config/api';
import { requestJson } from '../../../core/network/api-client';
import type {
  CreateShotPayload,
  Shot,
  ShotsListResponse,
  UpdateShotPayload,
} from '../types/shot.types';

export const shotsApi = {
  async getShots(projectId: string): Promise<ShotsListResponse> {
    return requestJson<ShotsListResponse>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots`
    );
  },

  async getShot(projectId: string, shotId: string): Promise<Shot> {
    return requestJson<Shot>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`
    );
  },

  async createShot(projectId: string, payload: CreateShotPayload): Promise<Shot> {
    return requestJson<Shot>(
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
    return requestJson<Shot>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteShot(projectId: string, shotId: string): Promise<void> {
    return requestJson<void>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/shots/${encodeURIComponent(shotId)}`,
      {
        method: 'DELETE',
      }
    );
  },
};
