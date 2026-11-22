'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getVillagesByMandal } from '../lib/data/andhraPradesh';
import { useAuth } from './AuthContext';

const FarmContext = createContext(null);

const DEFAULT_FARM_PROFILE = {
  id: 'farm-01',
  farmerName: 'వెంకటేశ్వర రావు',
  location: {
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Tenali',
    village: 'Angalakuduru',
    latitude: 16.2437,
    longitude: 80.6400,
  },
  customVillages: [],
  soilType: 'black',
  landArea: 4.5,
  irrigationMethod: 'canal',
  crops: [
    {
      id: 'crop-1',
      cropName: 'Paddy (వరి)',
      sowingDate: '2026-07-15',
      growthStage: 'vegetative',
      healthStatus: 'healthy',
      location: {
        district: 'Guntur',
        mandal: 'Tenali',
        village: 'Angalakuduru',
      },
      notes: 'యూరియా మరియు పొటాష్ మొదటి విడత వేశాము. నీటి మట్టం 2 అంగుళాలు నిర్వహిస్తున్నాము.',
    },
    {
      id: 'crop-2',
      cropName: 'Chilli (మిరప)',
      sowingDate: '2026-08-10',
      growthStage: 'flowering',
      healthStatus: 'moderate',
      location: {
        district: 'Guntur',
        mandal: 'Tenali',
        village: 'Angalakuduru',
      },
      notes: 'కొద్దిగా ఆకుముడత లక్షణాలు ఉన్నాయి. వేపనూనె పిచికారీ చేయబడింది.',
    },
  ],
  updatedAt: new Date().toISOString(),
};

const EMPTY_FARM_PROFILE = {
  id: null,
  farmerName: '',
  location: {
    state: 'Andhra Pradesh',
    district: '',
    mandal: '',
    village: '',
    latitude: null,
    longitude: null,
    approximateCoords: false,
  },
  customVillages: [],
  soilType: 'not_sure',
  landArea: 1,
  irrigationMethod: 'rainfed',
  crops: [],
  updatedAt: new Date().toISOString(),
};

function isUnmodifiedDemoFarm(profile) {
  if (
    profile.id !== DEFAULT_FARM_PROFILE.id ||
    profile.farmerName !== DEFAULT_FARM_PROFILE.farmerName ||
    profile.soilType !== DEFAULT_FARM_PROFILE.soilType ||
    Number(profile.landArea) !== DEFAULT_FARM_PROFILE.landArea ||
    profile.irrigationMethod !== DEFAULT_FARM_PROFILE.irrigationMethod ||
    (profile.customVillages || []).length !== 0 ||
    (profile.crops || []).length !== DEFAULT_FARM_PROFILE.crops.length
  ) {
    return false;
  }
  const location = profile.location || {};
  const defaultLocation = DEFAULT_FARM_PROFILE.location;
  if (['state', 'district', 'mandal', 'village', 'latitude', 'longitude'].some(
    (key) => location[key] !== defaultLocation[key]
  )) return false;
  return DEFAULT_FARM_PROFILE.crops.every((defaultCrop, index) => {
    const crop = profile.crops[index];
    return crop?.id === defaultCrop.id &&
      crop.cropName === defaultCrop.cropName &&
      crop.sowingDate === defaultCrop.sowingDate &&
      crop.growthStage === defaultCrop.growthStage &&
      crop.notes === defaultCrop.notes;
  });
}

function getMigrationProfile(profile) {
  const demoCropIds = new Set(
    DEFAULT_FARM_PROFILE.crops
      .filter((defaultCrop) => {
        const crop = profile.crops.find((item) => item.id === defaultCrop.id);
        return crop &&
          crop.cropName === defaultCrop.cropName &&
          crop.sowingDate === defaultCrop.sowingDate &&
          crop.growthStage === defaultCrop.growthStage &&
          crop.notes === defaultCrop.notes;
      })
      .map((crop) => crop.id)
  );
  return {
    ...profile,
    crops: profile.crops.filter((crop) => !demoCropIds.has(crop.id)),
  };
}

function readLocalFarmProfile() {
  try {
    const migrationOwnerId = localStorage.getItem('agrocast_farm_profile_migrated_user') || '';
    const stored = localStorage.getItem('agrocast_farm_profile');
    if (!stored) {
      return {
        profile: DEFAULT_FARM_PROFILE,
        hasStoredProfile: false,
        isDefaultDemo: true,
        localPersistenceEnabled: true,
        migrationOwnerId,
      };
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Stored farm profile is not an object.');
    }
    const customVillages = Array.isArray(parsed.customVillages) ? parsed.customVillages : [];
    const savedLocation = parsed.location || {};
    if (
      savedLocation.customVillage &&
      savedLocation.village &&
      savedLocation.district &&
      savedLocation.mandal &&
      !customVillages.some(
        (village) =>
          village.name?.trim().toLowerCase() === savedLocation.village.trim().toLowerCase() &&
          village.district?.toLowerCase() === savedLocation.district.toLowerCase() &&
          village.mandal?.toLowerCase() === savedLocation.mandal.toLowerCase()
      )
    ) {
      customVillages.push({
        id: `village-${Date.now()}`,
        name: savedLocation.village,
        type: 'village',
        district: savedLocation.district,
        mandal: savedLocation.mandal,
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude,
        approximateCoords: true,
      });
    }

    const profile = {
      id: typeof parsed.id === 'string' ? parsed.id : null,
      farmerName: typeof parsed.farmerName === 'string' ? parsed.farmerName : '',
      location: {
        state: typeof savedLocation.state === 'string' ? savedLocation.state : 'Andhra Pradesh',
        district: typeof savedLocation.district === 'string' ? savedLocation.district : '',
        mandal: typeof savedLocation.mandal === 'string' ? savedLocation.mandal : '',
        village: typeof savedLocation.village === 'string' ? savedLocation.village : '',
        latitude: savedLocation.latitude ?? null,
        longitude: savedLocation.longitude ?? null,
        approximateCoords: savedLocation.approximateCoords === true,
        ...savedLocation,
      },
      soilType: typeof parsed.soilType === 'string' ? parsed.soilType : 'not_sure',
      landArea: Number.isFinite(Number(parsed.landArea)) && parsed.landArea !== null
        ? Number(parsed.landArea)
        : 1,
      irrigationMethod: typeof parsed.irrigationMethod === 'string'
        ? parsed.irrigationMethod
        : 'rainfed',
      crops: Array.isArray(parsed.crops) ? parsed.crops : [],
      customVillages,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
    return {
      profile,
      hasStoredProfile: true,
      isDefaultDemo: isUnmodifiedDemoFarm(profile),
      localPersistenceEnabled: true,
      migrationOwnerId,
    };
  } catch (error) {
    console.error('Failed to load saved farm profile:', error.message);
    return {
      profile: DEFAULT_FARM_PROFILE,
      hasStoredProfile: false,
      isDefaultDemo: true,
      localPersistenceEnabled: false,
      error: error.message,
    };
  }
}

async function responseError(response, fallback) {
  const result = await response.json().catch(() => ({}));
  return new Error(result.error || fallback);
}

export function FarmProvider({ children }) {
  const { user, loading: authLoading, isSupabaseConfigured } = useAuth();
  const [farmProfile, setFarmProfile] = useState(DEFAULT_FARM_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [persistenceError, setPersistenceError] = useState('');
  const [migrationNotice, setMigrationNotice] = useState('');
  const [isCloudStorage, setIsCloudStorage] = useState(false);
  const [localPersistenceEnabled, setLocalPersistenceEnabled] = useState(true);
  const [cloudReadyUserId, setCloudReadyUserId] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [retrySaveCount, setRetrySaveCount] = useState(0);
  const profileRef = useRef(farmProfile);
  const activeCloudUserIdRef = useRef('');
  const cloudFarmExistsRef = useRef(false);
  const cloudReadVerifiedRef = useRef(false);
  const lastSyncedSnapshotRef = useRef('');

  const activeCloudUserId = isSupabaseConfigured && user && !user.isDemo ? user.id : '';

  const replaceFarmProfile = (profile) => {
    profileRef.current = profile;
    setFarmProfile(profile);
  };

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;
    setIsLoaded(false);
    setMigrationNotice('');
    setCloudReadyUserId('');
    activeCloudUserIdRef.current = activeCloudUserId;
    cloudFarmExistsRef.current = false;
    cloudReadVerifiedRef.current = false;
    lastSyncedSnapshotRef.current = '';

    const local = readLocalFarmProfile();
    if (local.error) setPersistenceError(local.error);

    const finishLocalLoad = () => {
      if (!active) return;
      replaceFarmProfile(local.profile);
      setIsCloudStorage(false);
      setLocalPersistenceEnabled(local.localPersistenceEnabled);
      setIsLoaded(true);
    };

    if (!activeCloudUserId) {
      setPersistenceError(local.error || '');
      finishLocalLoad();
      return () => {
        active = false;
      };
    }

    const loadCloudFarm = async () => {
      try {
        const response = await fetch('/api/farm');
        if (!response.ok) throw await responseError(response, 'Could not load cloud farm data.');
        const { farmProfile: cloudFarm } = await response.json();
        if (!active) return;

        cloudReadVerifiedRef.current = true;
        if (cloudFarm) {
          cloudFarmExistsRef.current = true;
          lastSyncedSnapshotRef.current = JSON.stringify(cloudFarm);
          replaceFarmProfile(cloudFarm);
          setIsCloudStorage(true);
          setLocalPersistenceEnabled(false);
          setPersistenceError('');
          setCloudReadyUserId(activeCloudUserId);
          setIsLoaded(true);
          return;
        }

        const ownedByAnotherUser =
          local.migrationOwnerId && local.migrationOwnerId !== activeCloudUserId;
        const shouldMigrate =
          local.hasStoredProfile && !local.isDefaultDemo && !ownedByAnotherUser;
        if (shouldMigrate) {
          if (!local.migrationOwnerId) {
            try {
              localStorage.setItem('agrocast_farm_profile_migrated_user', activeCloudUserId);
            } catch {
              throw new Error(
                'Could not safely associate the local farm copy with this account. Local data was not imported.'
              );
            }
          }
          const migrationProfile = getMigrationProfile(local.profile);
          const importResponse = await fetch('/api/farm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(migrationProfile),
          });
          if (importResponse.status === 409) {
            const refreshed = await fetch('/api/farm');
            if (!refreshed.ok) throw await responseError(refreshed, 'Could not reload cloud farm data.');
            const { farmProfile: existingFarm } = await refreshed.json();
            if (existingFarm) {
              cloudFarmExistsRef.current = true;
              lastSyncedSnapshotRef.current = JSON.stringify(existingFarm);
              replaceFarmProfile(existingFarm);
              setIsCloudStorage(true);
              setLocalPersistenceEnabled(false);
              setPersistenceError('');
              setCloudReadyUserId(activeCloudUserId);
              setIsLoaded(true);
              return;
            }
            throw new Error('A cloud farm exists but could not be reloaded. Local data was not imported.');
          }
          if (!importResponse.ok) {
            throw await responseError(importResponse, 'Could not migrate local farm data.');
          }
          const { farmProfile: importedFarm } = await importResponse.json();
          if (!active) return;
          cloudFarmExistsRef.current = true;
          lastSyncedSnapshotRef.current = JSON.stringify(importedFarm);
          replaceFarmProfile(importedFarm);
          setIsCloudStorage(true);
          setLocalPersistenceEnabled(false);
          setPersistenceError('');
          setCloudReadyUserId(activeCloudUserId);
          setIsLoaded(true);
          return;
        }

        const emptyProfile = { ...EMPTY_FARM_PROFILE, updatedAt: new Date().toISOString() };
        lastSyncedSnapshotRef.current = JSON.stringify(emptyProfile);
        replaceFarmProfile(emptyProfile);
        setIsCloudStorage(true);
        setLocalPersistenceEnabled(false);
        setPersistenceError('');
        setMigrationNotice(
          ownedByAnotherUser
            ? 'Local farm data belongs to another account and was not imported.'
            : ''
        );
        setCloudReadyUserId(activeCloudUserId);
        setIsLoaded(true);
      } catch (error) {
        if (!active) return;
        console.error('Cloud farm initialization failed:', error.message);
        cloudReadVerifiedRef.current = false;
        setPersistenceError(error.message);
        replaceFarmProfile(local.hasStoredProfile ? local.profile : EMPTY_FARM_PROFILE);
        setIsCloudStorage(false);
        setLocalPersistenceEnabled(local.hasStoredProfile && local.localPersistenceEnabled);
        setIsLoaded(true);
      }
    };

    loadCloudFarm();
    return () => {
      active = false;
    };
  }, [authLoading, activeCloudUserId, retryCount]);

  useEffect(() => {
    if (!isLoaded || !localPersistenceEnabled) return;
    try {
      localStorage.setItem('agrocast_farm_profile', JSON.stringify(farmProfile));
    } catch (error) {
      console.error('Failed to save farm profile locally:', error.message);
      setPersistenceError(error.message);
    }
  }, [farmProfile, isLoaded, localPersistenceEnabled]);

  useEffect(() => {
    if (
      !isLoaded ||
      !activeCloudUserId ||
      cloudReadyUserId !== activeCloudUserId ||
      !cloudReadVerifiedRef.current ||
      activeCloudUserIdRef.current !== activeCloudUserId
    ) return undefined;

    const snapshot = JSON.stringify(farmProfile);
    if (snapshot === lastSyncedSnapshotRef.current) return undefined;

    const timeout = setTimeout(async () => {
      const method = cloudFarmExistsRef.current ? 'PUT' : 'POST';
      try {
        const response = await fetch('/api/farm', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: snapshot,
        });
        if (response.status === 409 && method === 'POST') {
          const refresh = await fetch('/api/farm');
          if (!refresh.ok) throw await responseError(refresh, 'A cloud farm exists but could not be loaded.');
          const { farmProfile: existingFarm } = await refresh.json();
          if (!existingFarm) throw new Error('A cloud farm exists but could not be loaded.');
          cloudFarmExistsRef.current = true;
          lastSyncedSnapshotRef.current = JSON.stringify(existingFarm);
          replaceFarmProfile(existingFarm);
          setPersistenceError('A cloud farm already existed. It was loaded without overwriting it with local data.');
          return;
        }
        if (!response.ok) throw await responseError(response, 'Could not save your cloud farm data.');
        const { farmProfile: savedFarm } = await response.json();
        if (!savedFarm) throw new Error('Supabase did not return the saved farm profile.');
        cloudFarmExistsRef.current = true;
        lastSyncedSnapshotRef.current = JSON.stringify(savedFarm);
        if (activeCloudUserIdRef.current === activeCloudUserId) {
          replaceFarmProfile(savedFarm);
          setIsCloudStorage(true);
          setLocalPersistenceEnabled(false);
          setPersistenceError('');
        }
      } catch (error) {
        console.error('Cloud farm save failed:', error.message);
        setPersistenceError(error.message);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [farmProfile, isLoaded, activeCloudUserId, cloudReadyUserId, retrySaveCount]);

  const updateFarmProfile = (newProfile) => {
    const current = profileRef.current;
    const updated = {
      ...current,
      ...newProfile,
      updatedAt: new Date().toISOString(),
    };
    replaceFarmProfile(updated);
    setPersistenceError('');
    return updated;
  };

  const addCrop = (cropData) => {
    const newCrop = {
      id: `crop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...cropData,
    };
    const current = profileRef.current;
    updateFarmProfile({
      crops: [...(Array.isArray(current.crops) ? current.crops : []), newCrop],
    });
    return newCrop;
  };

  const updateCrop = (cropId, updatedData) => {
    const current = profileRef.current;
    updateFarmProfile({
      crops: current.crops.map((crop) =>
        crop.id === cropId ? { ...crop, ...updatedData } : crop
      ),
    });
  };

  const removeCrop = (cropId) => {
    const current = profileRef.current;
    updateFarmProfile({
      crops: current.crops.filter((crop) => crop.id !== cropId),
    });
  };

  const saveCustomVillage = (villageData) => {
    const name = typeof villageData?.name === 'string' ? villageData.name.trim() : '';
    const district = typeof villageData?.district === 'string' ? villageData.district.trim() : '';
    const mandal = typeof villageData?.mandal === 'string' ? villageData.mandal.trim() : '';
    if (!name || !district || !mandal) {
      throw new Error('Custom village name, district, and mandal are required.');
    }

    const current = profileRef.current;
    const villages = current.customVillages || [];
    const sameParent = (village) =>
      village.district?.toLowerCase() === district.toLowerCase() &&
      village.mandal?.toLowerCase() === mandal.toLowerCase();
    const sourceVillage = getVillagesByMandal(district, mandal).find(
      (village) =>
        village.name?.trim().toLowerCase() === name.toLowerCase() ||
        village.nameTe?.trim() === name
    );
    if (sourceVillage) {
      throw new Error('This village is already in the selected mandal list. Select the listed village instead.');
    }

    const matchingVillage = villageData.id
      ? villages.find((village) => village.id === villageData.id)
      : villages.find(
          (village) =>
            sameParent(village) && village.name?.trim().toLowerCase() === name.toLowerCase()
        );
    const duplicate = villages.find(
      (village) =>
        village.id !== matchingVillage?.id &&
        sameParent(village) &&
        village.name?.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      throw new Error('A custom village with this name already exists in the selected mandal.');
    }
    const savedVillage = {
      ...matchingVillage,
      ...villageData,
      id: matchingVillage?.id || villageData.id || `village-${Date.now()}`,
      name,
      district,
      mandal,
      approximateCoords: true,
      updatedAt: new Date().toISOString(),
    };
    const updatedVillages = matchingVillage
      ? villages.map((village) =>
          village.id === matchingVillage.id ? savedVillage : village
        )
      : [...villages, savedVillage];
    updateFarmProfile({ customVillages: updatedVillages });
    return savedVillage;
  };

  const retryPersistence = () => {
    if (
      activeCloudUserId &&
      cloudReadVerifiedRef.current &&
      cloudReadyUserId === activeCloudUserId
    ) {
      setRetrySaveCount((count) => count + 1);
    } else {
      setRetryCount((count) => count + 1);
    }
  };

  return (
    <FarmContext.Provider
      value={{
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
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
