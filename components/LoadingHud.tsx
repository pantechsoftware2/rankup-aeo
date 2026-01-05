'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  "Initializing Neural Link...",
  "Resolving Domain Architecture...",
  "Extracting Semantic Entities...",
  "Evaluating E-E-A-T Signals...",
  "Cross-Referencing Knowledge Graphs...",
  "Synthesizing Strategic Verdict..."
];

export default function LoadingHud() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200); // Changes text every 1.2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-8 rounded-2xl bg-black/50 border border-rankup/30 backdrop-blur-xl relative overflow-hidden">
      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-rankup/50 shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-[scan_2s_linear_infinite]"></div>

      <div className="font-mono text-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <span className="text-gray-400">STATUS: <span className="text-rankup animate-pulse">PROCESSING</span></span>
          <span className="text-gray-600">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>

        {STEPS.map((step, index) => (
          <div key={index} className={`flex items-center gap-3 transition-all duration-500 ${index > currentStep ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
            <span className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-yellow-400 animate-ping' : index < currentStep ? 'bg-rankup' : 'bg-gray-600'}`}></span>
            <span className={index === currentStep ? 'text-white font-bold' : index < currentStep ? 'text-green-400' : 'text-gray-500'}>
              {step}
            </span>
            {index < currentStep && <span className="ml-auto text-rankup text-xs">[OK]</span>}
          </div>
        ))}
      </div>
      
      {/* Technical Footer */}
      <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-gray-600 font-mono flex justify-between">
        <span>CPU: {(Math.random() * 40 + 20).toFixed(1)}%</span>
        <span>MEM: {(Math.random() * 200 + 100).toFixed(0)}MB</span>
        <span>LATENCY: 14ms</span>
      </div>
    </div>
  );
}