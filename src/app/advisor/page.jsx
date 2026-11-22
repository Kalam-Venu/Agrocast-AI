'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFarm } from '../../contexts/FarmContext';
import { withLoadingState } from '../../lib/advisor/withLoadingState.mjs';
import {
  Bot,
  Send,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  User,
} from 'lucide-react';

function AdvisorContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { t, isTelugu, language } = useLanguage();
  const { farmProfile, isLoaded } = useFarm();

  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: t('advisor.welcomeMessage'),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [diagnosticsError, setDiagnosticsError] = useState('');
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [diagnosisCropId, setDiagnosisCropId] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === 'msg-welcome'
          ? { ...message, content: t('advisor.welcomeMessage') }
          : message
      )
    );
  }, [language]);

  useEffect(() => {
    if (!isLoaded) return;
    setDiagnosisCropId((currentId) =>
      farmProfile.crops.some((crop) => crop.id === currentId)
        ? currentId
        : farmProfile.crops[0]?.id || ''
    );
  }, [isLoaded, farmProfile.crops]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setDiagnosticsError(t('advisor.invalidImageType'));
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDiagnosticsError(t('advisor.imageTooLarge'));
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          setDiagnosticsError(t('common.error'));
          return;
        }
        setSelectedImage(reader.result);
        setDiagnosticsResult(null);
        setDiagnosticsError('');
      };
      reader.onerror = () => setDiagnosticsError(t('common.error'));
      reader.readAsDataURL(file);
    }
  };

  // Run crop image diagnosis
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    const selectedCrop = farmProfile.crops.find(
      (crop) => crop.id === diagnosisCropId
    );
    const cropName = selectedCrop?.cropName;
    if (!cropName) {
      setDiagnosticsError(t('advisor.noCropForDiagnosis'));
      return;
    }
    setAnalyzingImage(true);
    setDiagnosticsError('');
    try {
      const res = await fetch('/api/advisor/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          cropName,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDiagnosticsError(data.error || t('common.error'));
        return;
      }
      setDiagnosticsResult(data.diagnostics);
    } catch (err) {
      console.error('Image analysis error:', err);
      setDiagnosticsError(t('common.error'));
    } finally {
      setAnalyzingImage(false);
    }
  };

  const sendMessage = async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query || !isLoaded) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    await withLoadingState(setLoading, async () => {
      try {
        let weatherContext;
        const latitude = Number(farmProfile?.location?.latitude);
        const longitude = Number(farmProfile?.location?.longitude);
        const coordinatesAreApproximate =
          farmProfile?.location?.approximateCoords === true;
        if (
          !coordinatesAreApproximate &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          try {
            const weatherResponse = await fetch(
              `/api/weather/current?lat=${latitude}&lon=${longitude}&lang=${language}`,
              { signal: AbortSignal.timeout(8000) }
            );
            if (weatherResponse.ok)
              weatherContext = await weatherResponse.json();
          } catch (weatherError) {
            console.warn(
              'Farm weather context unavailable:',
              weatherError.name
            );
          }
        }

        const res = await fetch('/api/advisor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(55000),
          body: JSON.stringify({
            message: query,
            conversationHistory: messages
              .filter((message) => !message.error && !message.failed)
              .slice(-8)
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
            farmProfile,
            weatherContext,
            language,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
          const apiError = new Error(data.error || t('advisor.messageError'));
          apiError.isApiError = true;
          throw apiError;
        }

        const assistantMsg = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (requestError) {
        console.error('Chat request failed:', requestError);
        setMessages((prev) => [
          ...prev.map((message) =>
            message.id === userMsg.id ? { ...message, failed: true } : message
          ),
          {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content: requestError.isApiError
              ? requestError.message
              : t('advisor.messageError'),
            error: true,
            retryQuery: query,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      }
    });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    await sendMessage(inputMessage);
  };

  const handleQuickQuestion = (q) => {
    setInputMessage(q);
  };

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          <Bot className="w-4 h-4 text-emerald-600" />
          <span>{t('advisor.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('advisor.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('advisor.subtitle')}
        </p>
      </div>

      {/* Farm Context Pill */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-emerald-950 gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 font-medium">
          <span className="font-bold">{t('dashboard.farmLocation')}:</span>
          <span>
            {farmProfile.location.village}, {farmProfile.location.mandal} (
            {farmProfile.location.district})
          </span>
          <span className="text-emerald-400">|</span>
          <span className="font-bold">{t('farm.soilStep')}:</span>
          <span>{farmProfile.soilType}</span>
          <span className="text-emerald-400">|</span>
          <span className="font-bold">{t('dashboard.cropStatus')}:</span>
          <span>{farmProfile.crops.map((c) => c.cropName).join(', ')}</span>
        </div>
        <div className="text-[11px] text-emerald-700 bg-white/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {language === 'te' ? 'జవాబు భాష: తెలుగు' : 'Response Language: English'}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Interface */}
        <div className="min-w-0 lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px]">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                    msg.role === 'user'
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-emerald-500 to-green-700 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60 shadow-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      msg.role === 'user'
                        ? 'text-emerald-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                  {msg.error && (
                    <button
                      type="button"
                      onClick={() => sendMessage(msg.retryQuery)}
                      disabled={loading}
                      className="mt-2 inline-flex items-center gap-1 rounded-md text-xs font-medium text-emerald-800 underline disabled:opacity-50"
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden="true" />
                      {t('advisor.retry')}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 rounded-2xl p-4 text-xs text-slate-600 rounded-tl-none border border-slate-200 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>
                    {isTelugu
                      ? 'వ్యవసాయ డేటా ఆధారంగా ఆలోచిస్తోంది...'
                      : 'Consulting agricultural models...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar */}
          <div className="min-w-0 px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {t('advisor.suggestedQuestionsTitle')}
            </span>
            {t('advisor.suggestedQuestions').map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-[11px] text-slate-700 font-medium rounded-full border border-slate-200 transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('advisor.inputPlaceholder')}
              className="min-w-0 flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition-all disabled:opacity-50 inline-flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Side Panel: Crop Image Diagnostics & Safety Guidelines */}
        <div className="min-w-0 space-y-6">
          {/* Crop Image Diagnosis Tool */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                {t('advisor.uploadImage')}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isTelugu
                ? 'పంట ఆకులపై మచ్చలు, రంధ్రాలు లేదా పురుగుల ఫోటోను అప్‌లోడ్ చేసి తక్షణ ప్రాథమిక రోగ నిర్ధారణ పొందండి.'
                : 'Upload a clear photograph of crop leaves or pests to obtain automated preliminary diagnostics.'}
            </p>

            <label className="block text-xs font-semibold text-slate-700">
              {t('advisor.selectCropForDiagnosis')}
              <select
                value={diagnosisCropId}
                onChange={(e) => setDiagnosisCropId(e.target.value)}
                disabled={!farmProfile.crops.length}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
              >
                {farmProfile.crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.cropName}
                  </option>
                ))}
              </select>
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {!selectedImage ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all"
              >
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-xs font-semibold">
                  {t('advisor.uploadImage')}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Uploaded Crop"
                    className="max-h-48 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setDiagnosticsResult(null);
                      setDiagnosticsError('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={analyzingImage}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50 inline-flex items-center justify-center"
                >
                  {analyzingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>
                        {isTelugu
                          ? 'లక్షణాలను విశ్లేషించండి'
                          : 'Analyze Visible Symptoms'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {diagnosticsError && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {diagnosticsError}
              </p>
            )}

            {/* Diagnostic Evaluation Display */}
            {diagnosticsResult && (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                    {t('advisor.diagnosticsTitle')}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {t(
                      diagnosticsResult.confidenceLevel === 'high'
                        ? 'advisor.confidenceHigh'
                        : diagnosticsResult.confidenceLevel === 'moderate'
                          ? 'advisor.confidenceModerate'
                          : 'advisor.confidenceLow'
                    )}
                  </span>
                </div>

                {diagnosticsResult.symptomsIdentified?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-600">
                      {t('advisor.symptomsIdentified')}
                    </div>
                    <ul className="list-disc pl-5 text-xs text-slate-800">
                      {diagnosticsResult.symptomsIdentified.map(
                        (symptom, index) => (
                          <li key={`${index}-${symptom}`}>{symptom}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    {t('advisor.possibleIssue')}
                  </div>
                  <div className="text-sm font-extrabold text-purple-950">
                    {diagnosticsResult.possibleIssue}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    {t('advisor.recommendation')}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed mt-1">
                    {diagnosticsResult.recommendation}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 italic border-t border-purple-200/60 pt-2">
                  {diagnosticsResult.disclaimer}
                </div>
              </div>
            )}
          </div>

          {/* AI Safety & Disclaimer Card */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{t('advisor.safetyNotice')}</span>
            </div>
            <p className="text-[11px] text-amber-950/80 leading-relaxed">
              {t('advisor.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
          లోడ్ అవుతోంది... (Loading Advisor...)
        </div>
      }
    >
      <AdvisorContent />
    </Suspense>
  );
}
