'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFarm } from '../../contexts/FarmContext';
import { ANDHRA_PRADESH_DISTRICTS, resolveLocationCoordinates } from '../../lib/data/andhraPradesh';
import { COMMON_AP_CROPS } from '../../lib/data/crops';
import {
  Sprout,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  MapPin,
  ClipboardList,
  Search,
  Pencil,
} from 'lucide-react';

export default function MyFarmPage() {
  const { t, isTelugu } = useLanguage();
  const {
    farmProfile,
    isLoaded,
    persistenceError,
    migrationNotice,
    isCloudStorage,
    updateFarmProfile,
    addCrop,
    updateCrop,
    removeCrop,
    saveCustomVillage,
    retryPersistence,
  } = useFarm();

  const [selectedDistrict, setSelectedDistrict] = useState(farmProfile.location.district);
  const [selectedMandal, setSelectedMandal] = useState(farmProfile.location.mandal);
  const [selectedVillage, setSelectedVillage] = useState(farmProfile.location.village);
  const [isCustomVillage, setIsCustomVillage] = useState(!!farmProfile.location.customVillage);
  const [customVillageName, setCustomVillageName] = useState(farmProfile.location.customVillage ? farmProfile.location.village : '');
  const [customVillageId, setCustomVillageId] = useState('');
  const [customVillageType, setCustomVillageType] = useState('village');
  const [villageSearch, setVillageSearch] = useState('');

  const [soilType, setSoilType] = useState(farmProfile.soilType);
  const [landArea, setLandArea] = useState(farmProfile.landArea);
  const [irrigationMethod, setIrrigationMethod] = useState(farmProfile.irrigationMethod);

  // New Crop Form
  const [newCropName, setNewCropName] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [newSowingDate, setNewSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGrowthStage, setNewGrowthStage] = useState('vegetative');
  const [newNotes, setNewNotes] = useState('');
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  // Crop Location States
  const [cropDistrict, setCropDistrict] = useState(farmProfile?.location?.district || '');
  const [cropMandal, setCropMandal] = useState(farmProfile?.location?.mandal || '');
  const [cropVillage, setCropVillage] = useState(farmProfile?.location?.village || '');
  const [cropIsCustomVillage, setCropIsCustomVillage] = useState(false);
  const [cropCustomVillageName, setCropCustomVillageName] = useState('');
  const [cropCustomVillageId, setCropCustomVillageId] = useState('');
  const [cropCustomVillageType, setCropCustomVillageType] = useState('village');
  const [cropVillageSearch, setCropVillageSearch] = useState('');

  const [editingCropId, setEditingCropId] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formHydrated, setFormHydrated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [villageError, setVillageError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    setSelectedDistrict(farmProfile.location?.district || '');
    setSelectedMandal(farmProfile.location?.mandal || '');
    setSelectedVillage(farmProfile.location?.village || '');
    setIsCustomVillage(Boolean(farmProfile.location?.customVillage));
    setCustomVillageName(farmProfile.location?.customVillage ? farmProfile.location.village : '');
    setCustomVillageId(farmProfile.location?.customVillageId || '');
    setSoilType(farmProfile.soilType || 'not_sure');
    setLandArea(farmProfile.landArea || 1);
    setIrrigationMethod(farmProfile.irrigationMethod || 'rainfed');
    setFormHydrated(true);
  }, [
    isLoaded,
    farmProfile.location?.district,
    farmProfile.location?.mandal,
    farmProfile.location?.village,
    farmProfile.location?.customVillage,
    farmProfile.location?.customVillageId,
    farmProfile.soilType,
    farmProfile.landArea,
    farmProfile.irrigationMethod,
  ]);

  const districtObj = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
  ) || ANDHRA_PRADESH_DISTRICTS[0];

  const mandalObj = districtObj.mandals.find(
    (m) => m.name.toLowerCase() === selectedMandal.toLowerCase()
  ) || districtObj.mandals[0];

  const cropDistrictObj = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === cropDistrict.toLowerCase()
  ) || ANDHRA_PRADESH_DISTRICTS[0];

  const cropMandalObj = cropDistrictObj.mandals.find(
    (m) => m.name.toLowerCase() === cropMandal.toLowerCase()
  ) || cropDistrictObj.mandals[0];
  const regionalCropNames = cropDistrictObj?.commonCrops || [];
  const cropOptions = [...new Set([
    ...regionalCropNames,
    ...COMMON_AP_CROPS.map((crop) => crop.name),
  ])];
  const filteredCropOptions = cropOptions.filter((cropName) =>
    cropName.toLowerCase().includes(cropSearch.trim().toLowerCase())
  );

  const customVillages = (farmProfile.customVillages || []).filter(
    (village) =>
      village.district?.toLowerCase() === selectedDistrict.toLowerCase() &&
      village.mandal?.toLowerCase() === selectedMandal.toLowerCase()
  );
  const availableVillages = [
    ...(mandalObj?.villages || []),
    ...customVillages.filter(
      (custom) =>
        !(mandalObj?.villages || []).some(
          (village) => village.name?.trim().toLowerCase() === custom.name?.trim().toLowerCase()
        )
    ),
  ];
  const filteredVillages = villageSearch.trim()
    ? availableVillages.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(villageSearch.toLowerCase())) ||
          (v.nameTe && v.nameTe.includes(villageSearch))
      )
    : availableVillages;
  const farmLocationSelected = Boolean(
    selectedDistrict &&
    selectedMandal &&
    (isCustomVillage ? customVillageName.trim() : selectedVillage)
  );
  const resolvedFarmCoordinates = farmLocationSelected
    ? resolveLocationCoordinates(
        selectedDistrict,
        selectedMandal,
        isCustomVillage ? customVillageName : selectedVillage
      )
    : null;

  const cropCustomVillages = (farmProfile.customVillages || []).filter(
    (village) =>
      village.district?.toLowerCase() === cropDistrict.toLowerCase() &&
      village.mandal?.toLowerCase() === cropMandal.toLowerCase()
  );
  const cropAvailableVillages = [
    ...(cropMandalObj?.villages || []),
    ...cropCustomVillages.filter(
      (custom) =>
        !(cropMandalObj?.villages || []).some(
          (village) => village.name?.trim().toLowerCase() === custom.name?.trim().toLowerCase()
        )
    ),
  ];
  const cropFilteredVillages = cropVillageSearch.trim()
    ? cropAvailableVillages.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(cropVillageSearch.toLowerCase())) ||
          (v.nameTe && v.nameTe.includes(cropVillageSearch))
      )
    : cropAvailableVillages;

  const handleCropDistrictChange = (dName) => {
    setCropDistrict(dName);
    const d = ANDHRA_PRADESH_DISTRICTS.find((item) => item.name === dName);
    if (d && d.mandals[0]) {
      setCropMandal(d.mandals[0].name);
      setCropVillage(d.mandals[0].villages[0]?.name || '');
      setCropIsCustomVillage(false);
      setCropCustomVillageId('');
      setCropCustomVillageName('');
      setCropVillageSearch('');
    } else {
      setCropMandal('');
      setCropVillage('');
      setCropIsCustomVillage(false);
      setCropCustomVillageId('');
      setCropCustomVillageName('');
    }
  };

  const handleCropMandalChange = (mName) => {
    setCropMandal(mName);
    const m = cropDistrictObj.mandals.find((item) => item.name === mName);
    if (m) {
      setCropVillage(m.villages[0]?.name || '');
      setCropIsCustomVillage(false);
      setCropCustomVillageId('');
      setCropCustomVillageName('');
      setCropVillageSearch('');
    } else {
      setCropVillage('');
      setCropIsCustomVillage(false);
      setCropCustomVillageId('');
      setCropCustomVillageName('');
    }
  };

  const handleSaveFarm = (e) => {
    e.preventDefault();
    const enteredVillageName = isCustomVillage ? customVillageName.trim() : selectedVillage;
    if (!selectedDistrict || !selectedMandal || !enteredVillageName) {
      setVillageError(isTelugu
        ? 'దయచేసి జిల్లా, మండలం మరియు గ్రామాన్ని ఎంచుకోండి.'
        : 'Select a district, mandal, and village before saving.');
      return;
    }
    const resolved = resolveLocationCoordinates(selectedDistrict, selectedMandal, enteredVillageName);
    let customVillage = null;
    try {
      customVillage = isCustomVillage
        ? saveCustomVillage({
            id: customVillageId || undefined,
            name: enteredVillageName,
            type: customVillageType,
            district: selectedDistrict,
            mandal: selectedMandal,
            latitude: resolved.lat,
            longitude: resolved.lon,
          })
        : null;
      setVillageError('');
    } catch (error) {
      setVillageError(error.message);
      return;
    }
    const finalVillage = customVillage?.name || enteredVillageName;
    if (customVillage) setCustomVillageId(customVillage.id);

    updateFarmProfile({
      location: {
        state: 'Andhra Pradesh',
        district: selectedDistrict,
        mandal: selectedMandal,
        village: finalVillage,
        latitude: resolved.lat,
        longitude: resolved.lon,
        approximateCoords: resolved.isApproximate,
        customVillage: isCustomVillage,
        customVillageId: customVillage?.id || undefined,
      },
      soilType,
      landArea: parseFloat(landArea) || 1,
      irrigationMethod,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateCrop = (e) => {
    e.preventDefault();
    const finalCropName = newCropName.trim();
    if (!finalCropName) return;
    const enteredCropVillage = cropIsCustomVillage ? cropCustomVillageName.trim() : cropVillage;
    if (!farmProfile.id) {
      setVillageError(isTelugu
        ? 'పంటను జోడించే ముందు పొలం వివరాలను సేవ్ చేయండి.'
        : 'Save your farm details before adding crops.');
      return;
    }
    if (!cropDistrict || !cropMandal || !enteredCropVillage) {
      setVillageError(isTelugu
        ? 'దయచేసి పంట జిల్లా, మండలం మరియు గ్రామాన్ని ఎంచుకోండి.'
        : 'Select the crop district, mandal, and village.');
      return;
    }
    const resolved = resolveLocationCoordinates(cropDistrict, cropMandal, enteredCropVillage);
    let customCropVillage = null;
    try {
      customCropVillage = cropIsCustomVillage
        ? saveCustomVillage({
            id: cropCustomVillageId || undefined,
            name: enteredCropVillage,
            type: cropCustomVillageType,
            district: cropDistrict,
            mandal: cropMandal,
            latitude: resolved.lat,
            longitude: resolved.lon,
          })
        : null;
      setVillageError('');
    } catch (error) {
      setVillageError(error.message);
      return;
    }
    const finalCropVillage = customCropVillage?.name || enteredCropVillage;

    addCrop({
      cropName: finalCropName,
      sowingDate: newSowingDate,
      growthStage: newGrowthStage,
      location: {
        state: 'Andhra Pradesh',
        district: cropDistrict,
        mandal: cropMandal,
        village: finalCropVillage,
        latitude: resolved.lat,
        longitude: resolved.lon,
        approximateCoords: resolved.isApproximate,
        customVillage: cropIsCustomVillage,
        customVillageId: customCropVillage?.id || undefined,
      },
      notes: newNotes,
    });
    setNewCropName('');
    setCropSearch('');
    setIsCustomCrop(false);
    setNewNotes('');
    setShowAddCropModal(false);
  };

  const openAddCrop = () => {
    setCropDistrict(farmProfile.location?.district || '');
    setCropMandal(farmProfile.location?.mandal || '');
    setCropVillage(farmProfile.location?.village || '');
    const savedCustomVillage = farmProfile.customVillages?.find(
      (village) => village.id === farmProfile.location?.customVillageId
    );
    setCropIsCustomVillage(Boolean(farmProfile.location?.customVillage));
    setCropCustomVillageName(farmProfile.location?.customVillage ? farmProfile.location.village : '');
    setCropCustomVillageId(farmProfile.location?.customVillageId || '');
    setCropCustomVillageType(savedCustomVillage?.type || 'village');
    setNewCropName('');
    setCropSearch('');
    setIsCustomCrop(false);
    setShowAddCropModal(true);
  };

  const chooseCropVillage = (value) => {
    const savedVillage = cropCustomVillages.find((village) => `custom:${village.id}` === value);
    if (savedVillage) {
      setCropIsCustomVillage(true);
      setCropCustomVillageId(savedVillage.id);
      setCropCustomVillageName(savedVillage.name);
      setCropCustomVillageType(savedVillage.type || 'village');
      return;
    }
    if (value === '__custom__') {
      setCropIsCustomVillage(true);
      setCropCustomVillageId('');
      setCropCustomVillageName('');
      setCropCustomVillageType('village');
    } else {
      setCropIsCustomVillage(false);
      setCropCustomVillageId('');
      setCropVillage(value);
    }
  };

  if (!isLoaded || !formHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-slate-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>{t('farm.title')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('farm.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          {t('farm.subtitle')}
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 font-semibold text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t('common.saved')}! మీ పొలం వివరాలు విజయవంతంగా సేవ్ చేయబడ్డాయి.</span>
        </div>
      )}
      {persistenceError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <div>{t('common.storageError')}: {persistenceError}</div>
          <button
            type="button"
            onClick={retryPersistence}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      {migrationNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          {migrationNotice}
        </div>
      )}

      {/* Farm Setup Form */}
      <form onSubmit={handleSaveFarm} className="space-y-8">
        {/* Step 1: Location Hierarchy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              {t('farm.locationStep')}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ఆంధ్రప్రదేశ్ (Andhra Pradesh — LGD State Code: 28)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('farm.selectDistrict')}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const dName = e.target.value;
                  setSelectedDistrict(dName);
                  const d = ANDHRA_PRADESH_DISTRICTS.find((item) => item.name === dName);
                  if (d) {
                    setSelectedMandal(d.mandals[0]?.name || '');
                    setSelectedVillage(d.mandals[0]?.villages[0]?.name || '');
                    setIsCustomVillage(false);
                    setCustomVillageId('');
                    setCustomVillageName('');
                    setVillageSearch('');
                  } else {
                    setSelectedMandal('');
                    setSelectedVillage('');
                    setIsCustomVillage(false);
                    setCustomVillageId('');
                    setCustomVillageName('');
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t('farm.selectDistrict')}</option>
                {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {isTelugu ? `${d.nameTe} (${d.name})` : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('farm.selectMandal')}
              </label>
              <select
                value={selectedMandal}
                onChange={(e) => {
                  const mName = e.target.value;
                  setSelectedMandal(mName);
                  const m = districtObj.mandals.find((item) => item.name === mName);
                  if (m) {
                    setSelectedVillage(m.villages[0]?.name || '');
                    setIsCustomVillage(false);
                    setCustomVillageId('');
                    setCustomVillageName('');
                    setVillageSearch('');
                  } else {
                    setSelectedVillage('');
                    setIsCustomVillage(false);
                    setCustomVillageId('');
                    setCustomVillageName('');
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t('farm.selectMandal')}</option>
                {districtObj.mandals.map((m) => (
                  <option key={m.id} value={m.name}>
                    {isTelugu ? `${m.nameTe} (${m.name})` : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('farm.selectVillage')}
                </label>
                <input
                  type="text"
                  placeholder={isTelugu ? 'గ్రామం వెతకండి...' : 'Filter villages...'}
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                  className="text-[11px] px-2 py-0.5 rounded border border-slate-200 w-28"
                />
              </div>

              <select
                value={isCustomVillage ? (customVillageId ? `custom:${customVillageId}` : '__custom__') : selectedVillage}
                onChange={(e) => {
                  const val = e.target.value;
                  const savedVillage = customVillages.find((village) => `custom:${village.id}` === val);
                  if (savedVillage) {
                    setIsCustomVillage(true);
                    setCustomVillageId(savedVillage.id);
                    setCustomVillageName(savedVillage.name);
                    setCustomVillageType(savedVillage.type || 'village');
                    return;
                  }
                  if (val === '__custom__') {
                    setIsCustomVillage(true);
                    setCustomVillageId('');
                    setCustomVillageType('village');
                    setCustomVillageName('');
                  } else {
                    setIsCustomVillage(false);
                    setCustomVillageId('');
                    setSelectedVillage(val);
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t('farm.selectVillage')}</option>
                {filteredVillages.map((v) => (
                  <option key={v.id || `${selectedMandal}:${v.name}`} value={v.id ? `custom:${v.id}` : v.name}>
                    {v.id
                      ? `${v.name} · ${t(`farm.settlementTypes.${v.type || 'village'}`)}`
                      : (isTelugu ? `${v.nameTe} (${v.name})` : v.name)}
                  </option>
                ))}
                <option value="__custom__">
                  {t('farm.addVillage')}
                </option>
              </select>

              {isCustomVillage && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customVillageName}
                    onChange={(e) => {
                      setCustomVillageName(e.target.value);
                      setVillageError('');
                    }}
                    placeholder={t('farm.customVillagePlaceholder')}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-400 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <select
                    value={customVillageType}
                    onChange={(e) => {
                      setCustomVillageType(e.target.value);
                      setVillageError('');
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {['village', 'thanda', 'hamlet', 'other'].map((type) => (
                      <option key={type} value={type}>{t(`farm.settlementTypes.${type}`)}</option>
                    ))}
                  </select>
                </div>
              )}
              {villageError && (
                <p className="text-xs text-red-700" role="alert">{villageError}</p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-semibold text-emerald-950">
              {farmLocationSelected
                ? `📍 ${isTelugu ? 'ఎంచుకున్న స్థానం:' : 'Selected location:'} ${
                    isCustomVillage ? customVillageName : selectedVillage
                  }, ${selectedMandal}, ${selectedDistrict}`
                : (isTelugu ? 'స్థానాన్ని ఎంచుకోండి.' : 'Select a farm location.')}
            </span>
            {farmLocationSelected && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {isCustomVillage || resolvedFarmCoordinates.isApproximate
                  ? t('farm.approximateMandalCoordinates')
                  : t('farm.villageCoordinates')}
                {' '}: Lat {resolvedFarmCoordinates.lat ?? mandalObj.lat}, Lon {resolvedFarmCoordinates.lon ?? mandalObj.lon}
              </span>
            )}
          </div>
        </div>

        {/* Step 2: Soil Classification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-emerald-600" />
            {t('farm.soilStep')}
          </h2>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 text-amber-600" />
              {selectedDistrict
                ? `${t('farm.regionalSoilDetected')} ${isTelugu ? districtObj.soilDescTe : districtObj.soilDescEn}`
                : t('farm.selectDistrict')}
            </div>
            <p>{t('farm.soilDisclaimer')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {['black', 'red', 'alluvial', 'sandy', 'clay', 'not_sure'].map((type) => (
              <label
                key={type}
                className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  soilType === type
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="soilType"
                  value={type}
                  checked={soilType === type}
                  onChange={() => setSoilType(type)}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs sm:text-sm font-medium text-slate-800">
                  {t(`farm.soilTypes.${type}`)}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Step 3: Land & Irrigation Method */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-emerald-600" />
            {t('farm.additionalDetails')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('farm.landAreaLabel')}
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('farm.irrigationLabel')}
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {['canal', 'borewell', 'drip', 'sprinkler', 'rainfed'].map((method) => (
                  <option key={method} value={method}>
                    {t(`farm.irrigationMethods.${method}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('farm.saveFarmProfile')}
          </button>
          <p className="self-center text-xs text-slate-500">
            {isCloudStorage ? t('profile.cloudStorageNotice') : t('common.localOnlyStorage')}
          </p>
        </div>
      </form>

      {/* Crop Progress Tracker Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
              {t('farm.cropTrackerTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTelugu ? 'మీ పంటల దశలను మరియు ఎరువుల నిర్వహణను ట్రాక్ చేయండి' : 'Track your crop stages and farming calendar'}
            </p>
          </div>

          <button
            type="button"
            onClick={openAddCrop}
            disabled={!farmProfile.id}
            title={!farmProfile.id
              ? (isTelugu ? 'ముందుగా పొలం వివరాలను సేవ్ చేయండి' : 'Save your farm details first')
              : undefined}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs sm:text-sm font-bold transition-all inline-flex items-center self-start sm:self-auto disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('dashboard.addCrop')}
          </button>
        </div>

        {/* Crops List */}
        <div className="space-y-4">
          {farmProfile.crops.map((crop) => (
            <div
              key={crop.id}
              className="min-w-0 p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
            >
              <div className="flex min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="min-w-0 break-words text-base font-bold text-slate-900">{crop.cropName}</span>
                  {crop.selectionType === 'recommended' && (
                    <span className="whitespace-normal text-[10px] rounded bg-sky-50 border border-sky-200 text-sky-800 px-2 py-0.5">
                      {t('farm.recommendedOnly')}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {t(`farm.stages.${crop.growthStage}`)}
                  </span>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <select
                    value={crop.growthStage}
                    onChange={(e) => updateCrop(crop.id, { growthStage: e.target.value })}
                    className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs sm:w-auto"
                  >
                    {['land_prep', 'sowing', 'vegetative', 'flowering', 'fruiting', 'harvesting'].map(
                      (st) => (
                        <option key={st} value={st}>
                          {t(`farm.stages.${st}`)}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCropId(crop.id);
                      setEditingCrop({
                        cropName: crop.cropName || '',
                        sowingDate: crop.sowingDate || '',
                        growthStage: crop.growthStage || 'vegetative',
                        notes: crop.notes || '',
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCrop(crop.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingCropId === crop.id && editingCrop && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-emerald-200 bg-white p-3">
                  <label className="text-xs font-semibold text-slate-700">
                    {t('farm.cropName')}
                    <input
                      value={editingCrop.cropName}
                      onChange={(e) => setEditingCrop({ ...editingCrop, cropName: e.target.value })}
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    {t('farm.sowingDate')}
                    <input
                      type="date"
                      value={editingCrop.sowingDate}
                      onChange={(e) => setEditingCrop({ ...editingCrop, sowingDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    {t('farm.growthStage')}
                    <select
                      value={editingCrop.growthStage}
                      onChange={(e) => setEditingCrop({ ...editingCrop, growthStage: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {['land_prep', 'sowing', 'vegetative', 'flowering', 'fruiting', 'harvesting'].map((stage) => (
                        <option key={stage} value={stage}>{t(`farm.stages.${stage}`)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    {t('farm.notesPlaceholder')}
                    <textarea
                      rows={2}
                      value={editingCrop.notes}
                      onChange={(e) => setEditingCrop({ ...editingCrop, notes: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCropId(null);
                        setEditingCrop(null);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingCrop.cropName.trim()) return;
                        updateCrop(crop.id, {
                          ...editingCrop,
                          cropName: editingCrop.cropName.trim(),
                          selectionType: 'selected',
                        });
                        setEditingCropId(null);
                        setEditingCrop(null);
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {crop.location?.village || farmProfile.location.village}, {crop.location?.mandal || farmProfile.location.mandal} ({crop.location?.district || farmProfile.location.district})
                </span>
                <span>
                  <strong>{t('farm.sowingDate')}:</strong> {crop.sowingDate}
                </span>
              </div>

              {crop.notes && editingCropId !== crop.id && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 italic">
                  {crop.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-emerald-600" />
              {t('dashboard.addCrop')}
            </h3>

            <form onSubmit={handleCreateCrop} className="space-y-4">
              {/* Location Selection in Add Crop Modal */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                    {isTelugu ? 'పంట సాగు చేసే ప్రదేశం (Plot Location)' : 'Crop Cultivation Location'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ఆంధ్రప్రదేశ్
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      {t('common.district')}
                    </label>
                    <select
                      value={cropDistrict}
                      onChange={(e) => handleCropDistrictChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="">{t('farm.selectDistrict')}</option>
                      {ANDHRA_PRADESH_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {isTelugu ? `${d.nameTe} (${d.name})` : d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      {t('common.mandal')}
                    </label>
                    <select
                      value={cropMandal}
                      onChange={(e) => handleCropMandalChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="">{t('farm.selectMandal')}</option>
                      {cropDistrictObj.mandals.map((m) => (
                        <option key={m.id} value={m.name}>
                          {isTelugu ? `${m.nameTe} (${m.name})` : m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        {t('common.village')}
                      </label>
                      <input
                        type="text"
                        placeholder="శోధించండి"
                        value={cropVillageSearch}
                        onChange={(e) => setCropVillageSearch(e.target.value)}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 w-20"
                      />
                    </div>

                    <select
                      value={cropIsCustomVillage
                        ? (cropCustomVillageId ? `custom:${cropCustomVillageId}` : '__custom__')
                        : cropVillage}
                      onChange={(e) => chooseCropVillage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="">{t('farm.selectVillage')}</option>
                      {cropFilteredVillages.map((v) => (
                        <option key={v.id || `${cropMandal}:${v.name}`} value={v.id ? `custom:${v.id}` : v.name}>
                          {v.id
                            ? `${v.name} · ${t(`farm.settlementTypes.${v.type || 'village'}`)}`
                            : (isTelugu ? `${v.nameTe} (${v.name})` : v.name)}
                        </option>
                      ))}
                      <option value="__custom__">
                        {t('farm.addVillage')}
                      </option>
                    </select>

                    {cropIsCustomVillage && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={cropCustomVillageName}
                          onChange={(e) => {
                            setCropCustomVillageName(e.target.value);
                            setVillageError('');
                          }}
                          placeholder={t('farm.customVillagePlaceholder')}
                          required
                          className="w-full px-2 py-1 text-xs rounded border border-emerald-400 bg-white font-medium"
                        />
                        <select
                          value={cropCustomVillageType}
                          onChange={(e) => {
                            setCropCustomVillageType(e.target.value);
                            setVillageError('');
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                        >
                          {['village', 'thanda', 'hamlet', 'other'].map((type) => (
                            <option key={type} value={type}>{t(`farm.settlementTypes.${type}`)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {villageError && (
                      <p className="text-[11px] text-red-700" role="alert">{villageError}</p>
                    )}
                  </div>
                </div>

                {/* Location Live Preview Badge */}
                <div className="text-[11px] text-emerald-950 bg-white/90 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span>
                    📍 <strong>{cropIsCustomVillage ? cropCustomVillageName || (isTelugu ? 'కస్టమ్ గ్రామం' : 'Custom Village') : cropVillage}</strong>, {cropMandal}, {cropDistrict}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {cropIsCustomVillage || resolveLocationCoordinates(cropDistrict, cropMandal, cropVillage).isApproximate
                      ? t('farm.approximateMandalCoordinates')
                      : t('farm.villageCoordinates')}
                  </span>
                </div>

                {/* Regional hint */}
                <div className="text-[10px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-100 flex items-start space-x-1">
                  <span className="font-bold">🌿 {isTelugu ? 'ఈ ప్రాంత నేల & పంటలు' : 'Regional Baseline'}:</span>
                  <span>
                    {isTelugu ? cropDistrictObj.soilDescTe : cropDistrictObj.soilDescEn} | {isTelugu ? cropDistrictObj.commonCropsTe.slice(0, 3).join(', ') : cropDistrictObj.commonCrops.slice(0, 3).join(', ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('farm.cropsStep')}
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    value={cropSearch}
                    onChange={(e) => setCropSearch(e.target.value)}
                    placeholder={t('farm.searchCropPlaceholder')}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <p className="mb-2 text-[11px] text-slate-500">{t('farm.recommendationsAreNotSelected')}</p>
                <select
                  value={isCustomCrop ? '__custom_crop__' : newCropName}
                  onChange={(e) => {
                    if (e.target.value === '__custom_crop__') {
                      setIsCustomCrop(true);
                      setNewCropName('');
                    } else {
                      setIsCustomCrop(false);
                      setNewCropName(e.target.value);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- {t('farm.searchCropPlaceholder')} --</option>
                  {filteredCropOptions.map((cropName) => (
                    <option key={cropName} value={cropName}>
                      {cropName}{regionalCropNames.includes(cropName) ? ` — ${t('farm.recommended')}` : ''}
                    </option>
                  ))}
                  <option value="__custom_crop__">{t('farm.addCropManually')}</option>
                </select>
                {isCustomCrop && (
                  <input
                    type="text"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    placeholder={t('farm.customCropPlaceholder')}
                    required
                    className="mt-2 w-full rounded-lg border border-emerald-400 px-3 py-2 text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('farm.sowingDate')}
                </label>
                <input
                  type="date"
                  value={newSowingDate}
                  onChange={(e) => setNewSowingDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('farm.growthStage')}
                </label>
                <select
                  value={newGrowthStage}
                  onChange={(e) => setNewGrowthStage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {['land_prep', 'sowing', 'vegetative', 'flowering', 'fruiting', 'harvesting'].map(
                    (st) => (
                      <option key={st} value={st}>
                        {t(`farm.stages.${st}`)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('farm.notesPlaceholder')}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={t('farm.notesPlaceholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCropModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                >
                  {t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
