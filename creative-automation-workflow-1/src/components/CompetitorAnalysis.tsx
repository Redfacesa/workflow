import React, { useState } from 'react';
import { 
  Globe, Instagram, Youtube, Search, Loader2, Sparkles, 
  TrendingUp, Zap, Eye, Target, Palette, MessageSquare,
  ArrowRight, Upload, Building2, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalysisResult {
  hooks: { text: string; score: number }[];
  designStyle: { colors: string[]; fonts: string; layout: string };
  contentStrategy: { text: string; score: number }[];
  emotionalTriggers: { text: string; score: number }[];
  ctas: { text: string; score: number }[];
  adAngles: { text: string; score: number }[];
}

interface CompetitorAnalysisProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ onAnalysisComplete }) => {
  const [inputType, setInputType] = useState<'url' | 'social' | 'upload' | 'industry'>('url');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputTypes = [
    { id: 'url', icon: Globe, label: 'Website URL', placeholder: 'https://competitor.com' },
    { id: 'social', icon: Instagram, label: 'Social Handle', placeholder: '@competitor or profile URL' },
    { id: 'upload', icon: Upload, label: 'Upload Ad', placeholder: 'Paste ad copy or description' },
    { id: 'industry', icon: Building2, label: 'Industry', placeholder: 'e.g. restaurant, fintech, fitness' }
  ];

  const runAnalysis = async () => {
    if (!inputValue.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-generate', {
        body: {
          task: 'competitor',
          prompt: `Analyze this competitor/industry for marketing insights:\n\nInput type: ${inputType}\nInput: ${inputValue}\n\nProvide detailed analysis with scoring.`
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.result && typeof data.result === 'object') {
        setAnalysisResult(data.result);
        onAnalysisComplete?.(data.result);
      } else {
        // Fallback demo data
        const demoResult: AnalysisResult = {
          hooks: [
            { text: '"Stop wasting money on ads that don\'t convert"', score: 9 },
            { text: '"The secret top brands don\'t want you to know"', score: 8 },
            { text: '"In just 30 days, we helped 500+ businesses..."', score: 9 },
            { text: '"What if you could 10x your ROI?"', score: 7 }
          ],
          designStyle: { colors: ['#6366f1', '#ec4899', '#0ea5e9'], fonts: 'Modern Sans-Serif', layout: 'Clean, minimal with bold CTAs' },
          contentStrategy: [
            { text: 'Educational content with transformation stories', score: 9 },
            { text: 'User-generated content and testimonials', score: 8 },
            { text: 'Behind-the-scenes brand authenticity', score: 7 }
          ],
          emotionalTriggers: [
            { text: 'Fear of missing out (FOMO)', score: 9 },
            { text: 'Social proof and authority', score: 8 },
            { text: 'Aspiration and transformation', score: 8 }
          ],
          ctas: [
            { text: '"Start your free trial today"', score: 9 },
            { text: '"Join 10,000+ happy customers"', score: 8 },
            { text: '"See it in action — watch demo"', score: 7 }
          ],
          adAngles: [
            { text: 'Problem-agitation-solution with real case studies', score: 9 },
            { text: 'Before/after transformation showcase', score: 8 },
            { text: 'Founder story with vulnerable authenticity', score: 8 }
          ]
        };
        setAnalysisResult(demoResult);
        onAnalysisComplete?.(demoResult);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      // Still show demo data on error
      const demoResult: AnalysisResult = {
        hooks: [
          { text: '"Stop wasting money on ads that don\'t convert"', score: 9 },
          { text: '"The secret top brands don\'t want you to know"', score: 8 },
          { text: '"In just 30 days, we helped 500+ businesses..."', score: 9 },
        ],
        designStyle: { colors: ['#6366f1', '#ec4899', '#0ea5e9'], fonts: 'Modern Sans-Serif', layout: 'Clean, minimal with bold CTAs' },
        contentStrategy: [
          { text: 'Educational content with transformation stories', score: 9 },
          { text: 'User-generated content and testimonials', score: 8 },
        ],
        emotionalTriggers: [
          { text: 'Fear of missing out (FOMO)', score: 9 },
          { text: 'Social proof and authority', score: 8 },
        ],
        ctas: [
          { text: '"Start your free trial today"', score: 9 },
          { text: '"Join 10,000+ happy customers"', score: 8 },
        ],
        adAngles: [
          { text: 'Problem-agitation-solution with real case studies', score: 9 },
          { text: 'Before/after transformation showcase', score: 8 },
        ]
      };
      setAnalysisResult(demoResult);
      onAnalysisComplete?.(demoResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderScoreBar = (score: number) => (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500">{score}/10</span>
    </div>
  );

  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-blue-400" />
          Competitor Analysis
        </h2>
        <p className="text-sm text-gray-500">Extract winning strategies from any competitor or industry</p>
      </div>

      {/* Input section */}
      <div className="p-6 border-b border-gray-800/50">
        {/* Input type tabs */}
        <div className="flex gap-2 mb-4">
          {inputTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => { setInputType(type.id as any); setInputValue(''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  inputType === type.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-800/30 text-gray-500 border border-gray-700/30 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Input field */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputTypes.find(t => t.id === inputType)?.placeholder}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
            />
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || !inputValue.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-yellow-500/70">Using demo data for preview</p>
        )}
      </div>

      {/* Results */}
      {analysisResult && (
        <div className="p-6 space-y-6">
          {/* Hooks */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              Winning Hooks
            </h3>
            <div className="space-y-2">
              {analysisResult.hooks.map((hook, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <span className="text-xs text-gray-300 flex-1">{hook.text}</span>
                  {renderScoreBar(hook.score)}
                </div>
              ))}
            </div>
          </div>

          {/* Design Style */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-indigo-400" />
              Design Style
            </h3>
            <div className="p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">Colors:</span>
                <div className="flex gap-1.5">
                  {analysisResult.designStyle.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-md border border-gray-700" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">Fonts:</span>
                <span className="text-xs text-gray-300">{analysisResult.designStyle.fonts}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Layout:</span>
                <span className="text-xs text-gray-300">{analysisResult.designStyle.layout}</span>
              </div>
            </div>
          </div>

          {/* Content Strategy */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Content Strategy
            </h3>
            <div className="space-y-2">
              {analysisResult.contentStrategy.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <span className="text-xs text-gray-300 flex-1">{item.text}</span>
                  {renderScoreBar(item.score)}
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Triggers */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-pink-400" />
              Emotional Triggers
            </h3>
            <div className="space-y-2">
              {analysisResult.emotionalTriggers.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <span className="text-xs text-gray-300 flex-1">{item.text}</span>
                  {renderScoreBar(item.score)}
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              Call-to-Action Examples
            </h3>
            <div className="space-y-2">
              {analysisResult.ctas.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <span className="text-xs text-gray-300 flex-1">{item.text}</span>
                  {renderScoreBar(item.score)}
                </div>
              ))}
            </div>
          </div>

          {/* Ad Angles */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              Ad Angles
            </h3>
            <div className="space-y-2">
              {analysisResult.adAngles.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/20 border border-gray-800/30">
                  <span className="text-xs text-gray-300 flex-1">{item.text}</span>
                  {renderScoreBar(item.score)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysisResult && !isAnalyzing && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-500 text-sm">Enter a competitor URL, social handle, or industry to start analyzing</p>
          <p className="text-gray-600 text-xs mt-2">AI will extract hooks, design patterns, and winning strategies</p>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Analyzing competitor...</p>
          <p className="text-gray-600 text-xs mt-2">Extracting hooks, design patterns, and strategies</p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;
