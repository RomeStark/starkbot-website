export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { message, businessName, businessInfo } = await req.json();

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
      system: `You are a friendly customer support agent for ${businessName || 'StarkBot'}. ${businessInfo || ''} Keep responses concise and helpful.`,
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();

  if (data.content && data.content[0] && data.content[0].text) {
    return new Response(JSON.stringify({ reply: data.content[0].text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ reply: 'Error: ' + JSON.stringify(data) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
