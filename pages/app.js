import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LessonExtender from '../components/LessonExtender';

export default function AppPage() {
  const [login, setLogin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('ep_login');
    if (!stored) { router.replace('/'); return; }
    setLogin(stored);
  }, []);

  const logout = () => {
    sessionStorage.removeItem('ep_login');
    router.push('/');
  };

  if (!login) return null;

  return (
    <>
      <Head><title>EduPlan — Lesson Planning Tool</title></Head>
      <LessonExtender login={login} onLogout={logout} />
    </>
  );
}
