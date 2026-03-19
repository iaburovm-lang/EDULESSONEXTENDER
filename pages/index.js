import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (!code.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'Access disabled' ? 'Your access has been disabled. Please contact support.' : 'Invalid access code.');
        return;
      }
      sessionStorage.setItem('ep_login', data.login);
      router.push('/app');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>EduPlan — Lesson Planning Tool</title></Head>
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: '#1E293B', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📚</span>
          <div>
            <h1 style={{ margin: 0, color: '#F1F5F9', fontSize: 17, fontWeight: 700 }}>EduPlan</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: 10, letterSpacing: 1 }}>LESSON PLANNING TOOL</p>
          </div>
        </div>

        {/* Login card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🔐</div>
              <h2 style={{ color: '#1E293B', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Welcome</h2>
              <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>Enter your access code to continue</p>
            </div>

            <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Access Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Enter your code"
              style={{ width: '100%', border: error ? '1px solid #FCA5A5' : '1px solid #E2E8F0', borderRadius: 10, padding: '11px 14px', fontSize: 15, color: '#1E293B', background: '#F8FAFC', outline: 'none', fontFamily: 'monospace', letterSpacing: 2 }}
            />

            {error && <p style={{ margin: '8px 0 0', color: '#EF4444', fontSize: 13 }}>{error}</p>}

            <button
              onClick={login}
              disabled={loading || !code.trim()}
              style={{ marginTop: 16, width: '100%', background: !code.trim() ? '#F1F5F9' : loading ? '#818CF8' : '#4F46E5', border: 'none', borderRadius: 10, color: !code.trim() ? '#94A3B8' : '#fff', fontSize: 14, fontWeight: 600, padding: '12px 0', cursor: !code.trim() || loading ? 'not-allowed' : 'pointer', transition: 'background .2s' }}
            >
              {loading ? 'Checking…' : 'Continue →'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, color: '#94A3B8', fontSize: 12 }}>
              Don't have a code? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
