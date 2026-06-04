// --- CLEAN OPENROUTER CLIENT ---
// Single source of truth for all LLM API calls

export interface CallLLMOptions {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean; // When true, forces JSON output mode
  timeoutMs?: number; // Timeout in milliseconds (default: 20000ms = 20 seconds)
}

/**
 * Universal LLM client for OpenRouter API
 * Replaces all duplicate Gemini SDK calls
 */
export async function callLLM(options: CallLLMOptions): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    const error = new Error("MISSING_KEY: OPENROUTER_API_KEY is not set in .env.local");
    console.error(error.message);
    throw error;
  }

  const {
    model,
    systemPrompt,
    userPrompt,
    temperature = 0.2,
    maxTokens = 2000,
    json = false,
    timeoutMs = 10000  // Reduced default timeout from 20s to 12s for faster overall completion
  } = options;

  const messages: Array<{ role: string; content: string }> = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: userPrompt });

  const requestBody: any = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // Add JSON mode if requested
  if (json) {
    requestBody.response_format = { type: 'json_object' };
  }

  try {
    console.log('[OpenRouter] Making request to:', {
      model,
      hasSystemPrompt: !!systemPrompt,
      userPromptLength: userPrompt.length,
      temperature,
      maxTokens,
      json,
      timeoutMs
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rankup1.vercel.app',
        'X-Title': 'RankUp AEO',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `OpenRouter API error ${response.status}: ${errorText}`;
      console.error('[OpenRouter] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
        model,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Log response structure for debugging
    console.log('[OpenRouter] Success Response:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasError: !!data.error, 
      model: data.model,
      usage: data.usage
    });
    
    if (data.error) {
      const errorMsg = `OpenRouter API returned error in response: ${JSON.stringify(data.error)}`;
      console.error('[OpenRouter] Error in response body:', data.error);
      throw new Error(errorMsg);
    }

    const choice = data.choices?.[0] ?? {};
    const message = (choice as any).message ?? {};

    let content = message.content ?? '';

    if (!content && typeof message.reasoning === 'string' && message.reasoning.trim()) {
      content = message.reasoning;
      console.warn('[OpenRouter] Warning: message.content was null; falling back to message.reasoning.');
    }

    if (!content && typeof choice.text === 'string' && choice.text.trim()) {
      content = choice.text;
      console.warn('[OpenRouter] Warning: message.content was null; falling back to choice.text.');
    }

    if (!content && choice?.delta?.content) {
      content = choice.delta.content;
      console.warn('[OpenRouter] Warning: message.content was null; falling back to delta.content.');
    }

    if (!content) {
      const finishReason = (choice as any).finish_reason || 'unknown';
      if (finishReason === 'length') {
        console.warn('[OpenRouter] Response truncated (finish_reason=length). Retrying with higher maxTokens.');
        const retryOptions = { ...options, maxTokens: Math.min(4000, (maxTokens || 2000) + 1000), timeoutMs: Math.max(timeoutMs, 30000) };
        if (retryOptions.maxTokens !== maxTokens) {
          return await callLLM(retryOptions);
        }
      }

      const detailedError = `OpenRouter returned empty/missing content. finish_reason=${finishReason}, choices=${JSON.stringify(data.choices)}`;
      console.error('[OpenRouter] Empty content error:', detailedError);
      throw new Error(detailedError);
    }

    // Strip ```json fences before returning
    const result = stripJsonFences(typeof content === 'string' ? content : JSON.stringify(content));
    console.log('[OpenRouter] Returning content (first 200 chars):', result.substring(0, 200));
    return result;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`OpenRouter request timeout after ${timeoutMs}ms`);
      console.error('[OpenRouter] Timeout Error:', {
        message: timeoutError.message,
        model,
        timeoutMs,
        timestamp: new Date().toISOString()
      });
      throw timeoutError;
    }
    
    console.error('[OpenRouter] LLM Call Failed - Full Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      model,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Strip markdown code fences from JSON responses
 */
function stripJsonFences(text: string): string {
  return text.replace(/```json\n?|```\n?|```/g, '').trim();
}

/**
 * Extract JSON-like substring from unstructured model output.
 * Handles cases with chain-of-thought prefixes (e.g., "Thinking Process:").
 */
function extractJsonFragment(text: string): string {
  const session = text.trim();

  // Prefer direct JSON if it already looks valid
  const trimmed = session.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed;
  }

  // Attempt to match the first JSON object or array in the text
  const objectMatch = session.match(/\{[\s\S]*\}/);
  if (objectMatch && objectMatch[0]) {
    return objectMatch[0].trim();
  }

  const arrayMatch = session.match(/\[[\s\S]*\]/);
  if (arrayMatch && arrayMatch[0]) {
    return arrayMatch[0].trim();
  }

  // Nothing parseable found
  return session;
}

/**
 * Clean JSON response - extract JSON object from markdown or mixed text
 */
export function cleanJsonResponse(text: string): string {
  // First strip markdown fences
  const raw = stripJsonFences(text);
  const cleaned = extractJsonFragment(raw);

  // If extracted fragment is valid JSON at the top level, return it as-is
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || (cleaned.startsWith('[') && cleaned.endsWith(']'))) {
    return cleaned;
  }

  // If still not valid JSON, keep raw string (caller may fallback)
  return cleaned;
}

export function parseJsonResponse(text: string): any {
  const cleaned = cleanJsonResponse(text);
  if (!cleaned || !cleaned.trim()) {
    throw new Error('Empty response after cleaning JSON output.');
  }
  const trimmed = cleaned.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error(`No JSON object/array found in response. cleaned output: ${trimmed.slice(0, 300)}`);
  }

  try {
    return JSON.parse(trimmed);
  } catch (error: any) {
    throw new Error(`JSON.parse failed (cleaned output): ${error.message} - cleaned=${trimmed.slice(0, 300)}`);
  }
}


