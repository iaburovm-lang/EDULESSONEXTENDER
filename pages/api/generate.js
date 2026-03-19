import { supabaseAdmin } from '../../lib/supabase';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { login, messages, model, max_tokens } = req.body;

  // Verify the user is still active before every generation
  if (login) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('active')
      .eq('login', login)
      .single();

    if (!data || !data.active) {
      return res.status(403).json({ error: 'Access disabled' });
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
