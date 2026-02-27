import React from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Sun, Moon, Edit3, LogIn, LogOut, Settings } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEditMode } from '../hooks/useEditMode';
import { useAppTheme } from '../App';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isAdmin: boolean;
}

export default function Header({ isAdmin }: HeaderProps) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { isEditing, toggleEditing } = useEditMode();
  const { theme, toggleTheme, isDark } = useAppTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-foreground/8">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center focus:outline-none"
          aria-label="Go to home"
        >
          <img
            src="/assets/gamelogo.png"
            alt="Poke A Nose"
            className={`h-9 w-auto object-contain ${isDark ? 'invert' : ''}`}
            style={{ transition: 'filter 0.3s ease' }}
          />
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Admin controls */}
          {isAuthenticated && isAdmin && (
            <>
              <button
                onClick={toggleEditing}
                className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-colors ${
                  isEditing
                    ? 'bg-foreground text-background'
                    : 'bg-foreground/8 text-foreground hover:bg-foreground/15'
                }`}
                aria-label="Toggle edit mode"
              >
                <Edit3 size={13} />
                <span>{isEditing ? 'Editing' : 'Edit'}</span>
              </button>
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="w-9 h-9 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Admin dashboard"
              >
                <Settings size={16} />
              </button>
            </>
          )}

          {/* Auth button */}
          <button
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-50"
            aria-label={isAuthenticated ? 'Sign out' : 'Sign in'}
          >
            {isLoggingIn ? (
              <span>Signing in…</span>
            ) : isAuthenticated ? (
              <>
                <LogOut size={13} />
                <span>Sign Out</span>
              </>
            ) : (
              <>
                <LogIn size={13} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
