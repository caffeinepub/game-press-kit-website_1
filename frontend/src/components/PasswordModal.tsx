import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppTheme } from '../App';

interface PasswordModalProps {
  onVerify: (password: string) => Promise<void>;
}

export default function PasswordModal({ onVerify }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useAppTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onVerify(password);
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div
        className={`w-full max-w-sm p-8 transition-colors duration-300 ${
          isDark ? 'bg-black text-white' : 'bg-white text-black'
        }`}
        style={{ boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.1)' : '0 0 0 1px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} />
          <h2 className="font-heading text-2xl">Press Kit Access</h2>
        </div>
        <p className={`text-sm mb-6 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
          This press kit is password protected. Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`w-full px-4 py-2.5 text-sm border focus:outline-none transition-colors ${
              isDark
                ? 'bg-white/5 text-white border-white/20 focus:border-white/60 placeholder:text-white/30'
                : 'bg-black/5 text-black border-black/20 focus:border-black/60 placeholder:text-black/30'
            }`}
            autoFocus
          />
          {error && (
            <p className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className={`w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              isDark
                ? 'bg-white text-black hover:bg-white/85'
                : 'bg-black text-white hover:bg-black/85'
            }`}
          >
            {loading ? 'Verifying…' : 'Access Press Kit'}
          </button>
        </form>
      </div>
    </div>
  );
}
