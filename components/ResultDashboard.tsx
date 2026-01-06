'use client';

// --- UI HELPERS ---

const Badge = ({ children, color = 'gray' }: { children: React.ReactNode, color?: string }) => {
  const colors: any = {
    gray: 'bg-white/5 text-gray-400 border-white/10',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// CLEANER FUNCTION: Turns "COULD NOT BE DETERMINED..." into "UNDEFINED"
const cleanText = (text: string) => {
  if (!text) return "UNKNOWN";
  const upper = text.toUpperCase();
  if (upper.includes("COULD NOT") || upper.includes("EMPTY") || upper.includes("UNDEFINED")) return "UNDEFINED";
  if (upper.includes("MISSING")) return "MISSING DATA";
  return text;
};

const LoadingBar = () => (
  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1s_infinite] -translate-x-full"></div>
  </div>
);

const ScoreBar = ({ label, score, subLabel }: { label: string, score: number | undefined, subLabel?: string }) => (
  <div className="mb-5">
    <div className="flex justify-between items-end mb-2">
      <div className="flex flex-col">
        <span className="text-xs text-gray-300 font-bold font-space">{label}</span>
        {subLabel && <span className="text-[10px] text-gray-500 mt-0.5">{subLabel}</span>}
      </div>
      <span className="text-xs text-gray-400 font-mono">{score !== undefined ? `${score}/100` : '...'}</span>
    </div>
    {score !== undefined ? (
      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    ) : <LoadingBar />}
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---

export default function ResultDashboard({ result, onReset }: { result: any, onReset: () => void }) {
  
  if (result.error) return (
    <div className="w-full max-w-lg mx-auto mt-20 p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center animate-in fade-in zoom-in duration-300">
      <h3 className="text-red-400 font-bold mb-2 uppercase tracking-widest text-xs">System Error</h3>
      <p className="text-white font-mono text-sm mb-6 bg-black/50 p-4 rounded border border-white/5">
        {result.details || "Unknown Error Occurred"}
      </p>
      <button 
        onClick={onReset} 
        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs uppercase font-bold tracking-wider transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
      >
        Try Again
      </button>
    </div>
  );

  const isDeepLoading = !result.scores;
  const industry = cleanText(result.meta?.industry);
  const niche = cleanText(result.meta?.niche);

  // Determine Badge Colors based on the "Cleaned" text
  const industryColor = industry === "UNDEFINED" ? "red" : "blue";
  const nicheColor = niche === "UNDEFINED" ? "red" : "gray";

  return (
    <div className="w-full max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER NAV */}
      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <button onClick={onReset} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">← NEW AUDIT</button>
        <div className="flex gap-3">
          <Badge color={industryColor}>{industry}</Badge>
          <Badge color={nicheColor}>{niche}</Badge>
          {isDeepLoading && <Badge color="green">ANALYZING STRATEGY...</Badge>}
        </div>
      </div>

      {/* --- SECTION 1: THE SCORECARD --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* BIG SCORE RING */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative w-48 h-48 flex items-center justify-center border-4 border-white/5 rounded-full mb-8">
            {isDeepLoading ? (
               <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
            ) : (
               <>
                 <div className="text-7xl font-bold text-white font-space tracking-tighter animate-in zoom-in duration-500">{result.scores?.overall}</div>
                 <div className="absolute inset-0 border-4 border-t-green-500 rounded-full opacity-50"></div>
               </>
            )}
          </div>
          
          <div className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border bg-white/5 text-gray-300 border-white/10">
            {result.verdict?.status || "CALCULATING..."}
          </div>
          <p className="text-center text-gray-500 text-sm leading-relaxed max-w-sm">
            {result.verdict?.summary || "Our AI is currently stress-testing your content against industry leaders..."}
          </p>
        </div>

        {/* DETAILED BREAKDOWN */}
        <div className="lg:col-span-7 grid grid-cols-1 gap-6">
          
          {/* PILLARS */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Performance Pillars
            </h3>
            <ScoreBar 
              label="Content Depth (E-E-A-T)" 
              subLabel="Experience, Expertise, Authoritativeness, Trustworthiness"
              score={result.scores?.content} 
            />
            <ScoreBar label="Domain Authority" score={result.scores?.authority} />
            <ScoreBar label="Technical AEO Schema" score={result.scores?.technical} />
          </div>

          {/* MARKET REALITY */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Market Reality
            </h3>

            {/* CLARITY WARNING */}
            {result.clarity_audit && !result.clarity_audit.is_clear && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex flex-col md:flex-row gap-3 items-start animate-in slide-in-from-left duration-700">
                <div className="p-1.5 bg-yellow-500/10 rounded-lg shrink-0">
                  <span className="text-yellow-500 text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-1">Clarity Warning</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {result.clarity_audit.critique || "We identified your true category via metadata, but your homepage text is too vague."}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {result.competitors?.map((comp: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5 border border-white/5 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-gray-300 font-medium">{comp.name}</span>
                  <span className="text-gray-500 font-mono text-xs">Est. Share: {comp.traffic_share}%</span>
                </div>
              ))}
              {!result.competitors && <div className="text-gray-500 text-xs italic">Identifying competitors...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: MISSED OPPORTUNITIES --- */}
      {!isDeepLoading && result.missed_opportunities && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
          <h3 className="text-xl font-bold text-white mb-6 font-space">Answer Engine Triggers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.missed_opportunities.map((opp: any, i: number) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0F0F0F] border border-red-500/20 hover:border-red-500/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-red-500 text-xl">?</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-600 border border-white/10 px-2 py-1 rounded">{opp.volume} Vol</span>
                </div>
                <p className="text-white font-medium leading-snug">"{opp.question}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 3: ROADMAP --- */}
      {!isDeepLoading && result.roadmap && (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <h3 className="text-xl font-bold text-white mb-6 font-space">Strategic Recovery Plan</h3>
          <div className="space-y-4">
            {result.roadmap.map((step: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-green-500/30 transition-all">
                <div className="min-w-[120px]">
                  <div className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2 ${step.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {step.difficulty} Fix
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}