'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PESTICIDES_DATA } from '../../lib/data/pesticides';
import PesticideImageAnalysis from '../../components/pesticides/PesticideImageAnalysis';
import {
  FlaskConical,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Filter,
} from 'lucide-react';

export default function PesticidesPage() {
  const { t, isTelugu } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    { id: 'All', label: t('pesticides.categoryAll') },
    { id: 'Insecticide', label: t('pesticides.categoryInsecticide') },
    { id: 'Fungicide', label: t('pesticides.categoryFungicide') },
    { id: 'Herbicide', label: t('pesticides.categoryHerbicide') },
    { id: 'Bio-pesticide', label: t('pesticides.categoryBio') },
  ];

  const filteredPesticides = PESTICIDES_DATA.filter((p) => {
    if (verifiedOnly && !p.isVerified) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchIngredient = p.activeIngredient.toLowerCase().includes(q);
      const matchCrops = p.approvedCrops.some((c) => c.toLowerCase().includes(q)) ||
        p.approvedCropsTe.some((c) => c.includes(q));
      const matchPests = p.targetPests.some((pest) => pest.toLowerCase().includes(q)) ||
        p.targetPestsTe.some((pest) => pest.includes(q));

      return matchName || matchBrand || matchIngredient || matchCrops || matchPests;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
          <FlaskConical className="w-4 h-4 text-purple-600" />
          <span>{t('pesticides.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('pesticides.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {t('pesticides.subtitle')}
        </p>
      </div>

      <PesticideImageAnalysis />

      {/* Official Label Warning Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">{t('weather.advisoryHeading')}: </span>
          <span>{t('pesticides.officialWarning')}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pesticides.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>{t('pesticides.verifiedOnly')}</span>
          </label>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pesticide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPesticides.map((pest) => (
          <div
            key={pest.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {pest.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                    {pest.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {pest.brand}
                  </div>
                </div>

                {pest.isVerified ? (
                  <span
                    className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0"
                    title={t('common.verified')}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                ) : (
                  <span
                    className="p-1.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0"
                    title={t('common.unverified')}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <strong className="text-slate-700">{t('pesticides.approvedCrops')}: </strong>
                  <span className="text-slate-600">
                    {isTelugu ? pest.approvedCropsTe.join(', ') : pest.approvedCrops.join(', ')}
                  </span>
                </div>

                <div>
                  <strong className="text-slate-700">{t('pesticides.targetPests')}: </strong>
                  <span className="text-slate-600">
                    {isTelugu ? pest.targetPestsTe.join(', ') : pest.targetPests.join(', ')}
                  </span>
                </div>

                <div>
                  <strong className="text-slate-700">{t('pesticides.dosage')}: </strong>
                  <span className="text-emerald-800 font-semibold">
                    {isTelugu ? pest.dosageTe : pest.dosage}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {pest.isVerified ? 'CIBRC / ANGRAU' : 'Demo Record'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProduct(pest)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
              >
                {t('common.viewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.isVerified ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {t('common.verified')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {t('common.unverified')} (Demo)
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  {selectedProduct.name}
                </h2>
                <div className="text-xs text-slate-500">{selectedProduct.brand}</div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500 block">{t('pesticides.activeIngredient')}</span>
                <span className="font-bold text-slate-900">{selectedProduct.activeIngredient}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500 block">{t('pesticides.formulation')}</span>
                <span className="font-bold text-slate-900">{selectedProduct.formulation}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500 block">{t('pesticides.preHarvestInterval')}</span>
                <span className="font-bold text-emerald-800">
                  {selectedProduct.preHarvestIntervalDays} {isTelugu ? 'రోజులు' : 'Days'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-500 block">{t('pesticides.reentryPeriod')}</span>
                <span className="font-bold text-slate-900">
                  {selectedProduct.reentryHours} {isTelugu ? 'గంటలు' : 'Hours'}
                </span>
              </div>
            </div>

            {/* Detailed Dosage & Application */}
            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs sm:text-sm">
              <div>
                <strong className="text-slate-800 block mb-1">{t('pesticides.dosage')}:</strong>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold">
                  {isTelugu ? selectedProduct.dosageTe : selectedProduct.dosage}
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">{t('pesticides.applicationMethod')}:</strong>
                <p className="text-slate-700">
                  {isTelugu ? selectedProduct.applicationMethodTe : selectedProduct.applicationMethod}
                </p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">{t('pesticides.safetyGear')}:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(isTelugu ? selectedProduct.safetyEquipmentTe : selectedProduct.safetyEquipment).map(
                    (gear, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                      >
                        ✓ {gear}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong>{t('pesticides.verificationSource')}: </strong>
                <span>{selectedProduct.source}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
