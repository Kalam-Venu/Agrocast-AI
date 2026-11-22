'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '../lib/supabase/client';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 'farmer-demo-ap-01',
  fullName: 'వెంకటేశ్వర రావు (Venkateswara Rao)',
  email: 'farmer@agrocast.ap.gov.in',
  phone: '+91 98480 22338',
  preferredLanguage: 'te',
  notificationsEnabled: true,
  isDemo: true,
};

function mapSupabaseUser(authUser) {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    fullName: metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Farmer',
    email: authUser.email || '',
    phone: metadata.phone || authUser.phone || '',
    preferredLanguage: 'te',
    notificationsEnabled: true,
    isDemo: false,
  };
}

async function readError(response, fallback) {
  const result = await response.json().catch(() => ({}));
  return new Error(result.error || fallback);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setUser(DEFAULT_DEMO_USER);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
      setAuthError('');
    });

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error && error.name !== 'AuthSessionMissingError') {
        setAuthError('Could not verify the current Supabase session.');
      }
      setUser(data.user ? mapSupabaseUser(data.user) : null);
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      console.error('Supabase session restoration failed:', error.message);
      setAuthError('Could not verify the current Supabase session.');
      setUser(null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || user.isDemo || !isSupabaseConfigured) return undefined;
    let active = true;
    fetch('/api/profile')
      .then(async (response) => {
        if (!response.ok) throw await readError(response, 'Could not load your profile.');
        return response.json();
      })
      .then(({ profile }) => {
        if (!active || !profile) return;
        setUser((current) => current?.id === user.id ? { ...current, ...profile, isDemo: false } : current);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Supabase profile load failed:', error.message);
        setAuthError(error.message);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const login = async (email, password) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error('Supabase authentication is not configured.');

    setLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Supabase did not return an authenticated user.');
      setUser(mapSupabaseUser(data.user));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, phone = '') => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error('Supabase authentication is not configured.');

    setLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
        },
      });
      if (error) throw error;
      if (data.session && data.user) setUser(mapSupabaseUser(data.user));
      return { success: true, confirmationRequired: !data.session };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = () => {
    if (isSupabaseConfigured) {
      throw new Error('Demo login is disabled when Supabase authentication is configured.');
    }
    setUser(DEFAULT_DEMO_USER);
    try {
      localStorage.setItem('agrocast_user', JSON.stringify(DEFAULT_DEMO_USER));
    } catch (error) {
      console.error('Could not save demo profile locally:', error.message);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      try {
        localStorage.removeItem('agrocast_user');
      } catch (error) {
        console.error('Could not remove local demo profile:', error.message);
      }
    }
    setUser(null);
  };

  const updateProfile = async (updatedFields) => {
    if (!user) throw new Error('Sign in before updating your profile.');
    if (user.isDemo || !isSupabaseConfigured) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      try {
        localStorage.setItem('agrocast_user', JSON.stringify(updated));
      } catch (error) {
        console.error('Could not save demo profile locally:', error.message);
      }
      return updated;
    }

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    if (!response.ok) throw await readError(response, 'Could not update your profile.');
    const { profile } = await response.json();
    const updated = { ...user, ...profile, isDemo: false };
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isSupabaseConfigured,
        isAuthenticated: Boolean(user),
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
