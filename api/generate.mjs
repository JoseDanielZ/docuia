export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, system } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          role: 'user',
          parts: [{ text: system || '' }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 1,
        },
      }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts) {
      const text = data.candidates[0].content.parts.map(p => p.text || '').join('\n');
      return res.status(200).json({ text });
    } else {
      const errMsg = data.error?.message || JSON.stringify(data);
      return res.status(500).json({ error: `Error de IA: ${errMsg}` });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}
