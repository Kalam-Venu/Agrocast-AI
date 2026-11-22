'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sprout, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                {t('appName')}
              </span>
            </div>
            <p className="text-sm text-emerald-200/90 leading-relaxed max-w-md">
              {t('appTagline')}. Dedicated to supporting the farmers of Andhra Pradesh with location-accurate meteorological data, agronomic AI assistance, verified pesticide advice, and transparent market rates.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounded in IMD, ANGRAU, CIBRC & AGMARKNET Data Sources</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3">
              {t('dashboard.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/weather" className="hover:text-white transition-colors">
                  {t('nav.weather')}
                </Link>
              </li>
              <li>
                <Link href="/my-farm" className="hover:text-white transition-colors">
                  {t('nav.myFarm')}
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="hover:text-white transition-colors">
                  {t('nav.advisor')}
                </Link>
              </li>
              <li>
                <Link href="/pesticides" className="hover:text-white transition-colors">
                  {t('nav.pesticides')}
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  {t('nav.markets')}
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  {t('nav.community')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Advisory Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center">
              <HeartHandshake className="w-4 h-4 mr-1 text-amber-400" />
              రైతులకు గమనిక (Disclaimer)
            </h4>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              ఆగ్రోకాస్ట్ AI అందించే సమాచారం ప్రాథమిక వ్యవసాయ మార్గదర్శకత్వం కోసం మాత్రమే. రసాయన పురుగుమందుల వాడకానికి ముందు లేబుల్ సూచనలు మరియు స్థానిక వ్యవసాయ అధికారుల సలహాలను పాటించండి.
            </p>
            <div className="mt-4 text-xs text-emerald-400 font-medium">
              భాష: తెలుగు (డిఫాల్ట్) & English
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-emerald-400">
          <p>© {new Date().getFullYear()} AgroCast AI. Built for Andhra Pradesh Farmers.</p>
          <p className="mt-2 sm:mt-0">Free & Open Agricultural Intelligence</p>
        </div>
      </div>
    </footer>
  );
}
