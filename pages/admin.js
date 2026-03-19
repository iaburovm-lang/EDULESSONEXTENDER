import { useState, useEffect } from 'react';
import Head from 'next/head';

const S = { fontFamily: "'Inter','Helvetica Neue',sans-serif" };

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [users, setUsers]       = useState([]);
  const [newLogin, setNewLogin] = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  const adminPass = typeof window !== 'undefined' ? sessionStorage.getItem('ep_admin') : null;

  useEffect(() => {
    if (sessionStorage.getItem('ep_admin')) { setAuthed(true); loadUsers(sessionStorage.getItem('ep_admin')); }
  }, []);

  const doLogin = async () => {
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (res.ok) { sessionStorage.setItem('ep_admin', password); setAuthed(true); loadUsers(password); }
    else setAuthError('Wrong password');
  };

  const loadUsers = async (pass) => {
    const res = await fetch('/api/admin/users', { headers: { 'x-admin-password': pass || sessionStorage.getItem('ep_admin') } });
    if (res.ok) setUsers(await res.json());
  };

  const addUser = async () => {
    if (!newLogin.trim()) return;
    setLoading(true);
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': sessionStorage.getItem('ep_admin') }, body: JSON.stringify({ login: newLogin.trim() }) });
    if (res.ok) { setNewLogin(''); setMsg('✓ User added'); await loadUsers(); }
    else setMsg('Error adding user');
    setLoading(false); setTimeout(() => setMsg(''), 3000);
  };

  const toggleUser = async (id, active) => {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-password': sessionStorage.getItem('ep_admin') }, body: JSON.stringify({ id, active }) });
    await loadUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': sessionStorage.getItem('ep_admin') }, body: JSON.stringify({ id }) });
    await loadUsers();
  };

  if (!authed) return (
    <>
      <Head><title>Admin — EduPlan</title></Head>
      <div style={{ ...S, minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32, width: '100%', maxWidth: 380 }}>
          <h2 style={{ margin: '0 0 20px', color: '#1E293B', fontSize: 18, fontWeight: 700 }}>🔒 Admin Access</h2>
          <input type="password" value={password} onChange={e => { setPassword(e.target.value); setAuthError(''); }} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="Admin password" style={{ width: '100%', border: authError ? '1px solid #FCA5A5' : '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', marginBottom: 8 }} />
          {authError && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 8 }}>{authError}</p>}
          <button onClick={doLogin} style={{ width: '100%', background: '#4F46E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, padding: '11px 0', cursor: 'pointer' }}>Enter</button>
        </div>
      </div>
    </>
  );

  const active = users.filter(u => u.active);
  const inactive = users.filter(u => !u.active);

  return (
    <>
      <Head><title>Admin — EduPlan</title></Head>
      <div style={{ ...S, minHeight: '100vh', background: '#F8FAFC' }}>

        <div style={{ background: '#1E293B', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📚</span>
            <div>
              <h1 style={{ margin: 0, color: '#F1F5F9', fontSize: 16, fontWeight: 700 }}>EduPlan Admin</h1>
              <p style={{ margin: 0, color: '#64748B', fontSize: 10, letterSpacing: 1 }}>USER MANAGEMENT</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: '#64748B', fontSize: 12 }}>✅ {active.length} active &nbsp; ❌ {inactive.length} disabled</span>
            <button onClick={() => { sessionStorage.removeItem('ep_admin'); setAuthed(false); }} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#94A3B8', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 16px' }}>

          {/* Add user */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', color: '#1E293B', fontSize: 14, fontWeight: 600 }}>➕ Add New User</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newLogin} onChange={e => setNewLogin(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUser()} placeholder="e.g. anna2024" style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
              <button onClick={addUser} disabled={loading || !newLogin.trim()} style={{ background: '#4F46E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Add user</button>
            </div>
            {msg && <p style={{ margin: '8px 0 0', color: '#22C55E', fontSize: 13 }}>{msg}</p>}
          </div>

          {/* User list */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1E293B', fontSize: 14, fontWeight: 600 }}>All Users ({users.length})</h3>
            </div>
            {users.length === 0 && <p style={{ padding: '24px 20px', color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>No users yet. Add one above.</p>}
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '1px solid #F8FAFC', background: u.active ? '#fff' : '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{u.active ? '✅' : '❌'}</span>
                  <div>
                    <span style={{ color: '#1E293B', fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{u.login}</span>
                    {u.last_used && <span style={{ color: '#94A3B8', fontSize: 11, marginLeft: 10 }}>Last used: {new Date(u.last_used).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleUser(u.id, !u.active)} style={{ background: u.active ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${u.active ? '#FECACA' : '#BBF7D0'}`, borderRadius: 7, color: u.active ? '#DC2626' : '#16A34A', fontSize: 12, fontWeight: 600, padding: '5px 12px', cursor: 'pointer' }}>
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteUser(u.id)} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 7, color: '#94A3B8', fontSize: 12, padding: '5px 10px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
