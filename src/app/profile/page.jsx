'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFarm } from '../../contexts/FarmContext';
import LanguageSwitcher from '../../components/language-switcher/LanguageSwitcher';
import {
  User,
  Settings,
  Bell,
  Globe,
  Sprout,
  LogOut,
  CheckCircle2,
  Save,
  Shield,
  Smartphone,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { t, isTelugu, language, persistenceError: languagePersistenceError } = useLanguage();
  const { user, updateProfile, logout, authError, isSupabaseConfigured } = useAuth();
  const {
    farmProfile,
    isLoaded,
    isCloudStorage,
    persistenceError: farmPersistenceError,
  } = useFarm();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setNotificationsEnabled(user?.notificationsEnabled ?? true);
  }, [user?.id, user?.fullName, user?.phone, user?.notificationsEnabled]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        fullName,
        phone,
        notificationsEnabled,
        preferredLanguage: language,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (saveError) {
      setError(saveError.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      router.push('/login');
    } catch (logoutError) {
      setError(logoutError.message || t('common.error'));
    }
  };

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          <Settings className="w-4 h-4 text-emerald-600" />
          <span>{t('profile.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('profile.title')}
        </h1>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 font-semibold text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t('common.saved')}!</span>
        </div>
      )}
      {(authError || languagePersistenceError || farmPersistenceError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm" role="alert">
          {error || languagePersistenceError || farmPersistenceError || authError}
        </div>
      )}
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        {isSupabaseConfigured && user && !user.isDemo
          ? (isCloudStorage
              ? t('profile.cloudStorageNotice')
              : t('profile.cloudSyncUnavailableNotice'))
          : t('profile.localStorageNotice')}
      </p>

      {/* Main Profile & Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-emerald-600" />
            {t('profile.personalInfo')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.nameLabel')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.phoneLabel')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.emailLabel')}
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-emerald-600" />
            {t('profile.languagePreference')}
          </h2>

          <p className="text-xs text-slate-600">
            {t('profile.languageSavedDesc')}
          </p>

          <div>
            <LanguageSwitcher className="scale-105" />
          </div>
        </div>

        {/* Notifications & Weather Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-emerald-600" />
            {t('profile.notifications')}
          </h2>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs sm:text-sm text-slate-700">
              {t('profile.notificationsEnabled')}
            </span>
          </label>
        </div>

        {/* Farm Profile Shortcut */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-950 text-base flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-emerald-600" />
              {t('profile.farmDetailsLink')}
            </h3>
            <p className="text-xs text-emerald-800">
              {farmProfile.location.village
                ? `${farmProfile.location.village}, ${farmProfile.location.mandal}`
                : (isTelugu ? 'స్థానం ఇంకా నమోదు కాలేదు' : 'Farm location not registered')}
              {' '}({farmProfile.crops.length} {isTelugu ? 'పంటలు' : 'crops'})
            </p>
          </div>

          <Link
            href="/my-farm"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all text-center"
          >
            {t('common.edit')}
          </Link>
        </div>

        {/* Save Changes & Logout Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all inline-flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('profile.saveSettings')}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-sm font-semibold transition-all inline-flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </button>
        </div>
      </form>
    </div>
  );
}
