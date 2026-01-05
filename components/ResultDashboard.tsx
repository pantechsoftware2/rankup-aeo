'use client';

// Note: In a real app we'd use Chart.js, but for simplicity/speed we'll build custom CSS bars to keep it zero-dependency.

// --- UI COMPONENTS ---

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score > 75 ? '#4ade80' : score > 40 ? '#facc15' : '#f87171';

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r={radius} stroke="#333" strokeWidth="8" fill="transparent" />
        <circle cx="50%" cy="50%" r={radius} stroke={color} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold font-space text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">AEO Score</span>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

export default function ResultDashboard({ result, onReset }: { result: any, onReset: () => void }) {
  if (result.error) return (
    <div className="w-full max-w-lg mx-auto mt-10 p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center">
      <h3 className="text-red-400 font-bold mb-2">Analysis Failed</h3>
      <p className="text-gray-400 text-sm mb-4">{result.details}</p>
      <button onClick={onReset} className="px-4 py-2 bg-red-500/20 text-white rounded text-xs uppercase">Try Again</button>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* HEADER NAV */}
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <button onClick={onReset} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">← NEW AUDIT</button>
        <div className="flex gap-4">
          <span className="text-xs font-mono text-gray-600">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
          <span className="text-xs font-mono text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE</span>
        </div>
      </div>

      {/* --- ROW 1: THE SNAPSHOT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* SCORE CARD */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <ScoreRing score={result.score} />
          <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-300">
            {result.verdict}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6 leading-relaxed px-4">{result.summary}</p>
        </div>

        {/* VISIBILITY & SENTIMENT */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* VISIBILITY RANK */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">AI Visibility Rank</h4>
              <p className="text-gray-600 text-[10px] mb-6">Estimated position in answer engine results.</p>
              <div className="text-6xl font-space font-bold text-white mb-2">#{result.visibilityRank}</div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-rankup transition-all duration-1000" style={{ width: `${Math.max(5, 100 - (result.visibilityRank * 4))}%` }}></div>
              </div>
            </div>
          </div>

          {/* SENTIMENT BREAKDOWN */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
             <h4 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-6">Sentiment Analysis</h4>
             
             <div className="mb-6">
               <div className="flex justify-between text-xs mb-2 text-gray-300">
                 <span>Positive</span>
                 <span>{result.sentiment?.positive}%</span>
               </div>
               <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500" style={{ width: `${result.sentiment?.positive}%` }}></div>
               </div>
             </div>

             <div className="mb-8">
               <div className="flex justify-between text-xs mb-2 text-gray-300">
                 <span>Negative / Neutral</span>
                 <span>{result.sentiment?.negative}%</span>
               </div>
               <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500" style={{ width: `${result.sentiment?.negative}%` }}></div>
               </div>
             </div>

             <div className="space-y-2">
               {result.sentimentBreakdown?.map((item: string, i: number) => (
                 <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                   <span className="text-red-500 mt-0.5">✕</span> {item}
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>

      {/* --- ROW 2: COMPETITIVE LANDSCAPE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* COMPETITOR SHARE */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
          <h4 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-8">Share of Voice (Competitors)</h4>
          <div className="space-y-6">
            {result.competitors?.map((comp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-gray-300 mb-2 font-medium">
                  <span>{i + 1}. {comp.name}</span>
                  <span>{comp.visibility}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${comp.visibility}%` }}></div>
                </div>
              </div>
            ))}
            {/* YOU */}
            <div className="mt-8 pt-4 border-t border-white/10">
               <div className="flex justify-between text-sm text-white mb-2 font-bold">
                  <span>You (Current)</span>
                  <span>{result.score / 2}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${result.score / 2}%` }}></div>
                </div>
            </div>
          </div>
        </div>

        {/* CITATION SOURCES */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
          <h4 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-8">Top Cited Sources in Niche</h4>
          <div className="flex flex-col gap-4">
             {result.citationSources?.map((source: any, i: number) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                 <span className="text-sm text-gray-300">{source.name}</span>
                 <span className="text-xs font-mono text-green-400">{source.percentage}% Share</span>
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* --- ROW 3: CONTENT ROADMAP --- */}
      <h3 className="text-xl font-bold text-white mb-6 font-space mt-12">Generative Content Roadmap</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {result.contentRoadmap?.map((item: any, i: number) => (
          <div key={i} className="group p-6 rounded-3xl bg-[#0F0F0F] border border-white/10 hover:border-green-500/50 transition-all duration-300">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-400 mb-4 uppercase tracking-wider group-hover:bg-green-500/10 group-hover:text-green-400 transition-colors">
              {item.type}
            </div>
            <h4 className="text-lg font-bold text-white mb-3 leading-tight">{item.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            <div className="mt-6 flex items-center text-green-500 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Generate Draft →
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}