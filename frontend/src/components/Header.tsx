import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppTheme } from '../App';

interface HeaderProps {
  isAdmin: boolean;
}

export default function Header({ isAdmin: _isAdmin }: HeaderProps) {
  const { toggleTheme, isDark } = useAppTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm border border-foreground/10 rounded-sm shadow-sm"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
