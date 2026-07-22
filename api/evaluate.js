// Vercel Serverless Function for AI Evaluation
// This keeps your API key secure on the server

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, scenario } = req.body;

    if (!message || !scenario) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are evaluating a cybersecurity awareness message written by a high school student. 

Scenario: ${scenario}

Student's message: "${message}"

Evaluate this message on a scale of 0-650 points based on:
1. Clarity (is it easy to understand?)
2. Specificity (does it mention relevant details?)
3. Actionability (does it tell people what to DO?)
4. Effectiveness (would this actually make students think twice?)

Respond in this exact format:
SCORE: [number between 0-650]
FEEDBACK: [2-3 sentences explaining the score]
SUGGESTION: [1 specific way to improve, or "Excellent as-is" if score is above 550]`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const feedbackMatch = text.match(/FEEDBACK:\s*(.+?)(?=SUGGESTION:|$)/s);
    const suggestionMatch = text.match(/SUGGESTION:\s*(.+)/s);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 300;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : "Message evaluated.";
    const suggestion = suggestionMatch ? suggestionMatch[1].trim() : "Keep practicing!";

    return res.status(200).json({ score, feedback, suggestion });

  } catch (error) {
    console.error('Evaluation error:', error);
    return res.status(500).json({ 
      error: 'Failed to evaluate message',
      details: error.message 
    });
  }
}
