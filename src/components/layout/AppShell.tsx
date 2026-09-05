'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Default to open on large screens
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
      if (large) setSidebarOpen(true);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
      {/* Independent Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen || isLargeScreen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area with Independent Scrollbar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Fixed Top Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Independent Viewport Main Content Scrollbar */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
