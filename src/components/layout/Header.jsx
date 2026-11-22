'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';
import {
  Sprout,
  CloudSun,
  Bot,
  FlaskConical,
  Store,
  Users,
  LayoutDashboard,
  User,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/weather', label: t('nav.weather'), icon: CloudSun },
    { href: '/my-farm', label: t('nav.myFarm'), icon: Sprout },
    { href: '/advisor', label: t('nav.advisor'), icon: Bot },
    { href: '/pesticides', label: t('nav.pesticides'), icon: FlaskConical },
    { href: '/markets', label: t('nav.markets'), icon: Store },
    { href: '/community', label: t('nav.community'), icon: Users },
  ];

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-emerald-950 font-sans">
                {t('appName')}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline">
                AP Agricultural Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-gray-700 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-1.5 ${active ? 'text-emerald-700' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher & Profile */}
          <div className="hidden xl:flex items-center space-x-3">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <Link
                href="/profile"
                className={`p-2 rounded-full border transition-all ${
                  isActive('/profile')
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                }`}
                title={user?.fullName || t('nav.profile')}
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex items-center space-x-2 xl:hidden">
            <LanguageSwitcher className="hidden sm:inline-flex scale-90" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              aria-label={t('nav.openMenu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="sm:hidden flex justify-end pb-2">
            <LanguageSwitcher />
          </div>
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium ${
                    active
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-emerald-700' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium ${
                isActive('/profile')
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <User className="w-5 h-5 mr-3 text-gray-500" />
              {t('nav.profile')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
