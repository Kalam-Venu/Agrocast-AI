'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFarm } from '../../contexts/FarmContext';
import { ANDHRA_PRADESH_DISTRICTS } from '../../lib/data/andhraPradesh';
import { COMMON_AP_CROPS } from '../../lib/data/crops';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const cropIdentity = (name = '') => name.split('(')[0].trim().toLocaleLowerCase();
const cropSlug = (name = '') => name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function readAsDataUrl(file, errorMessage) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsDataURL(file);
  });
}

export default function PesticideImageAnalysis() {
  const { t, isTelugu, language } = useLanguage();
  const { farmProfile, isLoaded } = useFarm();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [customCropName, setCustomCropName] = useState('');
  const [growthStage, setGrowthStage] = useState('not_sure');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [imageType, setImageType] = useState('unsure');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const cropOptions = useMemo(() => {
    const options = [];
    const knownNames = new Set();
    const addOption = (option) => {
      const identity = cropIdentity(option.cropName);
      if (!identity || knownNames.has(identity)) return;
      knownNames.add(identity);
      options.push(option);
    };

    COMMON_AP_CROPS.forEach((crop) => {
      addOption({
        id: `common:${crop.id}`,
        cropName: crop.name,
        labelEn: crop.nameEn,
        labelTe: crop.nameTe,
      });
    });

    ANDHRA_PRADESH_DISTRICTS.forEach((district) => {
      (district.commonCrops || []).forEach((cropName, index) => {
        addOption({
          id: `regional:${cropSlug(cropName)}`,
          cropName,
          labelEn: cropName,
          labelTe: district.commonCropsTe?.[index] || cropName,
        });
      });
    });

    if (isLoaded) (farmProfile.crops || []).forEach((crop) => {
      const commonCrop = COMMON_AP_CROPS.find(
        (option) => cropIdentity(option.name) === cropIdentity(crop.cropName)
      );
      options.push({
        id: `farm:${crop.id}`,
        cropName: crop.cropName,
        labelEn: commonCrop?.nameEn || crop.cropName,
        labelTe: commonCrop?.nameTe || crop.cropName,
        growthStage: crop.growthStage,
        isRegistered: true,
      });
    });

    return options;
  }, [farmProfile.crops, isLoaded]);

  useEffect(() => {
    if (selectedCropId === 'other' || cropOptions.some((crop) => crop.id === selectedCropId)) return;
    setSelectedCropId(
      cropOptions.find((crop) => crop.isRegistered)?.id || cropOptions[0]?.id || ''
    );
  }, [cropOptions, selectedCropId]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const stages = [
    { id: 'germination', label: t('pesticides.stageGermination') },
    { id: 'seedling', label: t('pesticides.stageSeedling') },
    { id: 'vegetative', label: t('pesticides.stageVegetative') },
    { id: 'flowering', label: t('pesticides.stageFlowering') },
    { id: 'fruiting', label: t('pesticides.stageFruiting') },
    { id: 'maturity', label: t('pesticides.stageMaturity') },
    { id: 'harvest', label: t('pesticides.stageHarvest') },
    { id: 'not_sure', label: t('pesticides.stageUnknown') },
  ];

  const imageTypes = [
    { id: 'crop_disease', label: t('pesticides.imageTypeDisease') },
    { id: 'pest_insect', label: t('pesticides.imageTypePest') },
    { id: 'pesticide_label', label: t('pesticides.imageTypeLabel') },
    { id: 'unsure', label: t('pesticides.imageTypeUnknown') },
  ];

  const selectedCrop = cropOptions.find((crop) => crop.id === selectedCropId);
  const cropName = selectedCropId === 'other'
    ? customCropName.trim()
    : selectedCrop?.cropName || '';
  const displayCropName = (crop) => isTelugu ? crop.labelTe : crop.labelEn;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError(t('advisor.invalidImageType'));
      return;
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      setError(t('advisor.imageTooLarge'));
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setError('');
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setAnalysis(null);
    setError('');
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;
    if (!selectedImage) {
      setError(t('advisor.invalidImageType'));
      return;
    }
    if (!cropName) {
      setError(t('pesticides.customCropRequired'));
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysis(null);
    try {
      const imageBase64 = await readAsDataUrl(selectedImage, t('pesticides.analysisFailed'));
      const response = await fetch('/api/advisor/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          cropId: selectedCropId,
          cropName,
          growthStage,
          symptomDescription,
          imageType,
          language,
          farmContext: {
            location: {
              state: farmProfile.location?.state,
              district: farmProfile.location?.district,
              mandal: farmProfile.location?.mandal,
              village: farmProfile.location?.village,
              approximateCoords: farmProfile.location?.approximateCoords === true,
            },
            soilType: farmProfile.soilType,
            landArea: farmProfile.landArea,
            irrigationMethod: farmProfile.irrigationMethod,
            crops: (farmProfile.crops || []).map((crop) => ({
              cropName: crop.cropName,
              growthStage: crop.growthStage,
            })),
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.diagnostics) {
        throw new Error(result.error || t('pesticides.analysisFailed'));
      }
      setAnalysis(result.diagnostics);
    } catch (requestError) {
      console.error('Pesticide image analysis failed:', requestError);
      setError(requestError.message || t('pesticides.analysisFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">
            {t('pesticides.photoAnalysisTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('pesticides.photoAnalysisDescription')}
          </p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            {t('pesticides.analysisCrop')}
            <select
              value={selectedCropId}
              onChange={(event) => {
                const nextCropId = event.target.value;
                setSelectedCropId(nextCropId);
                const registeredCrop = cropOptions.find((crop) => crop.id === nextCropId);
                if (registeredCrop?.growthStage && stages.some((stage) => stage.id === registeredCrop.growthStage)) {
                  setGrowthStage(registeredCrop.growthStage);
                }
                setError('');
              }}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="" disabled>{t('pesticides.analysisCropPlaceholder')}</option>
              {cropOptions.map((crop) => (
                <option key={crop.id} value={crop.id}>{displayCropName(crop)}</option>
              ))}
              <option value="other">{t('pesticides.otherCrop')}</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {t('pesticides.cropStage')}
            <select
              value={growthStage}
              onChange={(event) => setGrowthStage(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.label}</option>
              ))}
            </select>
          </label>

          {selectedCropId === 'other' && (
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              {t('pesticides.customCropName')}
              <input
                type="text"
                value={customCropName}
                onChange={(event) => setCustomCropName(event.target.value)}
                maxLength={100}
                required
                placeholder={t('pesticides.customCropPlaceholder')}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700">
            {t('pesticides.imageType')}
            <select
              value={imageType}
              onChange={(event) => setImageType(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {imageTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {t('pesticides.symptomDescription')}
            <textarea
              value={symptomDescription}
              onChange={(event) => setSymptomDescription(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={t('pesticides.symptomPlaceholder')}
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </label>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label={t('pesticides.takePhoto')}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-label={t('pesticides.choosePhoto')}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-800 hover:bg-purple-50"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {selectedImage ? t('pesticides.replacePhoto') : t('pesticides.takePhoto')}
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {t('pesticides.choosePhoto')}
          </button>
        </div>

        {selectedImage && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 break-all text-sm text-slate-700">{selectedImage.name}</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                {t('pesticides.removePhoto')}
              </button>
            </div>
            <img
              src={previewUrl}
              alt={t('pesticides.imagePreview')}
              className="mx-auto max-h-72 w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isLoaded || !selectedImage || !cropName || analyzing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing
            ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {analyzing ? t('pesticides.analyzingPhoto') : t('pesticides.analyzePhoto')}
        </button>
      </form>

      {analysis && (
        <section
          aria-live="polite"
          className="mt-6 space-y-4 rounded-xl border border-purple-200 bg-purple-50 p-4"
        >
          <h3 className="flex items-center gap-2 text-base font-semibold text-purple-950">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            {t('pesticides.analysisResult')}
          </h3>
          <p className="text-sm text-slate-800">{analysis.imageSummary}</p>

          {analysis.visibleObservations?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700">{t('pesticides.visibleObservations')}</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {analysis.visibleObservations.map((observation, index) => (
                  <li key={`${index}-${observation}`}>{observation}</li>
                ))}
              </ul>
            </div>
          )}

          {imageType === 'pesticide_label' ? (
            <div className="space-y-2 text-sm">
              <p><strong>{t('pesticides.productName')}:</strong> {analysis.productName || t('pesticides.noReadableText')}</p>
              <p><strong>{t('pesticides.activeIngredient')}:</strong> {analysis.activeIngredient || t('pesticides.noReadableText')}</p>
              <div>
                <strong>{t('pesticides.labelInformation')}:</strong>
                {analysis.visibleLabelInformation?.length
                  ? <ul className="mt-1 list-disc space-y-1 pl-5">{analysis.visibleLabelInformation.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                  : <p>{t('pesticides.noReadableText')}</p>}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-slate-700">{t('pesticides.possibleIdentification')}</h4>
                <p className="mt-1 text-sm text-slate-800">{analysis.possibleIdentification}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700">{t('pesticides.evidence')}</h4>
                <p className="mt-1 text-sm text-slate-800">{analysis.evidence}</p>
              </div>
            </>
          )}

          <div>
            <h4 className="text-sm font-medium text-slate-700">{t('pesticides.safeNextSteps')}</h4>
            <p className="mt-1 text-sm text-slate-800">{analysis.safeNextSteps}</p>
          </div>
          {analysis.additionalInfoNeeded && (
            <div>
              <h4 className="text-sm font-medium text-slate-700">{t('pesticides.moreInformation')}</h4>
              <p className="mt-1 text-sm text-slate-800">{analysis.additionalInfoNeeded}</p>
            </div>
          )}
          <p className="text-sm font-medium text-purple-900">
            {t(`advisor.confidence${analysis.confidenceLevel[0].toLocaleUpperCase()}${analysis.confidenceLevel.slice(1)}`)}
          </p>
          <p className="text-sm text-slate-700">
            {analysis.needsClearerImage
              ? t('pesticides.clearerPhotoNeeded')
              : t('pesticides.noClearerPhotoNeeded')}
          </p>
          <p className="border-t border-purple-200 pt-3 text-xs leading-relaxed text-slate-600">
            {t('pesticides.imageAiDisclaimer')}
          </p>
        </section>
      )}
    </section>
  );
}
