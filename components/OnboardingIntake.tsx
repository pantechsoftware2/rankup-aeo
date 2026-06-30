'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Zap, ShieldCheck } from 'lucide-react';

export interface OnboardingIntakePayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  keywords: string[];
}

interface OnboardingIntakeProps {
  onSubmit?: (payload: OnboardingIntakePayload) => void | Promise<void>;
  isSubmitting?: boolean;
  headingAs?: 'h1' | 'h2';
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isLikelyValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 7;

export default function OnboardingIntake({
  onSubmit: onSubmitCallback,
  isSubmitting: externalIsSubmitting,
  headingAs: Heading = 'h1',
}: OnboardingIntakeProps) {
  const [prompts, setPrompts] = useState<string[]>(Array(10).fill(''));
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting;

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const handleContactChange =
    (field: 'name' | 'email' | 'phone' | 'company') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setContact((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const filledPrompts = prompts.map((prompt) => prompt.trim()).filter(Boolean);

    if (!contact.name.trim()) {
      setError('Please enter your name so we know who to follow up with.');
      return;
    }

    if (!isValidEmail(contact.email)) {
      setError('Please enter a valid work email.');
      return;
    }

    if (!isLikelyValidPhone(contact.phone)) {
      setError('Please enter a valid phone number for the strategy handoff.');
      return;
    }

    if (filledPrompts.length === 0) {
      setError('Please enter at least one prompt, keyword, or question.');
      return;
    }

    const payload: OnboardingIntakePayload = {
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      company: contact.company.trim() || undefined,
      keywords: filledPrompts,
    };

    if (onSubmitCallback) {
      await onSubmitCallback(payload);
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Success! We captured ${filledPrompts.length} prompts and will follow up by email.`);
      setPrompts(Array(10).fill(''));
      setContact({ name: '', email: '', phone: '', company: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCount = prompts.filter((prompt) => prompt.trim().length > 0).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
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

        <Heading className="text-4xl md:text-5xl font-bold text-white font-space mb-4">
          Request Your Custom Report
        </Heading>

        <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-6">
          Tell us who to send the report to, how to reach you fast, and which prompts matter most.
          We&apos;ll use this to prepare the custom PDF and line up the paid strategy call.
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">
            <span className="font-bold text-green-400">{filledCount}</span> of 10 prompts added
          </span>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      >
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-green-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-300 mb-1">
                What happens after this?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                We send the teaser and then prepare the custom report for your inbox. Your phone number is used for the strategy handoff or urgent follow-up if we spot a critical issue.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</span>
            <input
              type="text"
              value={contact.name}
              onChange={handleContactChange('name')}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Work Email</span>
            <input
              type="email"
              value={contact.email}
              onChange={handleContactChange('email')}
              placeholder="jane@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</span>
            <input
              type="tel"
              value={contact.phone}
              onChange={handleContactChange('phone')}
              placeholder="(312) 555-0198"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Company</span>
            <input
              type="text"
              value={contact.company}
              onChange={handleContactChange('company')}
              placeholder="Acme Health"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
            />
          </label>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-300 mb-1">
                Put your highest-value prompts first
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Examples: &quot;best telemedicine platform for seniors&quot;, &quot;how to choose virtual healthcare provider&quot;,
                &quot;telehealth vs in-person visits&quot;
              </p>
            </div>
          </div>
        </div>

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

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || filledCount === 0}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-base font-bold uppercase tracking-wider transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Preparing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Request My Custom Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            We&apos;ll email the report after review, then you can book the paid strategy call if you want us to walk through the rollout with you.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="text-sm font-bold text-white mb-4 font-space">
            What You Get Next
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-green-400">1</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Surface-Level Fixes</p>
                <p className="text-xs text-gray-500">We highlight the first issues to tackle without dumping the full implementation playbook.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Priority Handoff</p>
                <p className="text-xs text-gray-500">We decide which prompts, pages, and authority gaps to tackle first once the report is sent.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-yellow-400">3</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-300 mb-1">Implementation Call</p>
                <p className="text-xs text-gray-500">If the fit is strong, we walk you through the rollout on the paid strategy call.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
