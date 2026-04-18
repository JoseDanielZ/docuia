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
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 6000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system || '' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ text: data.choices[0].message.content });
    } else {
      return res.status(500).json({
        error: data.error?.message || 'No response from AI',
        details: JSON.stringify(data).substring(0, 500),
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}
