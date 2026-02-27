import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Mail } from 'lucide-react';
import { useAppTheme } from '../App';
import { useGetAboutText } from '../hooks/useQueries';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const { data: aboutText } = useGetAboutText();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/assets/background_web.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: isDark ? 'invert(1)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Game Logo — natural size on desktop, scales down on mobile */}
        <div className="mb-8 animate-fade-in w-full flex justify-center">
          <img
            src="/assets/gamelogo.png"
            alt="Poke A Nose"
            className={`max-w-full w-auto h-auto ${isDark ? 'invert' : ''}`}
            style={{ transition: 'filter 0.3s ease' }}
          />
        </div>

        {/* Description */}
        <div className="max-w-xl mx-auto mb-10 animate-fade-in">
          <p className="text-lg leading-relaxed opacity-80">
            {aboutText || 'A hand-drawn adventure game about curiosity, laundromats, and the art of poking things you probably shouldn\'t.'}
          </p>
        </div>

        {/* Newsletter */}
        <div className="w-full max-w-sm mx-auto mb-10 animate-fade-in">
          <NewsletterPlaceholder />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate({ to: '/press-kit' })}
          className="group flex items-center gap-2 px-8 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-all animate-fade-in"
        >
          View Press Kit
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer attribution */}
      <footer className="py-6 text-center">
        <p className="text-xs opacity-40">
          © {new Date().getFullYear()} Poke A Nose. Built with{' '}
          <span className="text-foreground">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'poke-a-nose')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70 transition-opacity"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

function NewsletterPlaceholder() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-3">
        <p className="text-sm opacity-70">Thanks! We'll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2.5 text-sm bg-background/80 text-foreground border border-foreground/20 focus:outline-none focus:border-foreground/60 transition-colors placeholder:opacity-40"
        required
      />
      <button
        type="submit"
        className="px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-colors flex items-center gap-1.5"
      >
        <Mail size={14} />
        Subscribe
      </button>
    </form>
  );
}
