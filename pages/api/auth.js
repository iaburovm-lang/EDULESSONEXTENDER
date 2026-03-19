import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, login, active')
    .eq('login', code.trim())
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Invalid code' });
  }

  if (!data.active) {
    return res.status(403).json({ error: 'Access disabled' });
  }

  // Update last_used timestamp
  await supabaseAdmin
    .from('users')
    .update({ last_used: new Date().toISOString() })
    .eq('id', data.id);

  return res.status(200).json({ ok: true, login: data.login });
}
