import { API_BASE_URL } from '../../../core/config/api';
import { ApiClientError, requestJson } from '../../../core/network/api-client';
import type {
  ActiveBriefResponse,
  IngestBriefPayload,
  NormalizedActiveBrief,
  ProjectBrief,
  SourceDocument,
  UpdateBriefPayload,
} from '../types/brief.types';

export const briefApi = {
  async getActiveBrief(projectId: string): Promise<NormalizedActiveBrief> {
    try {
      const raw = await requestJson<ActiveBriefResponse>(
        `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/brief`
      );

      let brief: ProjectBrief | null = null;
      let sourceDocument: SourceDocument | null = null;

      if (raw.brief) {
        brief = raw.brief;
        sourceDocument = raw.source_document || null;
      } else if (raw.id) {
        // Flat ProjectBrief representation
        brief = {
          id: raw.id,
          project_id: raw.project_id || projectId,
          source_document_id: raw.source_document_id,
          objective: raw.objective || '',
          visual_style: raw.visual_style || '',
          lighting_mood: raw.lighting_mood || '',
          characters: Array.isArray(raw.characters) ? raw.characters : [],
          key_props: Array.isArray(raw.key_props) ? raw.key_props : [],
          constraints: Array.isArray(raw.constraints) ? raw.constraints : [],
          unresolved_questions: Array.isArray(raw.unresolved_questions)
            ? raw.unresolved_questions
            : [],
          review_status: raw.review_status || 'pending_review',
          created_at: raw.created_at,
          updated_at: raw.updated_at,
        };
        sourceDocument = raw.source_document || null;
      } else if (raw.source_document) {
        sourceDocument = raw.source_document;
      }

      return {
        sourceDocument,
        brief,
      };
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        return {
          sourceDocument: null,
          brief: null,
        };
      }
      throw err;
    }
  },

  async ingestBrief(projectId: string, payload: IngestBriefPayload): Promise<SourceDocument> {
    return requestJson<SourceDocument>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/brief/ingest`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async extractBrief(projectId: string): Promise<ProjectBrief> {
    return requestJson<ProjectBrief>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/brief/extract`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
  },

  async updateBrief(projectId: string, payload: UpdateBriefPayload): Promise<ProjectBrief> {
    return requestJson<ProjectBrief>(
      `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/brief`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },
};
