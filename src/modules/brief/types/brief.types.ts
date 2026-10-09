export type BriefReviewStatus = 'pending_review' | 'approved';

export interface SourceDocument {
  id: string;
  project_id: string;
  source_name: string;
  content: string;
  created_at: string;
}

export interface CharacterSpec {
  name: string;
  details: string;
}

export interface PropSpec {
  name: string;
  details: string;
}

export interface ProjectBrief {
  id: string;
  project_id: string;
  source_document_id?: string | null;
  objective: string;
  visual_style: string;
  lighting_mood: string;
  characters: CharacterSpec[];
  key_props: PropSpec[];
  constraints: string[];
  unresolved_questions: string[];
  review_status: BriefReviewStatus;
  created_at?: string;
  updated_at?: string;
}

export interface IngestBriefPayload {
  source_name: string;
  content: string;
}

export interface UpdateBriefPayload {
  objective?: string;
  visual_style?: string;
  lighting_mood?: string;
  characters?: CharacterSpec[];
  key_props?: PropSpec[];
  constraints?: string[];
  unresolved_questions?: string[];
  review_status?: BriefReviewStatus;
}

export interface ActiveBriefResponse {
  source_document?: SourceDocument | null;
  brief?: ProjectBrief | null;
  // Flat representation fallback
  id?: string;
  project_id?: string;
  source_document_id?: string | null;
  objective?: string;
  visual_style?: string;
  lighting_mood?: string;
  characters?: CharacterSpec[];
  key_props?: PropSpec[];
  constraints?: string[];
  unresolved_questions?: string[];
  review_status?: BriefReviewStatus;
  created_at?: string;
  updated_at?: string;
}

export interface NormalizedActiveBrief {
  sourceDocument: SourceDocument | null;
  brief: ProjectBrief | null;
}
