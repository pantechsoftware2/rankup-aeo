export const MODELS = {
  FAST: 'qwen/qwen3.5-9b',         // cheap, fast, for parallel micro-tasks
  DEEP: 'qwen/qwen3.5-397b-a17b',  // big MoE model, for the real analysis
  FALLBACK: 'qwen/qwen3-32b',      // middle ground if the big model is slow
} as const;
