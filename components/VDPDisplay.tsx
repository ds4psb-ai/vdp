
import React, { useState } from 'react';
import { ViralDNProfile, Scene, AudienceReaction, GraphRefs, ConfidenceScore, Shot, OnScreenTextItem, NotableComment, MentionItem } from '../types';

// Reusable components
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gray-800/70 p-4 rounded-lg border border-gray-700 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-400 mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoGrid: React.FC<{ children: React.ReactNode; cols?: number }> = ({ children, cols = 2 }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-3`}>{children}</div>
);

const InfoCard: React.FC<{ label: string; value: React.ReactNode; className?: string; span?: number }> = ({ label, value, className = '', span = 1 }) => (
    <div className={`bg-gray-800 p-3 rounded-md col-span-1 sm:col-span-${span} ${className}`}>
        <p className="text-xs text-cyan-400 uppercase font-semibold tracking-wider">{label}</p>
        <div className="text-sm text-gray-200 font-medium break-words mt-1">{value}</div>
    </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-gray-700 text-cyan-300' }) => (
    <span className={`inline-block text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full ${color}`}>{children}</span>
);

const StarIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.468a1 1 0 00.95.69h3.462c.72 0 1.023.986.524 1.484l-2.8 2.032a1 1 0 00-.364 1.118l1.07 3.292c.318.98-.784 1.8-1.67 1.187l-2.923-2.124a1 1 0 00-1.176 0l-2.922 2.124c-.886.613-1.989-.207-1.67-1.187l1.07-3.292a1 1 0 00-.364-1.118L2.704 8.526c-.5-.498-.196-1.484.524-1.484h3.462a1 1 0 00.95-.69L9.318 2.884z" clipRule="evenodd" />
    </svg>
);

const TranslationWrapper: React.FC<{ original: React.ReactNode; originalLang?: string; translation: React.ReactNode }> = ({ original, originalLang, translation }) => {
    const [showTranslation, setShowTranslation] = useState(false);

    if (!translation) {
        return <>{original}</>;
    }

    return (
        <div>
            {original}
            <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="text-xs text-cyan-500 hover:text-cyan-400 mt-2"
            >
                {showTranslation ? 'Hide' : 'Show'} English Translation
            </button>
            {showTranslation && (
                <div className="mt-2 p-3 bg-gray-900/70 border-l-2 border-cyan-700 text-gray-300 text-sm italic">
                    {translation}
                </div>
            )}
        </div>
    );
};

const formatSnakeCase = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const AudienceReactionDisplay: React.FC<{data: AudienceReaction}> = ({data}) => (
     <div className="bg-gray-900/50 p-4 rounded-lg mt-3">
         <h4 className="font-semibold text-gray-300 mb-2">Audience Reaction</h4>
         <div className="space-y-3">
            <InfoCard label="Overall Sentiment" value={<span className="font-bold">{data.overall_sentiment}</span>} span={1}/>
            <div>
                 <p className="text-sm font-semibold text-gray-400 mb-1">Common Reactions:</p>
                 <div>{data.common_reactions.map(r => <Badge key={r}>{r}</Badge>)}</div>
            </div>
             <div>
                 <p className="text-sm font-semibold text-gray-400 mb-1">Notable Comments:</p>
                 <div className="space-y-2">
                    {data.notable_comments.map((comment, i) => (
                        <div key={i} className="text-xs text-gray-400 italic bg-gray-800 p-2 rounded">
                            <TranslationWrapper
                                original={<p>"{comment.text}"</p>}
                                originalLang={comment.lang}
                                translation={comment.translation_en ? <p>"{comment.translation_en}"</p> : null}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <InfoCard label="Psychological Analysis" value={data.analysis} span={1}/>
         </div>
     </div>
);

const GraphRefsDisplay: React.FC<{data: GraphRefs}> = ({data}) => (
     <div className="bg-gray-900/50 p-4 rounded-lg mt-3">
        <h4 className="font-semibold text-gray-300 mb-2">Graph & Meme Analysis</h4>
        <div className="space-y-3">
            <InfoCard label="Potential Meme Template" value={data.potential_meme_template} span={1}/>
            <div>
                 <p className="text-sm font-semibold text-gray-400 mb-1">Related Hashtags:</p>
                 <div>{data.related_hashtags.map(r => <Badge key={r}>{r}</Badge>)}</div>
            </div>
        </div>
    </div>
);

const ConfidenceDisplay: React.FC<{data: ConfidenceScore}> = ({data}) => (
    <div className="bg-gray-900/50 p-4 rounded-lg mt-3">
        <h4 className="font-semibold text-gray-300 mb-2">Analysis Confidence</h4>
        <InfoGrid cols={3}>
            <InfoCard label="Overall" value={data.overall.toFixed(2)} />
            <InfoCard label="Scene Classification" value={data.scene_classification.toFixed(2)} />
            <InfoCard label="Device Analysis" value={data.device_analysis.toFixed(2)} />
        </InfoGrid>
    </div>
);

const TranscriptDisplay: React.FC<{ transcript?: string|null, lang?: string|null, translation?: string|null }> = ({ transcript, lang, translation }) => {
    if (!transcript) return null;
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg mt-3">
            <h4 className="font-semibold text-gray-300 mb-2">Full Transcript (ASR)</h4>
            <TranslationWrapper
                original={<p className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-900/70 p-3 rounded-md">{transcript}</p>}
                originalLang={lang || undefined}
                translation={<p className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{translation}</p>}
            />
        </div>
    );
};

const OcrDisplay: React.FC<{ ocrText?: OnScreenTextItem[] }> = ({ ocrText }) => {
    if (!ocrText || ocrText.length === 0) return null;
    return (
         <div className="bg-gray-900/50 p-4 rounded-lg mt-3">
            <h4 className="font-semibold text-gray-300 mb-2">On-Screen Text (OCR)</h4>
            <div className="space-y-2">
                {ocrText.map((item, index) => (
                    <div key={index} className="bg-gray-900/70 p-3 rounded-md">
                         <TranslationWrapper
                            original={<p className="text-gray-300 text-sm font-mono">"{item.text}"</p>}
                            originalLang={item.lang}
                            translation={<p className="text-gray-300 text-sm font-mono">"{item.translation_en}"</p>}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

const ShotCard: React.FC<{ shot: Shot; shotNumber: number }> = ({ shot, shotNumber }) => {
    return (
        <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/70 mt-3">
            <div className="flex justify-between items-center mb-3">
                <h5 className="text-sm font-bold text-teal-300">
                    Shot {shotNumber} <span className="text-xs text-gray-500 font-mono ml-2">({shot.start.toFixed(1)}s - {shot.end.toFixed(1)}s)</span>
                </h5>
                <Badge color="bg-gray-700 text-gray-300">Confidence: {shot.confidence}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Camera & Composition */}
                <div className="space-y-2">
                    <InfoCard label="Camera" className="bg-gray-900/50" value={
                        <div className="text-xs space-y-1">
                            <p><strong>Shot:</strong> {shot.camera.shot}</p>
                            <p><strong>Angle:</strong> {shot.camera.angle}</p>
                            <p><strong>Move:</strong> {shot.camera.move}</p>
                        </div>
                    }/>
                     <InfoCard label="Composition" className="bg-gray-900/50" value={
                        <div className="text-xs space-y-1">
                           <p><strong>Grid:</strong> {formatSnakeCase(shot.composition.grid)}</p>
                           {shot.composition.notes && shot.composition.notes.length > 0 && (
                                <ul className="list-disc list-inside pt-1">
                                    {shot.composition.notes.map((note, i) => <li key={i}>{note}</li>)}
                                </ul>
                           )}
                        </div>
                    }/>
                </div>
                {/* Keyframes */}
                <div>
                     <p className="text-xs text-cyan-400 uppercase font-semibold tracking-wider mb-1">Keyframes</p>
                     <div className="space-y-1">
                        {shot.keyframes.map((kf, i) => (
                             <div key={i} className="text-xs font-mono bg-gray-900/50 p-2 rounded">
                                <span className="font-bold text-teal-400">{kf.role.toUpperCase()}:</span>
                                <span className="text-gray-400 ml-2">({kf.t_rel_shot?.toFixed(1) ?? 'N/A'}s)</span>
                                <p className="text-gray-300 whitespace-pre-wrap font-sans">{kf.desc}</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

const SceneCard: React.FC<{ scene: Scene, sceneNumber: number }> = ({ scene, sceneNumber }) => {
    const { scene_id, setting, narrative_unit, shots } = scene;
    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
            <div className="p-4 bg-gray-800/50">
                <div className="flex justify-between items-center">
                    <h4 className="text-md font-bold text-cyan-300 flex items-center gap-2">
                        <span className="text-gray-500">{String(sceneNumber).padStart(2, '0')}</span>
                        <span>{setting.location}</span>
                        {scene.importance === 'critical' && <StarIcon className="w-4 h-4 text-yellow-400" title="Critical Scene" />}
                    </h4>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">({scene.duration_sec.toFixed(1)}s)</p>
                        <p className="text-xs text-gray-500 font-mono">{scene_id}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {/* Narrative Section */}
                <div>
                    <h5 className="font-semibold text-gray-300 mb-2 text-base">Narrative Unit</h5>
                    <div className="space-y-2 text-sm pl-4 border-l-2 border-cyan-500/30">
                        <p><span className="font-bold text-cyan-400/80 mr-2">Role:</span><Badge>{narrative_unit.narrative_role}</Badge></p>
                        <p className="text-gray-400 italic">"{narrative_unit.summary}"</p>
                        
                        {(narrative_unit.rhetoric.length > 0 || narrative_unit.comedic_device.length > 0) && (
                            <div className="pt-3 mt-3 border-t border-gray-700/50">
                                <h6 className="font-semibold text-gray-300 mb-1 text-sm">Rhetoric & Comedy</h6>
                                {narrative_unit.rhetoric.length > 0 && <div>{narrative_unit.rhetoric.map(d => <Badge color="bg-blue-900/50 text-blue-300" key={d}>{formatSnakeCase(d)}</Badge>)}</div>}
                                {narrative_unit.comedic_device.length > 0 && <div>{narrative_unit.comedic_device.map(d => <Badge color="bg-purple-900/50 text-purple-300" key={d}>{formatSnakeCase(d)}</Badge>)}</div>}
                            </div>
                        )}

                        {narrative_unit.dialogue && narrative_unit.dialogue.toLowerCase() !== 'none' && (
                            <div className="pt-3 mt-3 border-t border-gray-700/50">
                                <h6 className="font-semibold text-gray-300 mb-1 text-sm">Dialogue</h6>
                                 <TranslationWrapper 
                                    original={<p className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-900/70 p-3 rounded-md">{narrative_unit.dialogue}</p>}
                                    originalLang={narrative_unit.dialogue_lang || undefined}
                                    translation={<p className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{narrative_unit.dialogue_translation_en}</p>}
                                 />
                            </div>
                        )}
                    </div>
                </div>

                {/* Audiovisual Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                    <div>
                        <h5 className="font-semibold text-gray-300 mb-2">Visual Style</h5>
                        <div className="space-y-2 text-sm">
                           <InfoCard label="Lighting" value={setting.visual_style.lighting} className="bg-gray-800/50" />
                           <InfoCard label="Cinematics" value={setting.visual_style.cinematic_properties} className="bg-gray-800/50" />
                           <InfoCard label="Edit Grammar" value={
                               <div className="text-xs">
                                   <p>Cut Speed: {setting.visual_style.edit_grammar.cut_speed}</p>
                                   <p>Camera Style: {setting.visual_style.edit_grammar.camera_style}</p>
                                   <p>Subtitle Style: {formatSnakeCase(setting.visual_style.edit_grammar.subtitle_style)}</p>
                               </div>
                           } className="bg-gray-800/50"/>
                           <div>
                                <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-1">Mood Palette:</p>
                                <div className="flex flex-wrap">{setting.visual_style.mood_palette.map(p => <Badge key={p}>{p}</Badge>)}</div>
                           </div>
                        </div>
                    </div>
                     <div>
                        <h5 className="font-semibold text-gray-300 mb-2">Audio Style</h5>
                        <div className="space-y-2 text-sm">
                            <InfoCard label="Ambient" value={setting.audio_style.ambient_sound} className="bg-gray-800/50" />
                            <InfoCard label="Music" value={setting.audio_style.music} className="bg-gray-800/50" />
                            <InfoCard label="Tone" value={setting.audio_style.tone} className="bg-gray-800/50" />
                            
                            {setting.audio_style.audio_events?.length > 0 && (
                                <div className="pt-2">
                                    <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-1">Audio Events:</p>
                                    <ul className="space-y-1">
                                        {setting.audio_style.audio_events.map((event, i) => (
                                            <li key={i} className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded">
                                                <span className="text-cyan-400">{event.timestamp.toFixed(1)}s</span>: <span className="text-gray-300">{formatSnakeCase(event.event)}</span> (Intensity: {event.intensity}) - {event.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                 {/* Shots Section */}
                {shots && shots.length > 0 && (
                    <div className="pt-4 border-t border-gray-700/50">
                        <h5 className="font-semibold text-gray-300 mb-2 text-base">Shot Analysis</h5>
                        <div className="space-y-2">
                            {shots.map((shot, index) => (
                                <ShotCard key={shot.shot_id} shot={shot} shotNumber={index + 1} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const MentionCard: React.FC<{ mention: MentionItem }> = ({ mention }) => {
    const promotionColor = {
        paid: 'bg-red-900 text-red-300',
        gifted: 'bg-yellow-800 text-yellow-300',
        affiliate: 'bg-purple-900 text-purple-300',
        organic: 'bg-green-900 text-green-300',
        unknown: 'bg-gray-700 text-gray-300'
    }[mention.promotion.status];

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-teal-300">{mention.name}</h4>
                    {mention.category && <p className="text-sm text-gray-400 capitalize">{mention.category}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                    <Badge color={promotionColor}>Promotion: {formatSnakeCase(mention.promotion.status)}</Badge>
                    <Badge>Confidence: {formatSnakeCase(mention.confidence)}</Badge>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h5 className="text-xs text-cyan-400 uppercase font-semibold tracking-wider mb-2">Evidence</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                        {mention.evidence.map((e, i) => <li key={i}>"{e}"</li>)}
                    </ul>
                </div>
                <div>
                    {mention.time_ranges && mention.time_ranges.length > 0 && (
                        <div className="mb-3">
                            <h5 className="text-xs text-cyan-400 uppercase font-semibold tracking-wider mb-2">Time Ranges</h5>
                            <div className="flex flex-wrap gap-1">
                                {mention.time_ranges.map((t, i) => <Badge key={i} color="bg-gray-800 text-gray-300 font-mono">{t[0].toFixed(1)}s - {t[1].toFixed(1)}s</Badge>)}
                            </div>
                        </div>
                    )}
                    
                    <h5 className="text-xs text-cyan-400 uppercase font-semibold tracking-wider mb-2">Sources</h5>
                    <div className="flex flex-wrap gap-1">
                        {mention.sources.map((s, i) => <Badge key={i} color="bg-blue-900/70 text-blue-300">{s}</Badge>)}
                    </div>

                    {mention.promotion.signals.length > 0 && (
                        <div className="mt-3">
                           <h5 className="text-xs text-cyan-400 uppercase font-semibold tracking-wider mb-2">Promotion Signals</h5>
                            <div className="flex flex-wrap gap-1">
                                {mention.promotion.signals.map((s, i) => <Badge key={i} color="bg-yellow-900/70 text-yellow-300 font-mono">{s}</Badge>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MentionsSection: React.FC<{ title: string; mentions?: MentionItem[] }> = ({ title, mentions }) => {
    if (!mentions || mentions.length === 0) {
        return null;
    }
    return (
        <Section title={title}>
            <div className="space-y-4">
                {mentions.map((mention, index) => <MentionCard key={index} mention={mention} />)}
            </div>
        </Section>
    );
};


const VDPDisplay: React.FC<{ vdp: ViralDNProfile }> = ({ vdp }) => {
    return (
        <div className="space-y-5 overflow-y-auto pr-2 -mr-4 flex-grow">
            {/* Metadata Section */}
            <Section title="Metadata">
                <InfoGrid cols={2}>
                    <InfoCard label="View Count" value={vdp.metadata.view_count.toLocaleString()} />
                    <InfoCard label="Like Count" value={vdp.metadata.like_count.toLocaleString()} />
                    <InfoCard label="Comment Count" value={vdp.metadata.comment_count.toLocaleString()} />
                    <InfoCard label="Share Count" value={vdp.metadata.share_count.toLocaleString()} />
                </InfoGrid>
                <InfoGrid cols={2}>
                    <InfoCard label="Content ID" value={<span className="font-mono">{vdp.content_id}</span>} />
                    <InfoCard label="Platform" value={vdp.metadata.platform} />
                </InfoGrid>
                 <InfoGrid cols={2}>
                    <InfoCard label="Video Origin" value={<Badge color={vdp.metadata.video_origin === 'AI-Generated' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}>{vdp.metadata.video_origin}</Badge>} span={1} />
                    <InfoCard label="Upload Date" value={new Date(vdp.metadata.upload_date).toLocaleString()} span={1} />
                </InfoGrid>

                {vdp.metadata.original_sound?.title && (
                    <InfoCard label="Original Sound" value={
                        <>
                            <p>{vdp.metadata.original_sound.title}</p>
                            {vdp.metadata.original_sound.id && <p className="text-xs text-gray-500 font-mono mt-1">{vdp.metadata.original_sound.id}</p>}
                        </>
                    } span={2}/>
                )}

                {vdp.metadata.hashtags.length > 0 && (
                    <div className="pt-2 border-t border-gray-700/50 mt-3">{vdp.metadata.hashtags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
                )}
            </Section>

            {/* Mentions Section */}
            <MentionsSection title="Product Mentions" mentions={vdp.product_mentions} />
            <MentionsSection title="Service Mentions" mentions={vdp.service_mentions} />

            {/* Overall Analysis Section */}
            <Section title="Overall Analysis">
                <InfoCard label="Safety Flags" value={
                     vdp.overall_analysis.safety_flags.length > 0 
                     ? vdp.overall_analysis.safety_flags.map(f => <Badge key={f} color="bg-red-900 text-red-300">{f}</Badge>) 
                     : <span className="text-gray-400 italic">None</span>
                    } span={2} />
                <InfoCard label="Summary" value={<p className="italic leading-relaxed">{vdp.overall_analysis.summary}</p>} span={2} />
                <InfoCard label="Emotional Arc" value={<p className="italic leading-relaxed">{vdp.overall_analysis.emotional_arc}</p>} span={2} />
                
                <ConfidenceDisplay data={vdp.overall_analysis.confidence} />
                <TranscriptDisplay transcript={vdp.overall_analysis.asr_transcript} lang={vdp.overall_analysis.asr_lang} translation={vdp.overall_analysis.asr_translation_en} />
                <OcrDisplay ocrText={vdp.overall_analysis.ocr_text} />
                <AudienceReactionDisplay data={vdp.overall_analysis.audience_reaction} />
                <GraphRefsDisplay data={vdp.overall_analysis.graph_refs} />
            </section>

            {/* Scenes Section */}
            <Section title="Scene-by-Scene Breakdown">
                <div className="space-y-4">
                    {vdp.scenes.map((scene, index) => (
                        <SceneCard key={scene.scene_id} scene={scene} sceneNumber={index + 1} />
                    ))}
                </div>
            </Section>
        </div>
    );
};

export default VDPDisplay;
