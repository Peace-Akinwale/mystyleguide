export type ContentType = 'text' | 'url';
export type AnalysisType = 'individual' | 'batch';

export interface Clip {
  id: string;
  created_at: string;
  user_id?: string;
  content_type: ContentType;
  content: string;
  source_url?: string;
  source_author?: string;
  source_publication?: string;
  user_notes: string;
  tags: string[];
  raw_html?: string;
}

export interface Analysis {
  id: string;
  created_at: string;
  clip_id: string;
  analysis_type: AnalysisType;
  patterns: Record<string, any>;
  style_elements: Record<string, any>;
  claude_response: string;
}

export interface StyleGuide {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  based_on_clip_ids: string[];
  is_active: boolean;
}

export interface Feedback {
  id: string;
  created_at: string;
  user_id?: string;
  my_text: string;
  editor_feedback: string;
  context?: string;
  tags: string[];
}

export interface FetchUrlResponse {
  content: string;
  title: string;
  author?: string;
  publication?: string;
  excerpt?: string;
}

export interface AnalyzeRequest {
  clipIds: string[];
  focusAreas: string[];
}

export interface AnalyzeResponse {
  patterns: Record<string, any>;
  styleElements: Record<string, any>;
  analysisId: string;
}

export type FocusArea =
  | 'sentence_structure'
  | 'rhetorical_devices'
  | 'tone_voice'
  | 'word_choice'
  | 'metaphors'
  | 'rhythm_pacing';
