import React, { useEffect, useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useGetAdminStatus, useInitializeAdmin, useIsCallerAdmin, useResetAdmin } from '../hooks/useQueries';
import AdminSidebar from '../components/AdminSidebar';
import CMSContentEditor from '../components/CMSContentEditor';
import SettingsPage from './SettingsPage';
import { Loader2, ShieldAlert, RefreshCw, LogIn } from 'lucide-react';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

export default function AdminDashboard() {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [activeSection, setActiveSection] = useState<AdminSection>('content');
  const [initAttempted, setInitAttempted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    data: adminExists,
    isLoading: adminStatusLoading,
    refetch: refetchAdminStatus,
  } = useGetAdminStatus();

  const {
    data: isCallerAdmin,
    isLoading: callerAdminLoading,
    refetch: refetchCallerAdmin,
  } = useIsCallerAdmin();

  const initializeAdmin = useInitializeAdmin();
  const resetAdmin = useResetAdmin();

  // When identity changes (login), invalidate actor-dependent queries after a short delay
  useEffect(() => {
    if (identity) {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [identity, queryClient]);

  // Reset init state when identity changes so a new login can re-trigger init
  useEffect(() => {
    setInitAttempted(false);
    setInitError(null);
  }, [identity]);

  // Auto-initialize admin if no admin exists and user is authenticated
  useEffect(() => {
    if (
      isAuthenticated &&
      !actorFetching &&
      actor &&
      adminExists === false &&
      !initAttempted &&
      !initializeAdmin.isPending
    ) {
      setInitAttempted(true);
      setInitError(null);

      initializeAdmin.mutate(
        { adminToken: '', userProvidedToken: '' },
        {
          onSuccess: (result) => {
            if (result.__kind__ === 'success') {
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
                queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
              }, 300);
            } else {
              setInitError(result.error || 'Failed to initialize admin');
            }
          },
          onError: (err) => {
            setInitError(err instanceof Error ? err.message : 'Failed to initialize admin');
          },
        }
      );
    }
  }, [isAuthenticated, actorFetching, actor, adminExists, initAttempted, initializeAdmin, queryClient]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await login();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup') || msg.includes('blocked')) {
        setLoginError('Popup blocked. Please allow popups for this site and try again.');
      } else if (!msg.includes('already authenticated')) {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleResetAdmin = async () => {
    setInitError(null);
    setInitAttempted(false);
    try {
      await resetAdmin.mutateAsync();
      await refetchAdminStatus();
      await refetchCallerAdmin();
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  const handleRefetch = useCallback(() => {
    setInitAttempted(false);
    setInitError(null);
    queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
  }, [queryClient]);

  // Loading states
  const isLoading =
    isInitializing ||
    actorFetching ||
    adminStatusLoading ||
    (isAuthenticated && callerAdminLoading) ||
    initializeAdmin.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black dark:text-white" size={32} />
          <p className="text-sm uppercase tracking-widest text-black dark:text-white">
            {initializeAdmin.isPending ? 'Initializing admin...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
          <ShieldAlert size={48} className="text-black dark:text-white" />
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
            Admin Access
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Sign in with Internet Identity to access the admin dashboard.
          </p>
          {loginError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 w-full">
              {loginError}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Init error (e.g., admin already set by someone else)
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
          <ShieldAlert size={48} className="text-black dark:text-white" />
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
            Access Denied
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">{initError}</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRefetch}
              className="flex items-center justify-center gap-2 border border-black dark:border-white text-black dark:text-white px-6 py-2 text-sm font-bold uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <button
              onClick={handleResetAdmin}
              disabled={resetAdmin.isPending}
              className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {resetAdmin.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Reset Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not admin (and admin already exists)
  if (adminExists && isCallerAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
          <ShieldAlert size={48} className="text-black dark:text-white" />
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
            Access Denied
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Your account does not have admin privileges.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRefetch}
              className="flex items-center justify-center gap-2 border border-black dark:border-white text-black dark:text-white px-6 py-2 text-sm font-bold uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              Retry Check
            </button>
            <button
              onClick={handleResetAdmin}
              disabled={resetAdmin.isPending}
              className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {resetAdmin.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Reset Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-black dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1 font-mono">
              {identity?.getPrincipal().toString().slice(0, 24)}...
            </p>
          </div>

          {activeSection === 'settings' ? (
            <SettingsPage />
          ) : (
            <CMSContentEditor section={activeSection} />
          )}
        </div>
      </main>
    </div>
  );
}
