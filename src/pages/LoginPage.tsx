import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseConfigured } from '../lib/supabase';

export default function LoginPage() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'supabase_not_configured'
          ? 'Supabase ist noch nicht verbunden.'
          : 'E-Mail oder Passwort ist falsch.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-cinzel font-bold text-xl text-parchment tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
            Ritter XXL
          </h1>
          <p className="font-inter text-sm text-parchment/50 mt-1">Mitarbeiter-Anmeldung</p>
        </div>

        {!supabaseConfigured && (
          <div className="mb-5 border border-gold/30 bg-gold/10 rounded-sm p-4">
            <p className="font-inter text-xs text-gold/90">
              Supabase ist noch nicht verbunden (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY fehlen in .env).
              Die Anmeldung funktioniert erst, sobald das Projekt verbunden ist.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-gold/20 bg-obsidian-light rounded-sm p-8">
          <div className="mb-5">
            <label className="block font-inter text-xs uppercase tracking-widest text-gold/70 mb-2">
              E-Mail
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-obsidian border border-steel text-white pl-10 pr-3 py-2.5 font-inter text-sm rounded-sm hover:border-gold/40 focus:border-gold/60 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-inter text-xs uppercase tracking-widest text-gold/70 mb-2">
              Passwort
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-obsidian border border-steel text-white pl-10 pr-3 py-2.5 font-inter text-sm rounded-sm hover:border-gold/40 focus:border-gold/60 outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="font-inter text-xs text-ember-glow mb-4" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-obsidian font-cinzel text-sm tracking-widest uppercase py-2.5 rounded-sm hover:bg-gold-light transition-colors disabled:opacity-60"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {submitting ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
