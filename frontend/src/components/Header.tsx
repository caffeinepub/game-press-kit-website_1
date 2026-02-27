import React from 'react';
import { Sun, Moon, LogIn, Loader2 } from 'lucide-react';
import { useAppTheme } from '../App';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Header() {
  const { toggleTheme, isDark } = useAppTheme();
  const { login, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Show login button whenever the user is not authenticated — no initialization guard
  const showLoginButton = !isAuthenticated;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2">
      {showLoginButton && (
        <button
          onClick={login}
          disabled={isLoggingIn}
          style={{
            color: isDark ? '#ffffff' : '#000000',
            backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
          }}
          className="h-9 px-3 flex items-center gap-1.5 shadow-sm text-xs font-medium tracking-wide disabled:opacity-50 cursor-pointer"
          aria-label="Sign in"
        >
          {isLoggingIn ? (
            <Loader2 size={14} className="animate-spin" style={{ color: 'inherit' }} />
          ) : (
            <LogIn size={14} style={{ color: 'inherit' }} />
          )}
          <span style={{ color: 'inherit' }}>
            {isLoggingIn ? 'Signing in…' : 'Sign in'}
          </span>
        </button>
      )}
      <button
        onClick={toggleTheme}
        style={{
          color: isDark ? '#ffffff' : '#000000',
          backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
          border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
        }}
        className="w-9 h-9 flex items-center justify-center shadow-sm cursor-pointer"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun size={18} style={{ color: 'inherit' }} /> : <Moon size={18} style={{ color: 'inherit' }} />}
      </button>
    </div>
  );
}
