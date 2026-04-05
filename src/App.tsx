import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { Add } from './pages/Add';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const { theme } = useStore();

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

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
