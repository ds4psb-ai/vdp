
export interface InputData {
  contentId: string;
  parentId: string | null;
  platform: string;
  videoFile: File;
  topComments: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  sourceUrl: string;
  uploadDate: string;
  originalSoundId?: string;
  originalSoundTitle?: string;
  videoOrigin: 'AI-Generated' | 'Real-Footage' | 'Unknown';
}

// New VDP Structure based on the latest prompt

export interface OriginalSound {
  id: string | null;
  title: string | null;
}

export interface VdpMetadata {
  platform: string;
  source_url: string;
  upload_date: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  hashtags: string[];
  video_origin: 'AI-Generated' | 'Real-Footage' | 'Unknown';
  cta_types: string[];
  original_sound: OriginalSound;
}

export interface NotableComment {
  text: string;
  lang: string;
  translation_en: string | null;
}

export interface AudienceReaction {
  analysis: string;
  common_reactions: string[];
  notable_comments: NotableComment[];
  overall_sentiment: string;
}

export interface GraphRefs {
    potential_meme_template: string;
    related_hashtags: string[];
}

export interface ConfidenceScore {
  overall: number;
  scene_classification: number;
  device_analysis: number;
}

export interface OnScreenTextItem {
  text: string;
  lang: string;
  translation_en: string | null;
}

export interface OverallAnalysis {
  summary: string;
  emotional_arc: string;
  audience_reaction: AudienceReaction;
  safety_flags: string[];
  confidence: ConfidenceScore;
  graph_refs: GraphRefs;
  asr_transcript?: string | null;
  asr_lang?: string | null;
  asr_translation_en?: string | null;
  ocr_text?: OnScreenTextItem[];
}

export type SubtitleStyle = "none" | "broadcast_entertainment" | "news_caption" | "simple_white_text";

export interface EditGrammar {
    cut_speed: string;
    camera_style: string;
    subtitle_style: SubtitleStyle;
}

export interface SceneVisualStyle {
  cinematic_properties: string;
  lighting: string;
  mood_palette: string[];
  edit_grammar: EditGrammar;
}

export type AudioEventType = "music_starts" | "music_stops" | "music_change" | "music_crescendo" | "narration_starts" | "critical_sfx" | "laughter" | "singing_starts" | "abrupt_sound_change";

export interface AudioEvent {
  timestamp: number;
  event: AudioEventType;
  description: string;
  intensity: string;
}

export interface SceneAudioStyle {
  music: string;
  ambient_sound: string;
  tone: string;
  audio_events: AudioEvent[];
}

export interface NarrativeUnit {
  narrative_role: string;
  summary: string;
  dialogue: string;
  dialogue_lang?: string | null;
  dialogue_translation_en?: string | null;
  rhetoric: string[];
  comedic_device: string[];
}

export interface SceneSetting {
  location: string;
  visual_style: SceneVisualStyle;
  audio_style: SceneAudioStyle;
}

// === Shot Analysis Types ===
export type CameraShotType = "ECU" | "CU" | "MCU" | "MS" | "MLS" | "WS" | "EWS";
export type CameraAngleType = "eye" | "high" | "low" | "overhead" | "dutch";
export type CameraMoveType = "static" | "pan" | "tilt" | "dolly" | "truck" | "handheld" | "crane" | "zoom";
export type CompositionGridType = "left_third" | "center" | "right_third" | "symmetry";
export type KeyframeRoleType = "start" | "mid" | "peak" | "end";
export type ConfidenceType = "low" | "medium" | "high";

export interface Keyframe {
  role: KeyframeRoleType;
  t_rel_shot?: number;
  desc: string;
}

export interface Camera {
  shot: CameraShotType;
  angle: CameraAngleType;
  move: CameraMoveType;
}

export interface Composition {
  grid: CompositionGridType;
  notes?: string[];
}

export interface Shot {
  shot_id: string;
  start: number;
  end: number;
  camera: Camera;
  composition: Composition;
  keyframes: Keyframe[];
  confidence: ConfidenceType;
}

export interface Scene {
  scene_id: string;
  time_start: number;
  time_end: number;
  duration_sec: number;
  narrative_unit: NarrativeUnit;
  setting: SceneSetting;
  shots: Shot[]; // New field for shot-level analysis
  importance?: 'critical' | 'normal';
}

// === Product & Service Mention Types ===
export type PromotionStatus = "paid" | "gifted" | "affiliate" | "organic" | "unknown";
export type MentionSource = "asr" | "ocr" | "platform_caption" | "platform_ui" | "visual";
export type MentionConfidence = "low" | "medium" | "high";

export interface Promotion {
  status: PromotionStatus;
  signals: string[];
}

export interface MentionItem {
  type: "product" | "service";
  name: string;
  category?: string;
  sources: MentionSource[];
  time_ranges?: [number, number][];
  evidence: string[];
  promotion: Promotion;
  confidence: MentionConfidence;
}


export interface ViralDNProfile {
  content_id: string;
  default_lang?: string;
  metadata: VdpMetadata;
  overall_analysis: OverallAnalysis;
  scenes: Scene[];
  product_mentions: MentionItem[];
  service_mentions: MentionItem[];
}
