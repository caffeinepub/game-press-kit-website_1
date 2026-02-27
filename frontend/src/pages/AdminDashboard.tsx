import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminStatus, useInitializeAdmin, useResetAdmin } from '../hooks/useQueries';
import { useAppTheme } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import CMSContentEditor from '../components/CMSContentEditor';
import { AlertCircle, Loader2, LogIn, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

export default function AdminDashboard() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = useGetAdminStatus();
  const initializeAdmin = useInitializeAdmin();
  const resetAdmin = useResetAdmin();
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<AdminSection>('content');
  const [initError, setInitError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const hasAttemptedInit = useRef(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isResetting = resetAdmin.isPending || initializeAdmin.isPending;

  // Auto-initialize admin when authenticated user visits and no admin is set yet
  useEffect(() => {
    if (
      isAuthenticated &&
      !adminLoading &&
      isAdmin === false &&
      !hasAttemptedInit.current &&
      !initializeAdmin.isPending &&
      !resetAdmin.isPending
    ) {
      hasAttemptedInit.current = true;
      initializeAdmin.mutate(undefined, {
        onSuccess: () => {
          setInitError(null);
          // Invalidate and refetch to get fresh admin status
          queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
          refetchAdmin();
        },
        onError: (err: Error) => {
          // "Admin already initialized" means another principal is admin — show access denied
          setInitError(err.message);
        },
      });
    }
  }, [isAuthenticated, adminLoading, isAdmin]);

  const handleLogin = async () => {
    try {
      await login();
      // After login, reset init attempt so the useEffect can re-run
      hasAttemptedInit.current = false;
      setInitError(null);
      setResetError(null);
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
    } catch (error: any) {
      if (error?.message === 'User is already authenticated') {
        // Already authenticated, just refetch
        hasAttemptedInit.current = false;
        refetchAdmin();
      }
    }
  };

  // Reset admin slot and immediately claim it for the current user
  const handleResetAndClaim = async () => {
    if (!isAuthenticated) return;
    setResetError(null);

    resetAdmin.mutate(undefined, {
      onSuccess: () => {
        // Admin slot is now empty — claim it
        hasAttemptedInit.current = false;
        initializeAdmin.mutate(undefined, {
          onSuccess: () => {
            setInitError(null);
            setResetError(null);
            queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
            refetchAdmin();
          },
          onError: (err: Error) => {
            setResetError(`Failed to claim admin: ${err.message}`);
          },
        });
      },
      onError: (err: Error) => {
        setResetError(`Failed to reset admin: ${err.message}`);
      },
    });
  };

  // Show loading while checking admin status or attempting initialization
  if (adminLoading || (initializeAdmin.isPending && !resetAdmin.isPending)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-2 opacity-50">
          <Loader2 size={18} className="animate-spin" />
          <p className="text-sm">
            {initializeAdmin.isPending ? 'Setting up admin access…' : 'Loading…'}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated, or if init failed (admin already set by someone else)
  if (!isAuthenticated || (!isAdmin && initError)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <AlertCircle size={32} className="mx-auto mb-4 opacity-40" />
          <h2 className="font-heading text-2xl mb-2">Access Denied</h2>
          <p className="text-sm opacity-60 mb-8">
            {!isAuthenticated
              ? 'Sign in with your admin account to access this page.'
              : 'Your account does not have admin privileges.'}
          </p>

          <div className="flex flex-col gap-3 items-center">
            {/* Sign In button — shown when not authenticated */}
            {!isAuthenticated && (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
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
            )}

            {/* Reset Admin Access — shown when authenticated but access denied */}
            {isAuthenticated && initError && (
              <div className="w-full">
                <button
                  onClick={handleResetAndClaim}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-6 py-2.5 border border-foreground text-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {resetAdmin.isPending ? 'Resetting…' : 'Claiming access…'}
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      Reset Admin &amp; Claim Access
                    </>
                  )}
                </button>
                <p className="text-xs opacity-40 mt-2 text-center">
                  This will transfer admin access to your current account.
                </p>
                {resetError && (
                  <p className="text-xs mt-2 text-center opacity-70 border border-foreground/20 px-3 py-2">
                    {resetError}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => navigate({ to: '/' })}
              className="px-6 py-2 border border-foreground/20 text-foreground text-sm hover:bg-foreground/5 transition-colors w-full"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while reset+claim is in progress
  if (isResetting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-2 opacity-50">
          <Loader2 size={18} className="animate-spin" />
          <p className="text-sm">Transferring admin access…</p>
        </div>
      </div>
    );
  }

  // Still waiting for admin status to refresh after successful init
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex items-center gap-2 opacity-50">
          <Loader2 size={18} className="animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

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
