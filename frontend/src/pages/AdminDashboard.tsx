import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAdminStatus } from '../hooks/useQueries';
import { useAppTheme } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import CMSContentEditor from '../components/CMSContentEditor';
import { AlertCircle } from 'lucide-react';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useGetAdminStatus();
  const navigate = useNavigate();
  const { isDark } = useAppTheme();
  const [activeSection, setActiveSection] = useState<AdminSection>('content');

  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-sm opacity-50">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
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
