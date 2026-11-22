'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../i18n';
import { defaultLanguage, supportedLanguages } from '../i18n/config';
import { useAuth } from './AuthContext';

const LanguageContext = createContext({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (path) => path,
});

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(defaultLanguage);
  const [mounted, setMounted] = useState(false);
  const [persistenceError, setPersistenceError] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem('agrocast_language');
      if (savedLang && supportedLanguages.includes(savedLang)) {
        document.documentElement.lang = savedLang;
        setLanguageState(savedLang);
      } else {
        // Enforce Telugu as default on first visit
        document.documentElement.lang = defaultLanguage;
        setLanguageState(defaultLanguage);
        localStorage.setItem('agrocast_language', defaultLanguage);
      }
    } catch {
      // Fallback
      document.documentElement.lang = defaultLanguage;
      setLanguageState(defaultLanguage);
    }
  }, []);

  useEffect(() => {
    if (!user || user.isDemo) return undefined;
    let active = true;
    fetch('/api/profile/language')
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load your language preference.');
        return result;
      })
      .then(({ preferredLanguage }) => {
        if (!active || !supportedLanguages.includes(preferredLanguage)) return;
        document.documentElement.lang = preferredLanguage;
        setLanguageState(preferredLanguage);
        try {
          localStorage.setItem('agrocast_language', preferredLanguage);
        } catch (error) {
          console.error('Error caching language preference locally:', error.message);
        }
        setPersistenceError('');
      })
      .catch((error) => {
        if (!active) return;
        console.error('Supabase language preference load failed:', error.message);
        setPersistenceError(error.message);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const setLanguage = (newLang) => {
    if (supportedLanguages.includes(newLang)) {
      document.documentElement.lang = newLang;
      setLanguageState(newLang);
      setPersistenceError('');
      try {
        localStorage.setItem('agrocast_language', newLang);
      } catch (e) {
        console.error('Error saving language preference', e);
      }
      if (user && !user.isDemo) {
        fetch('/api/profile/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLang }),
        }).then(async (response) => {
          if (response.ok) return;
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'Could not save your language preference.');
        }).catch((error) => {
          console.error('Supabase language preference update failed:', error.message);
          setPersistenceError(error.message);
        });
      }
    }
  };

  const t = (path) => {
    return getTranslation(language, path);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isTelugu: language === 'te',
      persistenceError,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
