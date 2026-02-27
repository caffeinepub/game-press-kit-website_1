import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, LogIn, LogOut, Loader2 } from 'lucide-react';

export default function Header() {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    setLoginError(null);
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Login error:', msg);

        if (msg.includes('already authenticated')) {
          await clear();
          queryClient.clear();
          setTimeout(async () => {
            try {
              await login();
            } catch (retryErr) {
              console.error('Retry login error:', retryErr);
              setLoginError('Login failed. Please try again.');
            }
          }, 300);
        } else if (msg.includes('popup') || msg.includes('blocked')) {
          setLoginError('Popup blocked. Please allow popups for this site and try again.');
        } else {
          setLoginError('Login failed. Please try again.');
        }
      }
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: isDark ? '#ffffff' : '#000000',
            color: isDark ? '#000000' : '#ffffff',
            border: 'none',
            borderRadius: '0',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Auth button */}
        {!isInitializing && (
          <button
            onClick={handleAuth}
            disabled={isLoggingIn}
            style={{
              background: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '0',
              padding: '8px 16px',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: isLoggingIn ? 0.7 : 1,
              height: '36px',
              whiteSpace: 'nowrap',
            }}
            aria-label={isAuthenticated ? 'Sign out' : 'Sign in'}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : isAuthenticated ? (
              <>
                <LogOut size={14} />
                Sign Out
              </>
            ) : (
              <>
                <LogIn size={14} />
                Sign In
              </>
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {loginError && (
        <div
          style={{
            background: isDark ? '#ffffff' : '#000000',
            color: isDark ? '#000000' : '#ffffff',
            padding: '6px 12px',
            fontSize: '11px',
            maxWidth: '280px',
            textAlign: 'right',
          }}
        >
          {loginError}
          <button
            onClick={() => setLoginError(null)}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
