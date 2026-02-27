import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider, useTheme } from 'next-themes';
import LandingPage from './pages/LandingPage';
import PressKitPage from './pages/PressKitPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import Header from './components/Header';
import { useGetBodyTextColor } from './hooks/useQueries';
import { EditModeContext, useEditModeState } from './hooks/useEditMode';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';

// ─── Theme Context (re-exported for legacy consumers) ─────────────────────────
interface AppThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: string;
}

const AppThemeContext = createContext<AppThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  theme: 'light',
});

export function useAppTheme(): AppThemeContextType {
  return useContext(AppThemeContext);
}

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  return (
    <AppThemeContext.Provider value={{ isDark, toggleTheme, theme: theme ?? 'light' }}>
      {children}
    </AppThemeContext.Provider>
  );
}

// ─── Body text color applier ──────────────────────────────────────────────────
function BodyTextColorApplier() {
  const { data: bodyTextColor } = useGetBodyTextColor();
  useEffect(() => {
    if (bodyTextColor) {
      document.documentElement.style.setProperty('--body-text-color', bodyTextColor);
    }
  }, [bodyTextColor]);
  return null;
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function Layout() {
  const editModeState = useEditModeState();
  return (
    <EditModeContext.Provider value={editModeState}>
      <Header />
      <BodyTextColorApplier />
      <Outlet />
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

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, pressKitRoute, adminRoute, adminSettingsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── QueryClient ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppThemeProvider>
            <RouterProvider router={router} />
          </AppThemeProvider>
        </ThemeProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
