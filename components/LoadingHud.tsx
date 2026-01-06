'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  "Initializing Neural Link...",          // 0ms
  "Resolving Domain Architecture...",     // 1000ms
  "Extracting Semantic Entities...",      // 2500ms
  "Evaluating E-E-A-T Signals...",        // 4500ms
  "Cross-Referencing Knowledge Graphs...",// 7500ms
  "Synthesizing Strategic Verdict..."     // 11000ms
];

export default function LoadingHud() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // TIMELINE: How long to wait *after* each step before showing the next one.
    // We space out the early steps so the user can actually read them.
    const timeline = [
      1200,  // Step 0 -> 1 (Wait 1.2s)
      1800,  // Step 1 -> 2 (Wait 1.8s)
      2500,  // Step 2 -> 3 (Wait 2.5s - slowing down)
      3000,  // Step 3 -> 4 (Deep thinking)
      3500,  // Step 4 -> 5 (Deep thinking)
      999999 // Step 5 stays until the API responds
    ];

    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= timeline.length - 1) return;
      
      setTimeout(() => {
        stepIndex++;
        setCurrentStep(stepIndex);
        runStep();
      }, timeline[stepIndex]);
    };

    runStep();

    return () => {}; 
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-lg p-1 bg-[#0F0F0F] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Scan Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/50 shadow-[0_0_20px_#22c55e] animate-[scan_2s_ease-in-out_infinite]"></div>

        <div className="p-8 font-mono text-xs relative z-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <span className="text-gray-500">STATUS: <span className="text-green-400 animate-pulse">PROCESSING</span></span>
            <span className="text-gray-700">ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className={`flex justify-between items-center transition-all duration-500 ${i > currentStep ? 'opacity-20 blur-[1px]' : i === currentStep ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-green-500 animate-ping' : i < currentStep ? 'bg-green-900' : 'bg-gray-800'}`}></span>
                  <span className={i === currentStep ? 'text-white font-bold' : 'text-gray-500'}>{step}</span>
                </div>
                {i < currentStep && <span className="text-green-500">[OK]</span>}
                {i === currentStep && <span className="text-green-500/50 animate-pulse">...</span>}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between text-[10px] text-gray-700 pt-4 border-t border-white/5">
            <span>CPU: {Math.floor(Math.random() * 30) + 30}.7%</span>
            <span>MEM: 204MB</span>
            <span>LATENCY: 14ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}