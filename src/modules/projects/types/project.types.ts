export type ProjectStatus = 'draft' | 'active' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface ProjectsListResponse {
  items: Project[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fields: ApiFieldError[];
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}
