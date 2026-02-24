import React, { useState } from 'react';
import { 
  Image, Video, Smile, Sparkles, Loader2, Download, RefreshCw,
  Palette, Type, Layout, Maximize2, Play, Film, Mic, Music,
  Target, Zap, MessageSquare, Hash, Copy, Check, ArrowRight, HardDrive,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToDrive } from '@/lib/driveHelpers';

type CreationMode = 'graphic' | 'video' | 'viral';

const SAMPLE_OUTPUTS = [
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563941199_21427e63.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563938268_03b004e1.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563940172_48f4cbe3.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563939369_15c313ca.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563947712_097ec7c0.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6988a8674195f0e572ee4f0d_1770563941900_a2f22e1e.jpg',
];

const CreationStudio: React.FC = () => {
  const { driveConnected } = useAuth();
  const [mode, setMode] = useState<CreationMode>('graphic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);
  const [driveError, setDriveError] = useState('');

  // Graphic mode state
  const [graphicTopic, setGraphicTopic] = useState('');
  const [graphicStyle, setGraphicStyle] = useState('Modern');
  const [graphicSize, setGraphicSize] = useState('1:1 Square');
  const [graphicPalette, setGraphicPalette] = useState('Vibrant');

  // Video mode state
  const [videoGoal, setVideoGoal] = useState('Sell');
  const [videoPlatform, setVideoPlatform] = useState('TikTok');
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [videoTopic, setVideoTopic] = useState('');

  // Viral mode state
  const [viralFormat, setViralFormat] = useState('Classic Meme');
  const [viralIndustry, setViralIndustry] = useState('');
  const [viralTone, setViralTone] = useState('Funny');

  const modes = [
    { id: 'graphic', icon: Image, label: 'Graphic Design', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    { id: 'video', icon: Video, label: 'Video / Ad', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { id: 'viral', icon: Smile, label: 'Viral Content', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      let prompt = '';
      let task = 'brainstorm';

      if (mode === 'graphic') {
        task = 'brainstorm';
        prompt = `Create a ${graphicStyle} style graphic design concept for: "${graphicTopic}". Size: ${graphicSize}. Color palette: ${graphicPalette}. Provide: headline text, subtext, visual description, color codes, font suggestions, and layout direction.`;
      } else if (mode === 'video') {
        task = 'script';
        prompt = `Create a ${videoStyle} style ${videoPlatform} video script for the goal of "${videoGoal}". Topic: "${videoTopic}". Include: hook, scene breakdown with visual directions, voiceover script, captions, and hashtags.`;
      } else {
        task = 'brainstorm';
        prompt = `Create viral ${viralFormat} content for the ${viralIndustry} industry. Tone: ${viralTone}. Generate: 3 meme concepts, 2 skit scripts, trending format adaptations, and caption suggestions.`;
      }

      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: { task, prompt }
      });

      if (data?.result) {
        setGeneratedContent(data.result);
      } else if (data?.raw) {
        setGeneratedContent({ raw: data.raw });
      } else {
        // Demo content
        setGeneratedContent({
          raw: mode === 'video' 
            ? `**Video Script: ${videoTopic || 'Product Launch'}**\n\n**Hook (0-3s):** "Stop scrolling — this changes everything"\n\n**Scene 1 (3-8s):**\nVisual: Close-up of the problem\nVO: "You've been doing it wrong this whole time..."\n\n**Scene 2 (8-18s):**\nVisual: Product reveal with dramatic lighting\nVO: "Meet the solution that 10,000+ businesses trust"\n\n**Scene 3 (18-25s):**\nVisual: Results/transformation montage\nVO: "In just 30 days, see the difference"\n\n**CTA (25-30s):**\nVisual: Logo + link\nVO: "Start your free trial today"\n\n**Hashtags:** #marketing #business #growth #viral`
            : mode === 'viral'
            ? `**Viral Content Pack: ${viralIndustry || 'Business'}**\n\n**Meme 1:** "POV: You finally automated your content creation"\n[Image: Person relaxing while AI does the work]\n\n**Meme 2:** "My competitors watching me post 10x more content"\n[Image: Shocked face meme]\n\n**Skit Script:**\nScene: Business owner struggling with design tools\nTwist: Discovers AI creative factory\nPunchline: "Why didn't I find this sooner?"\n\n**Trending Format:** Use the "Day in my life" format showing content creation workflow`
            : `**Graphic Design Concept: ${graphicTopic || 'Brand Campaign'}**\n\n**Headline:** "Transform Your Brand Story"\n**Subtext:** "AI-powered creative that converts"\n\n**Visual Direction:**\n- ${graphicStyle} aesthetic with clean lines\n- ${graphicPalette} color palette\n- Bold typography hierarchy\n- Centered composition with breathing room\n\n**Colors:** #6366f1, #ec4899, #0ea5e9\n**Font:** Inter Bold + Inter Regular`
        });
      }
    } catch (err) {
      // Fallback demo
      setGeneratedContent({
        raw: `**Generated ${mode === 'graphic' ? 'Design' : mode === 'video' ? 'Script' : 'Content'} Concept**\n\nYour AI-generated content will appear here. Connect your API key for live generation.\n\n**Preview:** Using demo content for illustration.`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = () => {
    const text = generatedContent?.raw || JSON.stringify(generatedContent, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToDrive = async () => {
    if (!generatedContent || !driveConnected) return;
    setSavingToDrive(true);
    setDriveError('');
    setDriveSaved(false);

    try {
      const content = generatedContent.raw || JSON.stringify(generatedContent, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const typeLabel = mode === 'graphic' ? 'design' : mode === 'video' ? 'script' : 'viral';
      const topic = mode === 'graphic' ? graphicTopic : mode === 'video' ? videoTopic : viralIndustry;
      const fileName = `redface-${typeLabel}-${topic ? topic.replace(/\s+/g, '-').toLowerCase().slice(0, 30) + '-' : ''}${timestamp}.md`;

      await uploadToDrive(fileName, content, 'text/markdown');
      setDriveSaved(true);
      setTimeout(() => setDriveSaved(false), 3000);
    } catch (err: any) {
      setDriveError(err.message || 'Failed to save to Drive');
      setTimeout(() => setDriveError(''), 5000);
    } finally {
      setSavingToDrive(false);
    }
  };



  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header with mode tabs */}
      <div className="p-6 border-b border-gray-800/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Creation Studio
        </h2>
        <div className="flex gap-2">
          {modes.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id as CreationMode); setGeneratedContent(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === m.id
                    ? `${m.bg} ${m.color} border ${m.border}`
                    : 'bg-gray-800/30 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800/50">
        {/* Input panel */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Configuration</h3>

          {mode === 'graphic' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Topic / Product</label>
                <input
                  type="text"
                  value={graphicTopic}
                  onChange={(e) => setGraphicTopic(e.target.value)}
                  placeholder="e.g. Summer sale banner, Product launch poster"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Style</label>
                  <select value={graphicStyle} onChange={(e) => setGraphicStyle(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['Modern', 'Minimalist', 'Bold', 'Vintage', 'Playful', '3D', 'Flat'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Size</label>
                  <select value={graphicSize} onChange={(e) => setGraphicSize(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['1:1 Square', '16:9 Landscape', '9:16 Portrait', '4:5 Instagram', '1200x628 Facebook'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Color Palette</label>
                <div className="flex gap-2">
                  {['Vibrant', 'Pastel', 'Dark', 'Monochrome', 'Warm', 'Cool'].map(p => (
                    <button
                      key={p}
                      onClick={() => setGraphicPalette(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        graphicPalette === p ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30' : 'bg-gray-800/30 text-gray-500 border border-gray-700/30'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'video' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Topic / Product</label>
                <input
                  type="text"
                  value={videoTopic}
                  onChange={(e) => setVideoTopic(e.target.value)}
                  placeholder="e.g. New product launch, Service explainer"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Goal</label>
                  <select value={videoGoal} onChange={(e) => setVideoGoal(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['Sell', 'Educate', 'Entertain', 'Announce', 'Inspire'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform</label>
                  <select value={videoPlatform} onChange={(e) => setVideoPlatform(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['TikTok', 'Instagram Reels', 'YouTube Shorts', 'YouTube', 'Facebook'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Style</label>
                  <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['Cinematic', 'UGC', 'Animation', 'Meme', 'Professional', 'Documentary'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {mode === 'viral' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Industry / Niche</label>
                <input
                  type="text"
                  value={viralIndustry}
                  onChange={(e) => setViralIndustry(e.target.value)}
                  placeholder="e.g. fitness, tech, food, fashion"
                  className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Format</label>
                  <select value={viralFormat} onChange={(e) => setViralFormat(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['Classic Meme', 'Reaction', 'Skit Script', 'Tweet Style', 'Relatable', 'POV'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Tone</label>
                  <select value={viralTone} onChange={(e) => setViralTone(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
                    {['Funny', 'Sarcastic', 'Wholesome', 'Edgy', 'Relatable', 'Absurd'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {mode === 'graphic' ? 'Design' : mode === 'video' ? 'Script' : 'Content'}
              </>
            )}
          </button>
        </div>

        {/* Output panel */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Output</h3>
            {generatedContent && (
              <div className="flex gap-2">
                <button onClick={copyContent} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 text-xs hover:text-white transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleGenerate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 text-xs hover:text-white transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            )}
          </div>

          {generatedContent ? (
            <div className="space-y-4">
              {/* Preview images */}
              {mode === 'graphic' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {SAMPLE_OUTPUTS.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-gray-800/50 group cursor-pointer">
                      <img src={img} alt={`Generated ${i + 1}`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text content */}
              <div className="bg-gray-800/20 rounded-xl border border-gray-800/30 p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {generatedContent.raw || JSON.stringify(generatedContent, null, 2)}
                </pre>
              </div>

              {/* Drive save feedback */}
              {driveError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {driveError}
                </div>
              )}
              {driveSaved && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" /> Saved to Google Drive!
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveToDrive}
                  disabled={savingToDrive || !driveConnected}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    driveConnected
                      ? 'bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30'
                      : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!driveConnected ? 'Connect Google Drive in Settings first' : 'Save to Google Drive'}
                >
                  {savingToDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                  {savingToDrive ? 'Saving...' : driveSaved ? 'Saved!' : driveConnected ? 'Save to Drive' : 'Drive Not Connected'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Use in Workflow
                </button>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                {isGenerating ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-400">AI is creating your content...</p>
                    <div className="flex justify-center gap-1 mt-3">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
                      {mode === 'graphic' ? <Image className="w-6 h-6 text-gray-600" /> : mode === 'video' ? <Video className="w-6 h-6 text-gray-600" /> : <Smile className="w-6 h-6 text-gray-600" />}
                    </div>
                    <p className="text-sm text-gray-500">Configure and generate to see results</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreationStudio;
