import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminStatus, useInitializeAdmin } from '../hooks/useQueries';
import { useAppTheme } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import CMSContentEditor from '../components/CMSContentEditor';
import { AlertCircle, Loader2 } from 'lucide-react';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = useGetAdminStatus();
  const initializeAdmin = useInitializeAdmin();
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const [activeSection, setActiveSection] = useState<AdminSection>('content');
  const [initError, setInitError] = useState<string | null>(null);
  const hasAttemptedInit = useRef(false);

  const isAuthenticated = !!identity;

  // Auto-initialize admin when authenticated user is not yet admin
  // This handles the case where no admin has been set yet (fresh deployment)
  useEffect(() => {
    if (
      isAuthenticated &&
      !adminLoading &&
      isAdmin === false &&
      !hasAttemptedInit.current &&
      !initializeAdmin.isPending
    ) {
      hasAttemptedInit.current = true;
      initializeAdmin.mutate(undefined, {
        onSuccess: () => {
          setInitError(null);
          refetchAdmin();
        },
        onError: (err: Error) => {
          // "Admin already initialized" means another principal is admin — show access denied
          setInitError(err.message);
        },
      });
    }
  }, [isAuthenticated, adminLoading, isAdmin]);

  // Show loading while checking admin status or attempting initialization
  if (adminLoading || initializeAdmin.isPending) {
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
          <p className="text-sm opacity-60 mb-6">
            {!isAuthenticated
              ? 'You must be signed in as admin to access this page.'
              : 'Your account does not have admin privileges.'}
          </p>
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
