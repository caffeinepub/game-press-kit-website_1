import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminStatus, useCheckPasswordEnabled, useEnablePasswordProtection, useDisablePasswordProtection, useUpdateBodyTextColor, useGetBodyTextColor } from '../hooks/useQueries';
import { useAppTheme } from '../App';
import { AlertCircle, Lock, Unlock, RefreshCw, Palette } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../components/AdminSidebar';

const GRAYSCALE_SWATCHES = [
  { label: 'Black', value: '#0a0a0a' },
  { label: 'Near Black', value: '#1a1a1a' },
  { label: 'Dark Gray', value: '#333333' },
  { label: 'Medium Gray', value: '#555555' },
  { label: 'Gray', value: '#777777' },
  { label: 'Light Gray', value: '#999999' },
];

export default function SettingsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useGetAdminStatus();
  const navigate = useNavigate();
  const { isDark } = useAppTheme();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-sm opacity-50">Loading…</p>
      </div>
    );
  }

  if (!identity || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle size={32} className="mx-auto mb-4 opacity-40" />
          <h2 className="font-heading text-2xl mb-2">Access Denied</h2>
          <p className="text-sm opacity-60 mb-6">Admin access required.</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-foreground text-background text-sm hover:bg-foreground/85 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <AdminSidebar activeSection="settings" onSectionChange={() => {}} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-10 space-y-12">
          <div>
            <h1 className="font-heading text-3xl mb-1">Settings</h1>
            <p className="text-sm opacity-50">Configure press kit access and theme</p>
          </div>
          <PasswordProtectionSection />
          <ThemeColorSection />
        </div>
      </main>
    </div>
  );
}

function PasswordProtectionSection() {
  const { data: passwordEnabled } = useCheckPasswordEnabled();
  const enableProtection = useEnablePasswordProtection();
  const disableProtection = useDisablePasswordProtection();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEnable = async () => {
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await enableProtection.mutateAsync(password);
      toast.success('Password protection enabled');
      setPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to enable protection');
    }
  };

  const handleDisable = async () => {
    try {
      await disableProtection.mutateAsync();
      toast.success('Password protection disabled');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to disable protection');
    }
  };

  const handleRegenerate = async () => {
    if (!password.trim()) {
      toast.error('Enter a new password first');
      return;
    }
    try {
      await disableProtection.mutateAsync();
      await enableProtection.mutateAsync(password);
      toast.success('Password updated');
      setPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update password');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        {passwordEnabled ? <Lock size={18} /> : <Unlock size={18} />}
        <h2 className="font-heading text-xl">Press Kit Access</h2>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${
            passwordEnabled
              ? 'bg-foreground text-background'
              : 'bg-foreground/10 text-foreground'
          }`}
        >
          {passwordEnabled ? <Lock size={11} /> : <Unlock size={11} />}
          {passwordEnabled ? 'Password Protected' : 'Public'}
        </div>
      </div>

      <div className="space-y-3 max-w-sm">
        <div>
          <label className="text-xs uppercase tracking-widest opacity-50 block mb-1.5">
            {passwordEnabled ? 'New Password' : 'Set Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-2 text-sm bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 transition-colors"
          />
        </div>
        {!passwordEnabled && (
          <div>
            <label className="text-xs uppercase tracking-widest opacity-50 block mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2 text-sm bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 transition-colors"
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!passwordEnabled ? (
            <button
              onClick={handleEnable}
              disabled={enableProtection.isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40"
            >
              <Lock size={11} />
              {enableProtection.isPending ? 'Enabling…' : 'Enable Protection'}
            </button>
          ) : (
            <>
              <button
                onClick={handleRegenerate}
                disabled={enableProtection.isPending || disableProtection.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={11} />
                Update Password
              </button>
              <button
                onClick={handleDisable}
                disabled={disableProtection.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-40"
              >
                <Unlock size={11} />
                {disableProtection.isPending ? 'Disabling…' : 'Disable Protection'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ThemeColorSection() {
  const { data: currentColor = '#1a1a1a' } = useGetBodyTextColor();
  const updateColor = useUpdateBodyTextColor();
  const [selected, setSelected] = useState(currentColor);

  const handleSelect = async (color: string) => {
    setSelected(color);
    document.documentElement.style.setProperty('--body-text-color', color);
    try {
      await updateColor.mutateAsync(color);
      toast.success('Body text color updated');
    } catch {
      toast.error('Failed to update color');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Palette size={18} />
        <h2 className="font-heading text-xl">Theme Settings</h2>
      </div>
      <p className="text-sm opacity-60">Body text color (light mode only)</p>

      <div className="flex flex-wrap gap-3">
        {GRAYSCALE_SWATCHES.map(swatch => (
          <button
            key={swatch.value}
            onClick={() => handleSelect(swatch.value)}
            className="flex flex-col items-center gap-1.5 group"
            aria-label={swatch.label}
          >
            <div
              className={`w-10 h-10 transition-transform group-hover:scale-110 ${
                selected === swatch.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
              }`}
              style={{ backgroundColor: swatch.value }}
            />
            <span className="text-xs opacity-50">{swatch.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-widest opacity-50">Custom hex</label>
        <input
          type="text"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          onBlur={() => {
            if (/^#[0-9a-fA-F]{6}$/.test(selected)) {
              handleSelect(selected);
            }
          }}
          className="w-28 px-2 py-1 text-xs bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 transition-colors font-mono"
          placeholder="#1a1a1a"
        />
        <div
          className="w-6 h-6"
          style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(selected) ? selected : '#1a1a1a' }}
        />
      </div>
    </section>
  );
}
