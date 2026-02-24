'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';

interface UserProfile {
  username: string;
  fullName: string;
  profilePicture: string;
  isVerified: boolean;
  followerCount?: string;
}

interface UserSearchInputProps {
  platform: 'instagram' | 'tiktok' | 'twitter';
  onUserConfirmed: (username: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearchInput({
  platform,
  onUserConfirmed,
  placeholder = 'username',
  className = '',
}: UserSearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundProfile, setFoundProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.trim().length > 0) {
      setIsSearching(true);
      setError(null);

      debounceTimerRef.current = setTimeout(() => {
        searchUser(inputValue.trim());
      }, 500);
    } else {
      setFoundProfile(null);
      setShowDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  const searchUser = async (username: string) => {
    try {
      const response = await fetch(`/api/user/search?username=${encodeURIComponent(username)}&platform=${platform}`);
      
      if (response.ok) {
        const data = await response.json();
        setFoundProfile(data);
        setShowDropdown(true);
        setError(null);
      } else {
        setFoundProfile({
          username: username,
          fullName: username,
          profilePicture: getDefaultAvatar(username),
          isVerified: false,
        });
        setShowDropdown(true);
        setError(null);
      }
    } catch {
      setFoundProfile({
        username: username,
        fullName: username,
        profilePicture: getDefaultAvatar(username),
        isVerified: false,
      });
      setShowDropdown(true);
      setError(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getDefaultAvatar = (username: string) => {
    const colors = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'];
    const colorIndex = username.charCodeAt(0) % colors.length;
    const firstLetter = username.charAt(0).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${colors[colorIndex]}"/><text x="50" y="50" font-size="45" text-anchor="middle" dy=".35em" fill="white" font-family="system-ui">${firstLetter}</text></svg>`
    )}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/@/g, '');
    setInputValue(value);
  };

  const handleConfirmUser = () => {
    if (foundProfile) {
      onUserConfirmed(foundProfile.username);
      setShowDropdown(false);
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
          <span className="text-lg font-medium">@</span>
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-4 text-base bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all"
          onFocus={() => foundProfile && setShowDropdown(true)}
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          ) : foundProfile ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Search className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {showDropdown && foundProfile && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <img
                  src={foundProfile.profilePicture}
                  alt={foundProfile.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                  {getPlatformIcon()}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-white font-semibold truncate">
                    {foundProfile.fullName}
                  </p>
                  {foundProfile.isVerified && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-400">@{foundProfile.username}</p>
                {foundProfile.followerCount && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {foundProfile.followerCount} followers
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirmUser}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Confirm & Continue</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Is this your account? Click to continue
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-2 w-full bg-red-500/10 border border-red-500/50 rounded-xl p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
