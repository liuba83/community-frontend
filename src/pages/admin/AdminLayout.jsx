import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login', { replace: true });
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray dark:bg-light-gray">
        <p className="text-text/50">Loading…</p>
      </div>
    );
  }

  const navClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-brand-blue/10 text-brand-blue'
        : 'text-text/60 dark:text-white/60 hover:text-text dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-light-gray dark:bg-light-gray">
      <header className="bg-white dark:bg-[#0F2040] border-b border-stroke px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-dark-blue text-sm">Spilno Admin</span>
          <nav className="flex gap-1">
            <NavLink to="/admin" end className={navClass}>Queue</NavLink>
            <NavLink to="/admin/services" className={navClass}>Services</NavLink>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-text/50 hover:text-brand-red transition-colors"
        >
          Sign out
        </button>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
