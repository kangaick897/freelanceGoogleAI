import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { Add } from './pages/Add';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);
  const { theme, session, setSession, setUser } = useStore();

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // Supabase Auth Listener
  useEffect(() => {
    let initialized = false;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        useStore.getState().fetchData();
        initialized = true;
      }
      setIsInitializing(false);
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        // Only call fetchData if getSession hasn't already done so
        if (!initialized) {
          initialized = true;
          useStore.getState().fetchData();
        }
      } else {
        setUser({ id: undefined, email: undefined });
        initialized = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-app">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <Home />;
      case 'tasks': return <Tasks />;
      case 'add': return <Add />;
      case 'dashboard': return <Dashboard />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative overflow-hidden">
      {/* Background decorations for Glassmorphism */}
      <div className="fixed top-[-10%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-80 h-80 bg-primary-light/40 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Content Area */}
      <main className="relative z-10 p-5 min-h-screen overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}
