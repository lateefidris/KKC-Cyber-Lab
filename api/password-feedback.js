// Vercel Serverless Function for Password Ranking Feedback
// Proxies the Anthropic API call server-side so the key is never exposed to the browser

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userRankingText, correctRankingText } = req.body;

  if (!userRankingText || !correctRankingText) {
    return res.status(400).json({ error: 'Missing required fields: userRankingText, correctRankingText' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are helping a high school student learn about password security. They just ranked passwords from weakest to strongest.

Their ranking:
${userRankingText}

Correct ranking (weakest to strongest):
${correctRankingText}

Give them 2-3 sentences of personalized feedback:
1. What did they get right?
2. What was their biggest mistake?
3. One key lesson about password patterns to remember

Be encouraging but specific. Use a casual, helpful tone.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({ feedback: data.content[0].text });

  } catch (error) {
    console.error('Password feedback error:', error);
    return res.status(500).json({
      error: 'Failed to get feedback',
      details: error.message
    });
  }
}
