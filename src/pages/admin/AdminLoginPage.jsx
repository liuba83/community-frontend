import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray dark:bg-light-gray">
      <div className="bg-white dark:bg-[#0F2040] rounded-2xl shadow-card p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-dark-blue mb-6">Spilno Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-stroke bg-white dark:bg-[#0A1628] text-text dark:text-white px-4 py-3 text-base focus:outline-none focus:border-brand-blue"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-stroke bg-white dark:bg-[#0A1628] text-text dark:text-white px-4 py-3 text-base focus:outline-none focus:border-brand-blue"
          />
          {error && <p className="text-brand-red text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red text-white font-semibold rounded-xl py-3 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
