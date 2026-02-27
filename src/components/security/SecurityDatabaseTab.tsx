/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BackupSettings {
  enabled: boolean;
  start_time: string;
  end_time: string;
  repeat_minutes: number;
  retention_days: number;
}

interface SecurityDatabaseTabProps {
  backupSettings: BackupSettings;
  onBackupSettingsChange: (settings: BackupSettings) => void;
  backupSettingsLoading: boolean;
  onSaveBackupSettings: () => void;
  cleanupRunning: boolean;
  onRunCleanup: () => void;
  backupRunning: boolean;
  fullBackupRunning: boolean;
  onRunBackup: (full: boolean) => void;
  lastBackupResult: any;
  backupFolders: any[];
  backupListLoading: boolean;
  onLoadBackupList: () => void;
  expandedFolder: string | null;
  onExpandedFolderChange: (folder: string | null) => void;
  backupPage: number;
  onBackupPageChange: (page: number) => void;
  backupPageSize: number;
  onBackupPageSizeChange: (size: number) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
};

const formatFolderDate = (folder: string) => {
  const clean = folder.replace('полный_архив_', '');
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/);
  if (!match) return folder;
  return `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}:${match[6]}`;
};

const SecurityDatabaseTab = ({
  backupSettings,
  onBackupSettingsChange,
  backupSettingsLoading,
  onSaveBackupSettings,
  cleanupRunning,
  onRunCleanup,
  backupRunning,
  fullBackupRunning,
  onRunBackup,
  lastBackupResult,
  backupFolders,
  backupListLoading,
  onLoadBackupList,
  expandedFolder,
  onExpandedFolderChange,
  backupPage,
  onBackupPageChange,
  backupPageSize,
  onBackupPageSizeChange,
}: SecurityDatabaseTabProps) => {
  const totalPages = Math.ceil(backupFolders.length / backupPageSize);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Icon name="Database" size={18} className="text-primary" />
          Базы данных
        </h2>

        <div className="flex items-center gap-3 pb-4 border-b">
          <input
            type="checkbox"
            id="backup-enabled"
            checked={backupSettings.enabled}
            onChange={(e) => onBackupSettingsChange({ ...backupSettings, enabled: e.target.checked })}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="backup-enabled" className="text-sm font-medium cursor-pointer">
            Выполнять архивирование баз данных
          </label>
        </div>

        {backupSettings.enabled && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Архивируемые таблицы: <span className="font-medium text-foreground">appointments_v2, daily_schedules, doctor_calendar, doctor_schedules</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Время начала</label>
                <input
                  type="time"
                  value={backupSettings.start_time}
                  onChange={(e) => onBackupSettingsChange({ ...backupSettings, start_time: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Время конца</label>
                <input
                  type="time"
                  value={backupSettings.end_time}
                  onChange={(e) => onBackupSettingsChange({ ...backupSettings, end_time: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Повторять через (мин)</label>
                <input
                  type="number"
                  min={0}
                  value={backupSettings.repeat_minutes}
                  onChange={(e) => onBackupSettingsChange({ ...backupSettings, repeat_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="0"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {backupSettings.repeat_minutes === 0
                ? `Архивирование будет выполняться 1 раз в день в ${backupSettings.start_time}`
                : `Архивирование будет выполняться каждые ${backupSettings.repeat_minutes} мин. в период с ${backupSettings.start_time} до ${backupSettings.end_time}`
              }
            </p>
            <Button size="sm" onClick={onSaveBackupSettings} disabled={backupSettingsLoading}>
              <Icon name="Save" size={14} className="mr-1.5" />
              {backupSettingsLoading ? 'Сохранение...' : 'Сохранить расписание'}
            </Button>
          </div>
        )}

        {!backupSettings.enabled && (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={onSaveBackupSettings} disabled={backupSettingsLoading}>
              <Icon name="Save" size={14} className="mr-1.5" />
              Сохранить
            </Button>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Хранение архивов</h4>
          <div className="flex items-end gap-3">
            <div className="w-48">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Количество хранимых дней</label>
              <input
                type="number"
                min={0}
                value={backupSettings.retention_days}
                onChange={(e) => onBackupSettingsChange({ ...backupSettings, retention_days: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0 = бессрочно"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={onRunCleanup}
              disabled={cleanupRunning || backupSettings.retention_days <= 0}
              title={backupSettings.retention_days <= 0 ? 'Укажите количество дней больше 0' : ''}
            >
              <Icon name={cleanupRunning ? 'Loader2' : 'Trash2'} size={14} className={`mr-1.5 ${cleanupRunning ? 'animate-spin' : ''}`} />
              {cleanupRunning ? 'Удаление...' : 'Удалить старые архивы'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {backupSettings.retention_days <= 0
              ? 'Архивы хранятся бессрочно. Укажите количество дней, чтобы включить автоочистку.'
              : `Архивы старше ${backupSettings.retention_days} дн. будут удалены при нажатии кнопки или автоматически через CRON.`
            }
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Icon name="HardDriveDownload" size={16} className="text-primary" />
          Ручное архивирование
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRunBackup(false)}
            disabled={backupRunning || fullBackupRunning}
          >
            <Icon name={backupRunning ? 'Loader2' : 'Archive'} size={14} className={`mr-1.5 ${backupRunning ? 'animate-spin' : ''}`} />
            {backupRunning ? 'Архивирование...' : 'Архивировать базы'}
          </Button>
          <Button
            size="sm"
            onClick={() => onRunBackup(true)}
            disabled={backupRunning || fullBackupRunning}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Icon name={fullBackupRunning ? 'Loader2' : 'DatabaseBackup'} size={14} className={`mr-1.5 ${fullBackupRunning ? 'animate-spin' : ''}`} />
            {fullBackupRunning ? 'Создание архива...' : 'Сделать полный архив баз данных'}
          </Button>
        </div>

        {lastBackupResult && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Результат: папка <span className="font-mono bg-muted px-1 rounded text-[11px]">{lastBackupResult.folder}</span>
            </p>
            <div className="space-y-1">
              {lastBackupResult.results?.map((r: any) => (
                <div key={r.table} className="flex items-center gap-2 text-xs">
                  <Icon
                    name={r.success ? 'CheckCircle2' : 'XCircle'}
                    size={13}
                    className={r.success ? 'text-green-600' : 'text-red-500'}
                  />
                  <span className="font-medium w-44">{r.table}</span>
                  {r.success
                    ? <span className="text-muted-foreground">{r.rows} строк</span>
                    : <span className="text-red-500">{r.error}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon name="FolderArchive" size={16} className="text-primary" />
            Список архивов
            {backupFolders.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {backupFolders.length}
              </span>
            )}
          </h3>
          <Button variant="ghost" size="sm" onClick={onLoadBackupList} disabled={backupListLoading}>
            <Icon name={backupListLoading ? 'Loader2' : 'RefreshCw'} size={14} className={backupListLoading ? 'animate-spin' : ''} />
          </Button>
        </div>

        {backupListLoading && backupFolders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Загрузка...</p>
        ) : backupFolders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Архивов пока нет</p>
        ) : (
          <>
            <div className="space-y-1.5">
              {backupFolders.slice((backupPage - 1) * backupPageSize, backupPage * backupPageSize).map((folder) => (
                <div key={folder.folder} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => onExpandedFolderChange(expandedFolder === folder.folder ? null : folder.folder)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        name={folder.full ? 'DatabaseBackup' : 'Archive'}
                        size={15}
                        className={folder.full ? 'text-amber-600 shrink-0' : 'text-primary shrink-0'}
                      />
                      <span className="text-sm font-medium truncate">{formatFolderDate(folder.folder)}</span>
                      {folder.full && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">полный</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{folder.file_count} файл{folder.file_count === 1 ? '' : folder.file_count < 5 ? 'а' : 'ов'}</span>
                      <span className="text-xs text-muted-foreground">{formatSize(folder.total_size)}</span>
                      <Icon name={expandedFolder === folder.folder ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
                    </div>
                  </button>

                  {expandedFolder === folder.folder && (
                    <div className="border-t bg-muted/30 px-3 py-2 space-y-1">
                      {folder.files.map((file: any) => (
                        <div key={file.name} className="flex items-center justify-between text-xs py-0.5">
                          <div className="flex items-center gap-1.5">
                            <Icon name="FileText" size={12} className="text-muted-foreground" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>{formatSize(file.size)}</span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon name="Download" size={11} />
                              скачать
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {backupFolders.length > 0 ? `${(backupPage - 1) * backupPageSize + 1}–${Math.min(backupPage * backupPageSize, backupFolders.length)} из ${backupFolders.length}` : ''}
                </span>
                <select
                  value={backupPageSize}
                  onChange={(e) => { onBackupPageSizeChange(Number(e.target.value)); onBackupPageChange(1); onExpandedFolderChange(null); }}
                  className="text-xs border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {[5, 10, 20, 50].map(s => (
                    <option key={s} value={s}>{s} / стр.</option>
                  ))}
                </select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    className="px-2 py-1 text-xs border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => { onBackupPageChange(backupPage - 1); onExpandedFolderChange(null); }}
                    disabled={backupPage === 1}
                  >
                    <Icon name="ChevronLeft" size={13} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .reduce((acc: (number | string)[], p, i, arr) => {
                      if (p === 1 || p === arr.length || Math.abs(p - backupPage) <= 1) {
                        if (acc.length > 0 && typeof acc[acc.length - 1] === 'number' && (p - (acc[acc.length - 1] as number)) > 1) acc.push('...');
                        acc.push(p);
                      }
                      return acc;
                    }, [])
                    .map((p, i) => p === '...' ? (
                      <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`px-2.5 py-1 text-xs border rounded ${backupPage === p ? 'bg-primary text-white border-primary' : 'hover:bg-muted'}`}
                        onClick={() => { onBackupPageChange(p as number); onExpandedFolderChange(null); }}
                      >
                        {p}
                      </button>
                    ))
                  }
                  <button
                    className="px-2 py-1 text-xs border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => { onBackupPageChange(backupPage + 1); onExpandedFolderChange(null); }}
                    disabled={backupPage === totalPages}
                  >
                    <Icon name="ChevronRight" size={13} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityDatabaseTab;
