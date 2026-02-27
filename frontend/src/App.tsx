import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetAdminStatus, useGetBodyTextColor, useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useTheme } from './hooks/useTheme';
import { EditModeContext, useEditModeState } from './hooks/useEditMode';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import PressKitPage from './pages/PressKitPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ─── Theme + Body Color Context ───────────────────────────────────────────────
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;
}
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});
export function useAppTheme() {
  return useContext(ThemeContext);
}

// ─── Profile Setup Modal ──────────────────────────────────────────────────────
function ProfileSetupModal({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('');
  const { isDark } = useAppTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`w-full max-w-sm p-8 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h2 className="font-heading text-2xl mb-2">Welcome, Admin</h2>
        <p className="text-sm mb-6 opacity-60">Enter your name to set up your profile.</p>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="mb-4"
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
        />
        <Button
          className="w-full"
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function Layout() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useGetAdminStatus();
  const { data: bodyTextColor } = useGetBodyTextColor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const editModeState = useEditModeState();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && isAdmin && !profileLoading && profileFetched && userProfile === null;

  // Apply body text color CSS variable
  useEffect(() => {
    if (bodyTextColor) {
      document.documentElement.style.setProperty('--body-text-color', bodyTextColor);
    }
  }, [bodyTextColor]);

  return (
    <EditModeContext.Provider value={editModeState}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        {showProfileSetup && (
          <ProfileSetupModal
            onSave={name => saveProfile.mutate(name)}
          />
        )}
      </div>
      <Toaster />
    </EditModeContext.Provider>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const pressKitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/press-kit',
  component: PressKitPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, pressKitRoute, adminRoute, settingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const themeState = useTheme();

  return (
    <ThemeContext.Provider value={themeState}>
      <RouterProvider router={router} />
    </ThemeContext.Provider>
  );
}
