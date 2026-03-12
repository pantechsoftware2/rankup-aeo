const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = 'https://rankup-aeo.vercel.app';
const SITE_TITLE = 'RankUp AEO';

export async function callLLM(options: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const body: Record<string, unknown> = {
    model: options.model,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    temperature: options.temperature ?? 0.2,
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    ...(options.json ? { response_format: { type: 'json_object' } } : {}),
  };

  let response: Response;
  try {
    response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_TITLE,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('OpenRouter network error:', err);
    throw new Error('Failed to reach OpenRouter API');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    console.error(`OpenRouter error ${response.status}:`, errorText);
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';

  // Strip ```json fences if present
  return content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
}
