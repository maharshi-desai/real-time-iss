export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing AI token' });
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 150, temperature: 0.1 },
        }),
      }
    );

    const text = await response.text();

    // HF sometimes returns HTML on auth errors — handle gracefully
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(response.status).json({
        error: `HF API returned non-JSON (status ${response.status}). Check your VITE_AI_TOKEN — it may be expired or lack inference permissions.`
      });
    }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
