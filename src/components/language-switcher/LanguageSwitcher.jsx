'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-emerald-50 border border-emerald-300 rounded-full p-1 shadow-sm ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      <div className="flex items-center pl-2 pr-1 text-emerald-800">
        <Globe className="w-4 h-4 mr-1 text-emerald-600" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('te')}
        className={`px-3 py-1 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 ${
          language === 'te'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-emerald-900 hover:bg-emerald-100'
        }`}
        aria-pressed={language === 'te'}
      >
        తెలుగు
      </button>
      <span className="text-emerald-300 font-bold px-0.5">|</span>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-emerald-900 hover:bg-emerald-100'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
    </div>
  );
}
