export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, system } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: system || '' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 1,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
      const text = data.choices[0].message.content;
      return res.status(200).json({ text });
    } else {
      const errMsg = data.error?.message || JSON.stringify(data);
      return res.status(500).json({ error: `Error de IA: ${errMsg}` });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}
