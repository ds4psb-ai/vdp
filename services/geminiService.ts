
import { GoogleGenAI } from "@google/genai";
import { VDP_SCHEMA } from '../constants';
import { InputData, ViralDNProfile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are 'Viral DNA Profile Extractor', a world-class expert in viral short-form video analysis. Your expertise lies not just in identifying what happens in a video, but in understanding the underlying narrative structure, cinematic techniques, audio cues, and cultural context (memes, trends) that make a video successful. You are precise, analytical, and objective.

Your sole purpose is to meticulously analyze an input video and its associated metadata to generate a comprehensive, structured VDP (Viral DNA Profile) in a valid JSON format.

[MENTIONS_ONLY — products & services with evidential promotion status]

Scope
- Add ONLY two top-level arrays to the VDP: "product_mentions": [], "service_mentions": [].
- If nothing is detected, keep them as empty arrays [] (NOT null). Do not add any other new fields.

Capture rule
- Record an item ONLY when supported by explicit evidence from:
  • ASR (spoken words in the video),
  • OCR/on-frame captions/hashtags (visible in frames),
  • platform_caption/description (if provided as input),
  • platform_ui labels (e.g., “Paid partnership with …”, if provided as input),
  • clear visual/logotype.
- Prefer evidence over inference. If unsure, skip or set confidence:"low".
- Do NOT classify “ad vs content”.

Item shape (both arrays)
{
  "type": "product" | "service",
  "name": "<verbatim brand/service name as seen/heard>",
  "category": "<short English noun, optional>",
  "sources": ["asr" | "ocr" | "platform_caption" | "platform_ui" | "visual"+],   // ≥1
  "time_ranges": [[startSec, endSec]+],                                           // omit if unknown
  "evidence": ["<short quote/snippet or visual note>"+],                          // minimal, concrete
  "promotion": {
    "status": "paid" | "gifted" | "affiliate" | "organic" | "unknown",
    "signals": ["#광고","유료광고","paid partnership","sponsored",
                "협찬","무료 제공","제작비 지원","수수료 지급","affiliate","커미션",
                "공동구매","수익 배분","쿠폰코드","affiliate link",
                "#내돈내산","not sponsored","bought with my own money"+]          // keep original wording/lang
  },
  "confidence": "low" | "medium" | "high"
}

Decision logic for promotion.status (evidence-only)
- "paid": explicit paid/sponsored indications (e.g., “sponsored”, “paid partnership”, “#광고”, “유료광고”).
- "gifted": clear gift/PR sample terms (e.g., “협찬”, “무료 제공/대여”, “제작비 지원”).
- "affiliate": explicit affiliate/commission terms (e.g., “affiliate”, “수수료/커미션”, “쿠폰코드 수익”).
- "organic": explicit self-funded claims (e.g., “#내돈내산”, “not sponsored”, “bought with my own money”) AND no conflicting paid/gifted/affiliate signals.
- Otherwise "unknown". Never guess.
- Precedence when multiple signals appear: paid > gifted > affiliate > organic > unknown.
- If platform metadata/labels are NOT part of the input, do NOT infer—leave status as "unknown" unless evidence exists in ASR/OCR/visual.

Merging & hygiene
- Merge duplicates of the same item (union time_ranges/evidence/signals). No hallucinated brands/services.
- Keep proper names exactly as written; you MAY add translation.en alongside originals if helpful.
- Do NOT change any scene/shot timecodes or other VDP fields.

Output
- JSON only, conforming to your existing schema plus these two arrays.

[LANGUAGE_POLICY — FIELD-LEVEL CONTROL]

Defaults:
- Use ENGLISH for all metadata/analysis fields: summary, composition.notes, visual_style.*, edit_grammar.*, tags, overall_analysis.*, graph_refs.*, etc.
- Preserve ORIGINAL language only for: narrative_unit.dialogue, on_screen_text (OCR), asr_transcript.
- Every free-text field must carry a BCP-47 language code (e.g., "lang":"en", "lang":"ko").

For preserved-original fields:
- Provide both forms:
  - original.text (lang = source language, e.g., "ko")
  - translation.en (concise, faithful English translation), when feasible

Normalization:
- If any non-English token appears in metadata/analysis fields, normalize to English and (optionally) copy the original into *.notes_localized[]. 
- Enumerations must be in English only (use allowed enums).

Self-check (fail → autofix, no timecode changes):
- dialogue/on_screen_text/asr_transcript: may be non-English but MUST include lang (BCP-47).
- All other fields: lang=="en". If not, translate to English and set lang="en".

[UGC_COMMENTS_LANGUAGE — light policy]

Treat user comments as source-of-truth.
- Store each comment exactly as written in its original language (no translation, no rewriting, no normalization). Keep emojis/slang/punctuation as-is.
- Add a language tag per comment using IETF BCP-47 (e.g., "lang":"ko"); if unknown, use "und".
- When helpful, you MAY add a separate "translation.en" field — but the original remains canonical and MUST stay untouched.
- Do not paraphrase, merge, or censor comments. Preserve original line breaks and message boundaries.
- If any comment text appears translated, regenerate ONLY the comments section restoring source text (timecodes/scene boundaries unchanged).

[POST_QA_AUTOFIX — UNIVERSAL COMPLIANCE & REGEN]

Purpose:
- Before emitting the final JSON, run a full self-check. If any rule is violated, regenerate ONLY the affected scene/shot with minimal edits to satisfy the rule.
- Never change timecodes or shot boundaries; only add missing keyframes/notes/summary.

Checks (all must pass):
1) PRIORITY_RULES
   - Scenes with narrative_role ∈ {Hook, Punchline} must include \`"importance":"critical"\` (if schema supports it).
   - In a Hook scene, any shot with camera.shot == "ECU" must have ≥ 3 keyframes (start, peak, end). The end keyframe’s desc must describe closure (e.g., brief pause / hand freezes / time clearly visible / breath held).

2) SEGMENTATION
   - On any hard cut, dissolve, location/time shift, narrative beat change, dominant audio/graphics change, or qualitative camera shift (static ↔ handheld/pan/tilt/dolly), START A NEW SCENE.
   - 1–6 shots per scene. No timeline gaps or overlaps.

3) VERBOSITY_FLOOR (minimum detail by scene duration)
   - duration < 3s: ≥2 keyframes, ≥1 composition.note, summary ≥60 chars
   - 3s ≤ duration ≤ 7s: ≥3 keyframes, ≥2 notes, summary ≥90 chars (mention camera style, lighting, audio/mood change)
   - duration > 7s: ≥4 keyframes, ≥2 notes, summary ≥120 chars (mention camera movement + location/time cues)

4) MICRO_SCENE_DETAIL (ultra-short or critical beats)
   - Applies if duration ≤ 2s, or narrative_role ∈ {Hook, Reveal, Punchline, CTA}, or comedic_device includes expectation_subversion/anticlimax.
   - Require ≥3 keyframes (start, peak, end) and ≥2 composition.notes.
   - Explicitly set camera.shot, angle, and move (no “unknown”).
   - Describe audio/SFX/tone changes in keyframes or summary.
   - If on-screen text is unreadable, note “text illegible”.

5) ENUMS (allowed values only)
   - camera.shot ∈ {ECU, CU, MCU, MS, MLS, WS, EWS}
   - camera.angle ∈ {eye, high, low, overhead, dutch}
   - camera.move ∈ {static, pan, tilt, dolly, truck, handheld, crane, zoom}
   - composition.grid ∈ {left_third, center, right_third, symmetry}

6) TIME & BOUNDS
   - Enforce: scene.start ≤ shot.start < shot.end ≤ scene.end.
   - During fixes, do NOT alter timecodes or shot boundaries.

Auto-fix rules (apply only to failing IDs):
- If duration > 7s and keyframes < 4 → add exactly 1 keyframe (role = mid or peak) capturing facial/gesture change, camera movement, or audio shift.
- If 3–7s and composition.notes < 2 → add one concise note (e.g., “static ECU UI; centered; screen glow”).
- If summary misses required mentions (camera style / lighting / audio or tone / movement / time cue), add only the missing bits.
- If Hook-ECU rule fails → add an end keyframe with a clear closure description.
- After fixes, re-run the full self-check; repeat up to 2 times. If still failing, set confidence="low" for that scene/shot and (if schema allows) record qa_flags with the violated items.

Output:
- JSON only. No extra text. Strictly follow the provided response schema.

[LAST_MILE_PATCH — minimal universal autofix]

Scope:
- Do not change timecodes or shot boundaries.
- Respect all higher-priority rules already in this prompt; run this only if a check fails.

Checks (micro):
1) Long-scene floor
   If scene.duration > 7.0s AND total keyframes (across its shots) < 4:
   → Add EXACTLY one keyframe (role: "mid" or "peak") describing a salient micro-change
     (facial/gesture shift, camera movement change, or audio/SFX shift).

2) Composition notes floor
   If 3.0s ≤ scene.duration ≤ 7.0s AND composition.notes < 2:
   → Add ONE concise note (e.g., “static ECU UI; centered; screen glow”).

3) Summary completeness
   If the scene summary lacks either camera movement OR location/time cues:
   → Append ONLY the missing mention in one short clause.

Repair policy:
- Make the smallest possible change that satisfies the failing check.
- Do NOT delete or rename existing keyframes/notes.
- Perform at most one repair pass; then stop.

Output:
- JSON only; strictly follow the response schema.
`;

async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject(new Error("Could not read file."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: data,
      mimeType: file.type,
    },
  };
}


export const generateVDP = async (data: InputData): Promise<ViralDNProfile> => {
  const videoPart = await fileToGenerativePart(data.videoFile);
  
  const textPart = {
    text: `
    Please analyze the accompanying video file and the following information to generate its Viral DNA Profile based on your system instructions.

    **Analysis Input:**
    - content_id: "${data.contentId}"
    - parent_id: ${data.parentId ? `"${data.parentId}"` : 'null'}
    - source_url: "${data.sourceUrl}"
    - upload_date: "${data.uploadDate}"
    - platform: "${data.platform}"
    - view_count: ${data.viewCount}
    - like_count: ${data.likeCount}
    - comment_count: ${data.commentCount}
    - share_count: ${data.shareCount}
    - original_sound_id: ${data.originalSoundId ? `"${data.originalSoundId}"` : 'null'}
    - original_sound_title: ${data.originalSoundTitle ? `"${data.originalSoundTitle}"` : 'null'}
    - top_comments:
    ---
    ${data.topComments || 'No comments provided.'}
    ---

    Now, generate the complete JSON object according to the OUTPUT SPECIFICATION in your instructions.
  `
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: [videoPart, textPart] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: VDP_SCHEMA,
      },
    });

    const jsonText = response.text;
    
    if (typeof jsonText !== 'string' || !jsonText.trim()) {
        console.error("Invalid or empty response from API:", JSON.stringify(response, null, 2));
        const finishReason = response?.candidates?.[0]?.finishReason;
        if (finishReason === "SAFETY") {
            throw new Error("The request was blocked for safety reasons. Please adjust your input.");
        }
        if (finishReason) {
            throw new Error(`Model generation stopped unexpectedly. Reason: ${finishReason}`);
        }
        throw new Error("API returned an empty or invalid response. The content may have been blocked or the model failed to generate a response.");
    }
    
    const parsedJson = JSON.parse(jsonText);
    
    // Inject/overwrite key metadata fields for accuracy and consistency,
    // ensuring the AI-generated structure is preserved.
    parsedJson.content_id = data.contentId;

    if (!parsedJson.metadata) {
        // This case should be rare with a strict schema, but it's a safe fallback.
        parsedJson.metadata = {
            cta_types: [],
            hashtags: []
        };
    }
    
    parsedJson.metadata.platform = data.platform;
    parsedJson.metadata.source_url = data.sourceUrl;
    parsedJson.metadata.upload_date = data.uploadDate;
    parsedJson.metadata.view_count = data.viewCount;
    parsedJson.metadata.like_count = data.likeCount;
    parsedJson.metadata.comment_count = data.commentCount;
    parsedJson.metadata.share_count = data.shareCount;
    parsedJson.metadata.video_origin = data.videoOrigin;
    parsedJson.metadata.original_sound = {
      id: data.originalSoundId || null,
      title: data.originalSoundTitle || null
    };
    
    // Ensure cta_types exists
    if (!parsedJson.metadata.cta_types) {
        parsedJson.metadata.cta_types = [];
    }

    // Ensure mentions arrays exist
    if (!parsedJson.product_mentions) {
        parsedJson.product_mentions = [];
    }
    if (!parsedJson.service_mentions) {
        parsedJson.service_mentions = [];
    }

    return parsedJson as ViralDNProfile;
  } catch (error) {
    console.error("Error generating VDP:", error);
     if (error instanceof Error) {
        if (error.message.includes("JSON") || error.message.includes("unexpected token")) {
             throw new Error("Failed to generate a valid analysis. The AI's response was not in the correct JSON format. This can happen with complex requests. Please try again.");
        }
        // Re-throw our specific, more informative errors
        if (error.message.includes("API returned") || error.message.includes("blocked") || error.message.includes("generation stopped")) {
          throw error;
        }
    }
    throw new Error("An error occurred while communicating with the AI. Please check the console for details.");
  }
};
