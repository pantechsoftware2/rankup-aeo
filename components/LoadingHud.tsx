'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  "Scanning Google Search Results...",        // 0ms
  "Analyzing Competitor Keywords...",         // 3000ms (3s)
  "Detecting Regulatory Flags...",            // 6000ms (6s)
  "Compiling AEO Score...",                   // 9000ms (9s)
  "Cross-Referencing Citation Sources...",    // 12000ms (12s)
  "Generating Content Opportunities..."       // 15000ms (15s)
];

export default function LoadingHud() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Progress through steps every 3 seconds for 15-30 second analysis
    const timeline = [
      3000,  // Step 0 -> 1: Scanning complete
      3000,  // Step 1 -> 2: Competitor analysis
      3000,  // Step 2 -> 3: Regulatory detection
      3000,  // Step 3 -> 4: AEO scoring
      3000,  // Step 4 -> 5: Citation analysis
      3000   // Step 5 -> Complete: Content strategy
    ];

    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= timeline.length) return;
      
      setTimeout(() => {
        stepIndex++;
        // Safety check to prevent index out of bounds
        if (stepIndex < STEPS.length) {
            setCurrentStep(stepIndex);
            runStep();
        }
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