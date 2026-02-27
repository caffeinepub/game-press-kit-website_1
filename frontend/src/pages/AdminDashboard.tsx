import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminStatus, useIsCallerAdmin, useInitializeAdmin, useResetAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '../components/AdminSidebar';
import CMSContentEditor from '../components/CMSContentEditor';
import { AlertCircle, Loader2, LogIn, RefreshCw } from 'lucide-react';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

export default function AdminDashboard() {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Step 1: Check if any admin exists
  const {
    data: adminExists,
    isLoading: adminStatusLoading,
    refetch: refetchAdminStatus,
  } = useGetAdminStatus();

  // Step 2: Check if the current caller is the admin (only meaningful when authenticated)
  const {
    data: callerIsAdmin,
    isLoading: callerAdminLoading,
    refetch: refetchCallerAdmin,
  } = useIsCallerAdmin();

  const initializeAdmin = useInitializeAdmin();
  const resetAdmin = useResetAdmin();

  const [activeSection, setActiveSection] = useState<AdminSection>('content');
  const hasAttemptedInit = useRef(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Auto-initialize: when authenticated and no admin exists yet, claim admin slot
  useEffect(() => {
    if (
      isAuthenticated &&
      !adminStatusLoading &&
      adminExists === false &&
      !hasAttemptedInit.current &&
      !initializeAdmin.isPending
    ) {
      hasAttemptedInit.current = true;
      initializeAdmin.mutate(undefined, {
        onSuccess: () => {
          refetchAdminStatus();
          refetchCallerAdmin();
        },
        onError: () => {
          // Another principal may have claimed admin between checks — refetch to get current state
          refetchAdminStatus();
          refetchCallerAdmin();
        },
      });
    }
  }, [isAuthenticated, adminStatusLoading, adminExists]);

  // Reset hasAttemptedInit when identity changes so a new login can re-trigger init
  useEffect(() => {
    hasAttemptedInit.current = false;
    setResetError(null);
  }, [identity]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleResetAdmin = async () => {
    setResetError(null);
    resetAdmin.mutate(undefined, {
      onSuccess: async () => {
        // After reset, re-initialize with current caller
        hasAttemptedInit.current = false;
        await refetchAdminStatus();
        // The useEffect will trigger initializeAdmin since adminExists will be false
      },
      onError: (err: Error) => {
        setResetError(err.message);
      },
    });
  };

  // ── Loading states ──────────────────────────────────────────────────────────
  const isCheckingStatus =
    adminStatusLoading ||
    (isAuthenticated && callerAdminLoading) ||
    initializeAdmin.isPending ||
    resetAdmin.isPending;

  if (isCheckingStatus) {
    let loadingMessage = 'Loading…';
    if (initializeAdmin.isPending) loadingMessage = 'Setting up admin access…';
    if (resetAdmin.isPending) loadingMessage = 'Resetting admin access…';

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-60">
          <Loader2 size={18} className="animate-spin" />
          <p className="text-sm tracking-wide">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // ── Access Denied: not authenticated ───────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AccessDeniedScreen
        message="Sign in with your admin account to access this page."
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        canReset={false}
        onReset={handleResetAdmin}
        isResetting={resetAdmin.isPending}
        resetError={resetError}
        onGoHome={() => navigate({ to: '/' })}
      />
    );
  }

  // ── Access Denied: authenticated but not the admin ─────────────────────────
  if (isAuthenticated && callerIsAdmin === false) {
    return (
      <AccessDeniedScreen
        message="Your account does not have admin privileges for this application."
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        canReset={true}
        onReset={handleResetAdmin}
        isResetting={resetAdmin.isPending}
        resetError={resetError}
        onGoHome={() => navigate({ to: '/' })}
      />
    );
  }

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <CMSContentEditor section={activeSection} />
        </div>
      </main>
    </div>
  );
}

// ── Access Denied Screen Component ────────────────────────────────────────────
interface AccessDeniedScreenProps {
  message: string;
  onLogin: () => void;
  isLoggingIn: boolean;
  canReset: boolean;
  onReset: () => void;
  isResetting: boolean;
  resetError: string | null;
  onGoHome: () => void;
}

function AccessDeniedScreen({
  message,
  onLogin,
  isLoggingIn,
  canReset,
  onReset,
  isResetting,
  resetError,
  onGoHome,
}: AccessDeniedScreenProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="text-center max-w-sm w-full">
        <AlertCircle size={32} className="mx-auto mb-4 opacity-40" />
        <h2 className="font-heading text-2xl mb-2">Access Denied</h2>
        <p className="text-sm opacity-60 mb-8">{message}</p>

        {resetError && (
          <p className="text-sm mb-4 px-3 py-2 border border-foreground/20 bg-foreground/5 text-foreground/80">
            {resetError}
          </p>
        )}

        <div className="flex flex-col gap-3 items-center">
          {/* Sign In button */}
          <button
            onClick={onLogin}
            disabled={isLoggingIn || isResetting}
            className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={15} />
                Sign In
              </>
            )}
          </button>

          {/* Reset Admin Access button */}
          <button
            onClick={onReset}
            disabled={!canReset || isResetting || isLoggingIn}
            className="flex items-center gap-2 px-6 py-2.5 border border-foreground/30 text-foreground text-sm hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed w-full justify-center"
          >
            {isResetting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Resetting…
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Reset Admin Access
              </>
            )}
          </button>

          <button
            onClick={onGoHome}
            disabled={isLoggingIn || isResetting}
            className="px-6 py-2 text-foreground/50 text-sm hover:text-foreground transition-colors w-full disabled:opacity-30"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
