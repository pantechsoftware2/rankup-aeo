/**
 * Centralized model configuration for OpenRouter
 * All model references should import from here
 */

export const MODELS = {
  FAST: 'openai/gpt-4.1-mini',       // strong structured output for classification and audit JSON
  DEEP: 'openai/gpt-4.1-mini',       // faster, more deterministic primary audit model
  FALLBACK: 'qwen/qwen3-32b',        // fallback if the primary OpenAI path fails on OpenRouter
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];
