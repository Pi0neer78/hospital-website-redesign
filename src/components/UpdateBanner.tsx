import { useAppVersion } from '@/hooks/useAppVersion';

const UpdateBanner = () => {
  const { updateAvailable } = useAppVersion();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>🔄</span>
        <span>Доступна новая версия сайта — обновите страницу, чтобы изменения вступили в силу</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="ml-4 bg-white text-amber-600 text-sm font-semibold px-3 py-1 rounded-md hover:bg-amber-50 transition-colors flex-shrink-0"
      >
        Обновить
      </button>
    </div>
  );
};

export default UpdateBanner;
