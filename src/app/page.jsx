'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import {
  CloudSun,
  Bot,
  FlaskConical,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  Leaf,
} from 'lucide-react';

export default function LandingPage() {
  const { t, isTelugu } = useLanguage();

  const featureCards = [
    {
      title: t('landing.weatherFeatureTitle'),
      desc: t('landing.weatherFeatureDesc'),
      icon: CloudSun,
      href: '/weather',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      badge: isTelugu ? 'రియల్-టైమ్ రాడార్ & వర్షం' : 'Live Radar & Rain',
    },
    {
      title: t('landing.advisorFeatureTitle'),
      desc: t('landing.advisorFeatureDesc'),
      icon: Bot,
      href: '/advisor',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: isTelugu ? 'తెలుగు & English AI' : 'Telugu & English AI',
    },
    {
      title: t('landing.pesticideFeatureTitle'),
      desc: t('landing.pesticideFeatureDesc'),
      icon: FlaskConical,
      href: '/pesticides',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badge: isTelugu ? 'CIBRC / ANGRAU ధృవీకరించినవి' : 'CIBRC / ANGRAU Verified',
    },
    {
      title: t('landing.marketFeatureTitle'),
      desc: t('landing.marketFeatureDesc'),
      icon: Store,
      href: '/markets',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: isTelugu ? 'తాజా వేలం ధరలు & MSP' : 'Live Auctions & MSP',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-700/60 border border-emerald-500/50 rounded-full px-4 py-1.5 text-xs md:text-sm text-emerald-100 shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{t('landing.heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-base shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
            >
              {t('landing.getStarted')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/my-farm"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 text-white border border-emerald-600 font-semibold text-base transition-all"
            >
              <Leaf className="w-5 h-5 mr-2 text-emerald-300" />
              {t('nav.myFarm')}
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-emerald-700/50">
            <div className="p-3 bg-emerald-800/30 rounded-lg border border-emerald-700/30">
              <div className="text-2xl font-bold text-emerald-300">26</div>
              <div className="text-xs text-emerald-200">ఆంధ్రప్రదేశ్ జిల్లాలు</div>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-lg border border-emerald-700/30">
              <div className="text-2xl font-bold text-emerald-300">100%</div>
              <div className="text-xs text-emerald-200">ఉచిత సేవ (Zero Cost)</div>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-lg border border-emerald-700/30">
              <div className="text-2xl font-bold text-emerald-300">తెలుగు</div>
              <div className="text-xs text-emerald-200">మొదటి ప్రాధాన్యత</div>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-lg border border-emerald-700/30">
              <div className="text-2xl font-bold text-emerald-300">CIBRC</div>
              <div className="text-xs text-emerald-200">ధృవీకరించిన రికార్డులు</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border ${card.borderColor} ${card.bgColor} p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 text-slate-700 border border-slate-200 shadow-sm">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {card.title}
                  </h3>

                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={card.href}
                    className="inline-flex items-center text-sm font-bold text-emerald-800 hover:text-emerald-950 group"
                  >
                    <span>{t('common.viewDetails')}</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Choose AgroCast AI */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('landing.benefitsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('landing.benefit1Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('landing.benefit1Desc')}</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('landing.benefit2Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('landing.benefit2Desc')}</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('landing.benefit3Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t('landing.benefit3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base">
            {t('landing.ctaSubtitle')}
          </p>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 shadow-md transition-all"
            >
              {t('landing.goToDashboard')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
