'use client';

// --- UI HELPERS ---
const Badge = ({ children, color = 'gray' }: { children: React.ReactNode, color?: string }) => {
  const colors: any = {
    gray: 'bg-white/5 text-gray-400 border-white/10',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const ScoreBar = ({ label, score }: { label: string, score: number }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs mb-2 text-gray-400 font-mono">
      <span>{label}</span>
      <span>{score}/100</span>
    </div>
    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

// --- MAIN DASHBOARD ---
export default function ResultDashboard({ result, onReset }: { result: any, onReset: () => void }) {
  if (result.error) return <div className="text-red-500 text-center mt-10">Analysis Failed. Try again.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER NAV */}
      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <button onClick={onReset} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">← NEW AUDIT</button>
        <div className="flex gap-3">
          <Badge color="blue">{result.meta?.industry || 'Unknown Industry'}</Badge>
          <Badge color="gray">{result.meta?.niche || 'Niche'}</Badge>
        </div>
      </div>

      {/* --- SECTION 1: THE SCORECARD --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* BIG SCORE */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative w-48 h-48 flex items-center justify-center border-4 border-white/5 rounded-full mb-8">
            <div className="text-7xl font-bold text-white font-space tracking-tighter">{result.scores?.overall}</div>
            <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-[spin_3s_linear_infinite] opacity-50"></div>
          </div>
          
          <div className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border ${result.verdict?.status === 'Invisible' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
            {result.verdict?.status}
          </div>
          <p className="text-center text-gray-500 text-sm leading-relaxed max-w-sm">
            {result.verdict?.summary}
          </p>
        </div>

        {/* DETAILED BREAKDOWN */}
        <div className="lg:col-span-7 grid grid-cols-1 gap-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Performance Pillars
            </h3>
            <ScoreBar label="Content Depth (E-E-A-T)" score={result.scores?.content} />
            <ScoreBar label="Domain Authority" score={result.scores?.authority} />
            <ScoreBar label="Technical AEO Schema" score={result.scores?.technical} />
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Market Reality
            </h3>
            <div className="space-y-4">
              {result.competitors?.map((comp: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-gray-300 font-medium">{comp.name}</span>
                  <span className="text-gray-500 font-mono text-xs">Est. Share: {comp.traffic_share}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: THE MISSED OPPORTUNITIES (Triggers) --- */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6 font-space">Answer Engine Triggers <span className="text-gray-600 text-sm font-sans font-normal ml-3">(Questions you are ignoring)</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.missed_opportunities?.map((opp: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-[#0F0F0F] border border-red-500/20 hover:border-red-500/40 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-red-500 text-xl group-hover:scale-110 transition-transform">?</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-600 border border-white/10 px-2 py-1 rounded">{opp.volume} Vol</span>
              </div>
              <p className="text-white font-medium leading-snug">"{opp.question}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECTION 3: THE STRATEGIC ROADMAP --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 font-space">Strategic Recovery Plan</h3>
        <div className="space-y-4">
          {result.roadmap?.map((step: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-green-500/30 transition-all">
              <div className="min-w-[120px]">
                <div className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2 ${step.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  {step.difficulty} Fix
                </div>
                <div className="text-xs text-gray-500 font-mono">Impact: {step.impact}</div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}