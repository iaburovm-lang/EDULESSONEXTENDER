import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Simple admin check via header
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — list all users
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — create new user
  if (req.method === 'POST') {
    const { login } = req.body;
    if (!login) return res.status(400).json({ error: 'Login required' });
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({ login: login.trim(), active: true })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // PATCH — toggle active status
  if (req.method === 'PATCH') {
    const { id, active } = req.body;
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE — remove user
  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
