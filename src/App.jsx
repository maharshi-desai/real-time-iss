import React, { useState, useEffect } from 'react';
import ISSTracker from './components/ISSTracker/ISSTracker';
import NewsDashboard from './components/News/NewsDashboard';
import ChatBubble from './components/Chatbot/ChatBubble';
import { Moon, Sun } from 'lucide-react';
import { ToastProvider } from './components/Toast';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <ToastProvider>
      <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-4">
          <div>
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-1">Mission Control Dashboard</h2>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Real-Time ISS and News Intelligence</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-border/50 transition-colors shadow-sm text-sm font-medium shrink-0"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            Switch to {darkMode ? 'Light' : 'Dark'} mode
          </button>
        </header>

        <main className="flex flex-col gap-6 w-full">
          {/* Top Section: ISS Tracker includes Map and Stats and the Speed Chart inline */}
          <ISSTracker />

          {/* Bottom Section: News Dashboard taking full width */}
          <NewsDashboard />
        </main>
        
        <ChatBubble />
      </div>
    </ToastProvider>
  );
}

export default App;
