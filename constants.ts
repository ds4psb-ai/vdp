
import { Type } from "@google/genai";
import { ViralDNProfile } from "./types";

const NOTABLE_COMMENT_SCHEMA = {
    type: Type.OBJECT,
    required: ["text", "lang"],
    properties: {
        text: { type: Type.STRING, description: "The original, verbatim comment text." },
        lang: { type: Type.STRING, description: "BCP-47 language code for the comment (e.g., 'ko', 'en', 'und')." },
        translation_en: { type: Type.STRING, nullable: true, description: "Concise, faithful English translation, if helpful." }
    }
};

const AUDIENCE_REACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    analysis: { type: Type.STRING, description: "Deep analysis of the audience's psychological and emotional reactions." },
    common_reactions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common reactions or themes found in comments." },
    notable_comments: { 
        type: Type.ARRAY, 
        items: NOTABLE_COMMENT_SCHEMA,
        description: "List of specific, representative comments, preserved in their original language." 
    },
    overall_sentiment: { type: Type.STRING, description: "A summary of the overall sentiment (e.g., 'Highly Positive', 'Mixed but intrigued')." },
  },
  required: ["analysis", "common_reactions", "notable_comments", "overall_sentiment"],
};

const GRAPH_REFS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        potential_meme_template: { type: Type.STRING, description: "Description of how this video could become a meme template." },
        related_hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hashtags related to the memes or trends referenced." }
    },
    required: ["potential_meme_template", "related_hashtags"]
};

const CONFIDENCE_SCORE_SCHEMA = {
    type: Type.OBJECT,
    description: "Detailed breakdown of the analysis confidence.",
    properties: {
        overall: { type: Type.NUMBER, description: "Overall confidence in the entire analysis." },
        scene_classification: { type: Type.NUMBER, description: "Confidence in the scene division and narrative role classification." },
        device_analysis: { type: Type.NUMBER, description: "Confidence in the identification of rhetorical and comedic devices." },
    },
    required: ["overall", "scene_classification", "device_analysis"],
};

const OCR_TEXT_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        required: ["text", "lang"],
        properties: {
            text: { type: Type.STRING },
            lang: { type: Type.STRING, description: "BCP-47 code for the on-screen text." },
            translation_en: { type: Type.STRING, nullable: true, description: "English translation of the text." }
        }
    }
};

const OVERALL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  description: "A high-level analysis of the entire video.",
  properties: {
    summary: { type: Type.STRING, description: "A concise, comprehensive summary of the video's plot and message in English." },
    emotional_arc: { type: Type.STRING, description: "Description of the emotional journey the viewer experiences from start to finish in English." },
    audience_reaction: AUDIENCE_REACTION_SCHEMA,
    safety_flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential platform policy violations (e.g., 'profanity')." },
    confidence: CONFIDENCE_SCORE_SCHEMA,
    graph_refs: GRAPH_REFS_SCHEMA,
    asr_transcript: { type: Type.STRING, nullable: true },
    asr_lang: { type: Type.STRING, nullable: true, description: "BCP-47 code for the transcript language." },
    asr_translation_en: { type: Type.STRING, nullable: true },
    ocr_text: { ...OCR_TEXT_SCHEMA, nullable: true },
  },
  required: ["summary", "emotional_arc", "audience_reaction", "safety_flags", "confidence", "graph_refs"],
};

const EDIT_GRAMMAR_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        cut_speed: { type: Type.STRING, description: "Speed of cuts (e.g., 'slow', 'fast')." },
        camera_style: { type: Type.STRING, description: "Camera movement style (e.g., 'static_shot', 'handheld')." },
        subtitle_style: { type: Type.STRING, enum: ["none", "broadcast_entertainment", "news_caption", "simple_white_text"] },
    },
    required: ["cut_speed", "camera_style", "subtitle_style"],
};

const AUDIO_EVENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    timestamp: { type: Type.NUMBER, description: "Timestamp of the event in seconds (float)." },
    event: { type: Type.STRING, enum: ["music_starts", "music_stops", "music_change", "music_crescendo", "narration_starts", "critical_sfx", "laughter", "singing_starts", "abrupt_sound_change"] },
    description: { type: Type.STRING, description: "A brief explanation of the sound event in English." },
    intensity: { type: Type.STRING, description: "The intensity of the audio event (e.g., 'High', 'Medium', 'Low')." },
  },
  required: ["timestamp", "event", "description", "intensity"]
};

const KEYFRAME_SCHEMA = {
  type: Type.OBJECT,
  required: ["role", "desc"],
  properties: {
    role: { type: Type.STRING, enum: ["start", "mid", "peak", "end"] },
    t_rel_shot: { type: Type.NUMBER, description: "Relative time in seconds within the shot.", nullable: true },
    desc: { type: Type.STRING, description: "Natural language description of the keyframe in English." },
  },
};

const CAMERA_SCHEMA = {
  type: Type.OBJECT,
  required: ["shot", "angle", "move"],
  properties: {
    shot: { type: Type.STRING, enum: ["ECU", "CU", "MCU", "MS", "MLS", "WS", "EWS"] },
    angle: { type: Type.STRING, enum: ["eye", "high", "low", "overhead", "dutch"] },
    move: { type: Type.STRING, enum: ["static", "pan", "tilt", "dolly", "truck", "handheld", "crane", "zoom"] },
  },
};

const COMPOSITION_SCHEMA = {
  type: Type.OBJECT,
  required: ["grid"],
  properties: {
    grid: { type: Type.STRING, enum: ["left_third", "center", "right_third", "symmetry"] },
    notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short notes on composition in English (0-3 items).", nullable: true },
  },
};

const SHOT_SCHEMA = {
  type: Type.OBJECT,
  required: ["shot_id", "start", "end", "camera", "composition", "keyframes", "confidence"],
  properties: {
    shot_id: { type: Type.STRING, description: "Unique ID for the shot within the scene." },
    start: { type: Type.NUMBER, description: "Absolute start time of the shot in seconds, relative to the video start." },
    end: { type: Type.NUMBER, description: "Absolute end time of the shot in seconds, relative to the video start." },
    camera: CAMERA_SCHEMA,
    composition: COMPOSITION_SCHEMA,
    keyframes: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 4,
      items: KEYFRAME_SCHEMA,
    },
    confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
  },
};


const SCENE_SCHEMA = {
  type: Type.OBJECT,
  description: "Analysis of a single, distinct scene within the video.",
  properties: {
    scene_id: { type: Type.STRING, description: "A unique identifier for the scene, formatted as 'S<NN>_<Theme>' (e.g., 'S01_GukbapRestaurant')." },
    time_start: { type: Type.NUMBER, description: "The start time of the scene in seconds." },
    time_end: { type: Type.NUMBER, description: "The end time of the scene in seconds." },
    duration_sec: { type: Type.NUMBER, description: "The total duration of the scene in seconds (time_end - time_start)." },
    importance: { type: Type.STRING, enum: ["critical", "normal"], description: "The narrative importance of the scene." },
    narrative_unit: {
      type: Type.OBJECT,
      properties: {
        narrative_role: { type: Type.STRING, description: "The role of this scene in the overall story (e.g., 'Setup & Punchline')." },
        summary: { type: Type.STRING, description: "A summary of the events and actions within this scene, in English." },
        dialogue: { type: Type.STRING, description: "The full transcript of all dialogue in the scene, in its original language." },
        dialogue_lang: { type: Type.STRING, nullable: true, description: "IETF BCP-47 language tag for the dialogue (e.g., 'ko', 'en-US')." },
        dialogue_translation_en: { type: Type.STRING, nullable: true, description: "English translation of the dialogue." },
        rhetoric: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of literary or rhetorical devices used (in snake_case)." },
        comedic_device: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific comedic devices used (in snake_case)." }
      },
      required: ["narrative_role", "summary", "dialogue", "rhetoric", "comedic_device"],
    },
    setting: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING, description: "The primary location of the scene." },
        visual_style: {
          type: Type.OBJECT,
          properties: {
            cinematic_properties: { type: Type.STRING, description: "A summary of key camera work, composition, and other cinematic techniques." },
            lighting: { type: Type.STRING, description: "Description of the lighting style and its effect." },
            mood_palette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords describing the color palette and mood." },
            edit_grammar: EDIT_GRAMMAR_SCHEMA,
          },
          required: ["cinematic_properties", "lighting", "mood_palette", "edit_grammar"],
        },
        audio_style: {
          type: Type.OBJECT,
          properties: {
            music: { type: Type.STRING, description: "Description of the background music and its mood." },
            ambient_sound: { type: Type.STRING, description: "Description of the background or ambient sounds." },
            tone: { type: Type.STRING, description: "The dominant tone of the dialogue or narration in the scene." },
            audio_events: { type: Type.ARRAY, items: AUDIO_EVENT_SCHEMA }
          },
          required: ["music", "ambient_sound", "tone", "audio_events"],
        },
      },
      required: ["location", "visual_style", "audio_style"],
    },
    shots: {
      type: Type.ARRAY,
      description: "An array of individual shots that comprise the scene.",
      items: SHOT_SCHEMA,
    }
  },
  required: ["scene_id", "time_start", "time_end", "duration_sec", "narrative_unit", "setting", "shots"],
};

const PROMOTION_SCHEMA = {
    type: Type.OBJECT,
    required: ["status", "signals"],
    properties: {
        status: { type: Type.STRING, enum: ["paid", "gifted", "affiliate", "organic", "unknown"] },
        signals: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    description: "Details about the promotional nature of the mention."
};

const MENTION_ITEM_SCHEMA = {
    type: Type.OBJECT,
    required: ["type", "name", "sources", "evidence", "promotion", "confidence"],
    properties: {
        type: { type: Type.STRING, enum: ["product", "service"], description: "The type of mention." },
        name: { type: Type.STRING, description: "The verbatim name of the product or service." },
        category: { type: Type.STRING, nullable: true, description: "A short English noun for the product/service category." },
        sources: {
            type: Type.ARRAY,
            items: { type: Type.STRING, enum: ["asr", "ocr", "platform_caption", "platform_ui", "visual"] },
            description: "Evidence sources for the mention."
        },
        time_ranges: {
            type: Type.ARRAY,
            items: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                minItems: 2,
                maxItems: 2,
            },
            nullable: true,
            description: "List of [start, end] time ranges in seconds where the mention occurs."
        },
        evidence: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Short quotes or visual notes supporting the mention."
        },
        promotion: PROMOTION_SCHEMA,
        confidence: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Confidence level of the detection." }
    }
};

export const VDP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    content_id: { type: Type.STRING, description: "The unique 6-digit zero-padded content ID provided in the prompt." },
    default_lang: { type: Type.STRING, description: "Default language for analysis fields, e.g., 'en'." },
    metadata: {
      type: Type.OBJECT,
      properties: {
        platform: { type: Type.STRING },
        source_url: { type: Type.STRING, description: "The full URL of the original video." },
        upload_date: { type: Type.STRING, description: "The platform upload timestamp in ISO 8601 format, provided by the user." },
        view_count: { type: Type.INTEGER },
        like_count: { type: Type.INTEGER },
        comment_count: { type: Type.INTEGER },
        share_count: { type: Type.INTEGER },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Creative, viral-potential hashtags in English." },
        video_origin: { type: Type.STRING, description: "Classification of video source ('AI-Generated', 'Real-Footage', 'Unknown')." },
        cta_types: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Call to action types observed." },
        original_sound: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING, nullable: true },
                title: { type: Type.STRING, nullable: true }
            },
            required: ['id', 'title']
        },
      },
      required: ["platform", "source_url", "upload_date", "view_count", "like_count", "comment_count", "share_count", "hashtags", "video_origin", "cta_types", "original_sound"],
    },
    overall_analysis: OVERALL_ANALYSIS_SCHEMA,
    scenes: {
      type: Type.ARRAY,
      items: SCENE_SCHEMA,
    },
    product_mentions: {
        type: Type.ARRAY,
        items: MENTION_ITEM_SCHEMA,
        description: "List of detected product mentions."
    },
    service_mentions: {
        type: Type.ARRAY,
        items: MENTION_ITEM_SCHEMA,
        description: "List of detected service mentions."
    },
  },
  required: ["content_id", "metadata", "overall_analysis", "scenes", "product_mentions", "service_mentions"],
};

export const sampleVDP: ViralDNProfile = {
  content_id: "C000001",
  default_lang: "en",
  metadata: {
    platform: "TikTok",
    source_url: "https://www.tiktok.com/@user/video/12345",
    upload_date: new Date().toISOString(),
    view_count: 1200000,
    like_count: 250000,
    comment_count: 4500,
    share_count: 12000,
    hashtags: [
      "profanity_grandma",
      "pork_soup_restaurant",
      "lone_gourmet_parody",
      "reversal_comedy",
      "ill_report_you"
    ],
    cta_types: [],
    video_origin: "AI-Generated",
    original_sound: {
      id: null,
      title: null
    }
  },
  overall_analysis: {
    summary: "A man asks the owner of a pork soup restaurant for her secret ingredient, to which she absurdly replies 'beef' and insults him. The man then calmly responds, 'Thank you, I'll report you,' providing a comedic twist.",
    emotional_arc: "Polite inquiry -> absurd answer and insult -> unexpectedly calm counter-attack -> comedic ending.",
    audience_reaction: {
      analysis: "Viewers find explosive humor in the man's calm 'report' threat. The twist on the 'cranky grandma' trope, where the customer is even more unpredictable, provides freshness. The mention of a politician's speech pattern acts as an inside joke, creating a sense of community among those who get the reference.",
      common_reactions: ["Burst out laughing at the last line", "The report threat is fresh", "Grandma's character is spot on", "The male actor's performance is great"],
      notable_comments: [
        { text: "마지막에 이준석 말투인데 ㅋㅋ", lang: "ko", translation_en: "The last line is like Lee Jun-seok's way of talking haha" },
        { text: "신고할게요ㅋㅋㅋㅋ", lang: "ko", translation_en: "I'm reporting you lol" }
      ],
      overall_sentiment: "Very positive, hilarious"
    },
    safety_flags: ["profanity"],
    confidence: {
      overall: 0.98,
      scene_classification: 0.99,
      device_analysis: 0.95,
    },
    graph_refs: {
      potential_meme_template: "Twisting the 'cranky grandma' cliche, 'Yes, thank you. I'll report you.' meme",
      related_hashtags: ["#lone_gourmet_parody", "#lee_jun_seok"]
    },
    asr_transcript: "할머니 뭘 넣었길래 이렇게 맛있어요? 소고기 넣었다. 돼지국밥인데 뭘 넣겠냐 이 돌대가리 같은 놈아. 밥이나 처먹어. 네 감사합니다. 신고할게요.",
    asr_lang: "ko",
    asr_translation_en: "Grandma, what did you put in here that makes it so delicious? I put in beef. It's pork soup, what do you think I'd put in, you blockhead? Just eat your food. Yes, thank you. I'll report you.",
    ocr_text: [{
        text: "돼지국밥",
        lang: "ko",
        translation_en: "Pork Soup"
    }]
  },
  scenes: [
    {
      scene_id: "S01_GukbapRestaurant",
      time_start: 0.0,
      time_end: 15.0,
      duration_sec: 15.0,
      importance: "critical",
      narrative_unit: {
        dialogue: "남자: 할머니 뭘 넣었길래 이렇게 맛있어요?\n할머니: 소고기 넣었다.\n할머니: 돼지국밥인데 뭘 넣겠냐 이 돌대가리 같은 놈아. 밥이나 처먹어.\n남자: 네 감사합니다. 신고할게요.",
        dialogue_lang: "ko",
        dialogue_translation_en: "Man: Grandma, what did you put in here that makes it so delicious?\nGrandma: I put in beef.\nGrandma: It's pork soup, what do you think I'd put in, you blockhead? Just eat your food.\nMan: Yes, thank you. I'll report you.",
        narrative_role: "Setup & Punchline",
        summary: "A man, impressed by the taste of his pork soup, asks the owner for the secret. The grandma absurdly replies 'beef' and hurls insults, but the man, unphased, calmly replies, 'I'll report you.'",
        rhetoric: ["reversal", "wordplay"],
        comedic_device: ["character_contrast", "expectation_subversion", "deadpan_humor"]
      },
      setting: {
        location: "Old pork soup restaurant",
        visual_style: {
          cinematic_properties: "Static medium shot reminiscent of 'The Solitary Gourmet,' focusing on the characters' expressions and dialogue.",
          lighting: "Realistic feel emphasized by the restaurant's fluorescent lighting.",
          mood_palette: [ "everyday", "realistic", "comedic" ],
          edit_grammar: {
            cut_speed: "slow",
            camera_style: "static_shot",
            subtitle_style: "broadcast_entertainment"
          }
        },
        audio_style: {
          music: "None",
          ambient_sound: "Faint background noise of the restaurant",
          tone: "Man's polite inquiry -> Grandma's blunt and harsh tone -> Man's calm and dry tone",
          audio_events: []
        }
      },
      shots: [
        {
          shot_id: "S01_Shot01",
          start: 0.0,
          end: 15.0,
          camera: {
            shot: "MS",
            angle: "eye",
            move: "static",
          },
          composition: {
            grid: "center",
            notes: ["Two characters placed centrally", "Stable composition"],
          },
          keyframes: [
            { role: "start", t_rel_shot: 0.5, desc: "The man starts asking the grandma a question." },
            { role: "peak", t_rel_shot: 12.0, desc: "A moment of silence after the man says, 'I'll report you.'" },
            { role: "end", t_rel_shot: 14.5, desc: "The scene concludes." },
          ],
          confidence: "high",
        }
      ]
    }
  ],
  product_mentions: [],
  service_mentions: [
    {
        type: "service",
        name: "Pork Soup Restaurant",
        category: "restaurant",
        sources: ["visual", "asr", "ocr"],
        time_ranges: [[0.0, 15.0]],
        evidence: [
            "Visual setting is a pork soup restaurant.", 
            "Dialogue mentions '돼지국밥' (pork soup).", 
            "On-screen sign text says '돼지국밥'."
        ],
        promotion: {
            status: "unknown",
            signals: []
        },
        confidence: "high"
    }
  ]
};
