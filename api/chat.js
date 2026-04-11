export const config = {
  runtime: 'edge',
};

const ACTIVE_CLIENTS = [];

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { message, businessName, businessInfo, clientId } = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      stream: true,
      system: `You are a friendly customer support agent for ${businessName || 'StarkBot'}. ${businessInfo || ''} Keep responses concise and helpful. Never use markdown formatting like **bold** or bullet points with dashes. Use plain conversational text only. Keep responses under 3 sentences when possible.`,
      messages: [{ role: 'user', content: message }]
    })
  });

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  });
}
