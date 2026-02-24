import { useState, useEffect } from 'react';

const CHECK_INTERVAL = 2 * 60 * 1000; // каждые 2 минуты

export function useAppVersion() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let currentEtag: string | null = null;

    const checkVersion = async () => {
      try {
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
        const etag = res.headers.get('etag') || res.headers.get('last-modified');
        if (!etag) return;
        if (currentEtag === null) {
          currentEtag = etag;
        } else if (currentEtag !== etag) {
          setUpdateAvailable(true);
        }
      } catch {
        // сеть недоступна — игнорируем
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { updateAvailable };
}
