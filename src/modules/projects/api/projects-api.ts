import { API_BASE_URL } from '../../../core/config/api';
import { requestJson } from '../../../core/network/api-client';
import type {
  CreateProjectPayload,
  Project,
  ProjectsListResponse,
} from '../types/project.types';

export const projectsApi = {
  async getProjects(params?: { limit?: number; offset?: number }): Promise<ProjectsListResponse> {
    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return requestJson<ProjectsListResponse>(`${API_BASE_URL}/projects?${query.toString()}`);
  },

  async getProject(projectId: string): Promise<Project> {
    return requestJson<Project>(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`);
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    return requestJson<Project>(`${API_BASE_URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
