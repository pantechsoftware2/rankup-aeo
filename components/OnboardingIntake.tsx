'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Zap } from 'lucide-react';

interface OnboardingIntakeProps {
  onSubmit?: (prompts: string[]) => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function OnboardingIntake({ 
  onSubmit: onSubmitCallback, 
  isSubmitting: externalIsSubmitting 
}: OnboardingIntakeProps) {
  const [prompts, setPrompts] = useState<string[]>(Array(10).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use external submitting state if provided, otherwise use internal
  const submitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty prompts
    const filledPrompts = prompts.filter(p => p.trim().length > 0);
    
    if (filledPrompts.length === 0) {
      alert('Please enter at least one prompt, keyword, or question.');
      return;
    }

    // If external callback is provided, use it (AuditConversionFlow)
    if (onSubmitCallback) {
      await onSubmitCallback(filledPrompts);
    } else {
      // Otherwise, use default standalone behavior
      setIsSubmitting(true);
      
      // Mock submission - replace with actual API call
      console.log('Submitting prompts:', filledPrompts);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual submission logic
      alert(`Success! Starting optimization for ${filledPrompts.length} prompts. You'll receive updates via email.`);
      
      setIsSubmitting(false);
    }
  };

  const filledCount = prompts.filter(p => p.trim().length > 0).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            <Target className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white font-space mb-4">
          Let's Optimize Your Visibility
        </h1>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
          Tell us what you want to rank for. Enter up to 10 prompts, keywords, or questions that matter most to your business.
        </p>

        {/* Progress Indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">
            <span className="font-bold text-green-400">{filledCount}</span> of 10 prompts added
          </span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      >
        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-300 mb-1">
                Pro Tip: Be Specific
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Examples: "best telemedicine platform for seniors", "how to choose virtual healthcare provider", 
                "telehealth vs in-person visits"
              </p>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 mb-8">
          {prompts.map((prompt, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400 font-mono">
                    {index + 1}
                  </span>
                </div>
                
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => handlePromptChange(index, e.target.value)}
                  placeholder={`Enter prompt, keyword, or question ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
                  required={index === 0}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alternative: Text Area Option (commented out) */}
        {/* 
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-300 mb-3">
            Enter Your Target Prompts (one per line)
          </label>
          <textarea
            value={prompts.join('\n')}
            onChange={(e) => setPrompts(e.target.value.split('\n'))}
            placeholder="Enter prompts, one per line..."
            rows={12}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm resize-none"
          />
        </div>
        */}

        {/* Submit Button */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={submitting || filledCount === 0}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-base font-bold uppercase tracking-wider transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Start Optimization (2 Week Project)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-500">
            Our team will analyze these prompts and begin optimizing your content within 24 hours.
          </p>
        </div>

        {/* What Happens Next */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="text-sm font-bold text-white mb-4 font-space">
            What Happens Next?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-green-400">1</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Analysis</p>
                <p className="text-xs text-gray-500">We analyze your prompts and competitive landscape</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Strategy</p>
                <p className="text-xs text-gray-500">Receive a custom roadmap with weekly milestones</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-yellow-400">3</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Execution</p>
                <p className="text-xs text-gray-500">Track progress in real-time through your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
