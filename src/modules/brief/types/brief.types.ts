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
  version?: number;
  creative_sections?: CreativeSections | null;
  storyboard?: { title: string; description: string; [key: string]: string }[];
  generated_shot_ids?: string[];
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
  creative_sections?: CreativeSections;
  objective?: string;
  visual_style?: string;
  lighting_mood?: string;
  characters?: CharacterSpec[];
  key_props?: PropSpec[];
  constraints?: string[];
  unresolved_questions?: string[];
  review_status?: BriefReviewStatus;
}

export const creativeSectionLabels = {
  project_overview: '1. Project Overview (Ringkasan Proyek)',
  background_objective: '2. Project Background & Objective (Latar Belakang & Tujuan)',
  target_audience: '3. Target Audience (Target Audiens)',
  core_message: '4. Core Message & Key Takeaway (Pesan Utama)',
  deliverables: '5. Scope of Work & Deliverables (Lingkup Kerja & Hasil Akhir)',
  guidelines: '6. Mandatories & Guidelines (Panduan & Batasan Mutlak)',
  timeline: '7. Timeline & Milestones (Jadwal Kerja)',
  budget_resources: '8. Budget & Resources (Anggaran & Sumber Daya)',
} as const;
export type CreativeSections = Record<keyof typeof creativeSectionLabels, string>;

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
