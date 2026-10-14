import { useState, useEffect, useCallback } from 'react';

export const CLINICS_URL = 'https://functions.poehali.dev/e24c78dc-20d1-4263-beb9-7227e20603c4';

export interface Clinic {
  id: number;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const FALLBACK: Clinic[] = [
  { id: 1, name: 'Центральная городская поликлиника', description: 'Приём взрослого населения', icon: 'Building2', sort_order: 1, is_active: true },
  { id: 2, name: 'Детская городская поликлиника', description: 'Приём детей', icon: 'Baby', sort_order: 2, is_active: true },
  { id: 3, name: 'Женская консультация', description: 'Наблюдение беременности и женское здоровье', icon: 'HeartPulse', sort_order: 3, is_active: true },
];

export const useClinics = (includeInactive = false) => {
  const [clinics, setClinics] = useState<Clinic[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(includeInactive ? `${CLINICS_URL}?all=true` : CLINICS_URL);
      const data = await res.json();
      if (Array.isArray(data.clinics) && data.clinics.length) setClinics(data.clinics);
    } catch {
      setClinics(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { clinics, loading, reload };
};
