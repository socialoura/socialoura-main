'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = theme === 'dark' || (!theme && true); // default to dark
    
    setIsDark(prefersDark);
    
    // Apply theme immediately
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setMounted(true);
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
