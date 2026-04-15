export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, system } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: system || '',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.content && data.content.length > 0) {
      const text = data.content.map(c => c.text || '').join('\n');
      return res.status(200).json({ text });
    } else {
      return res.status(500).json({ error: 'No response from AI', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}
