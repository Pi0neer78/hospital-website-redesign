/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SecurityLogin from '@/components/security/SecurityLogin';
import SecurityStatistics from '@/components/security/SecurityStatistics';
import AdminManagement from '@/components/security/AdminManagement';
import * as XLSX from 'xlsx';

const RATE_LIMITER_URL = 'https://functions.poehali.dev/dd760420-6c65-41e9-bd95-171dec0f3ac9';
const AUTH_URL = 'https://functions.poehali.dev/c5b009b8-4d0d-4b09-91f5-1ab8bdf740bb';
const ADMIN_MANAGEMENT_URL = 'https://functions.poehali.dev/41b28850-cf23-4959-9bd7-7f728c1ad124';
const REGISTRY_URL = 'https://functions.poehali.dev/e644fdea-011f-4d16-b984-98838c4e6c69';
const DB_BACKUP_URL = 'https://functions.poehali.dev/44a9271b-91c3-434f-a4ed-a10b64718f46';

interface EndpointStat {
  endpoint: string;
  total_requests: number;
  unique_ips: number;
  unique_devices: number;
}

interface SuspiciousIP {
  ip_address: string;
  request_count: number;
  first_seen: string;
  last_seen: string;
}

interface Statistics {
  endpoint_stats: EndpointStat[];
  suspicious_ips: SuspiciousIP[];
}

interface Admin {
  id: number;
  login: string;
  email: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  last_login?: string;
}

const Security = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchIP, setSearchIP] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'admins' | 'databases'>('stats');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({ login: '', email: '', password: '', full_name: '' });
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logFilterAdmin, setLogFilterAdmin] = useState<string>('');

  const [backupSettings, setBackupSettings] = useState({ enabled: false, start_time: '02:00', end_time: '04:00', repeat_minutes: 0 });
  const [backupSettingsLoading, setBackupSettingsLoading] = useState(false);
  const [backupRunning, setBackupRunning] = useState(false);
  const [fullBackupRunning, setFullBackupRunning] = useState(false);
  const [lastBackupResult, setLastBackupResult] = useState<any>(null);
  const [backupFolders, setBackupFolders] = useState<any[]>([]);
  const [backupListLoading, setBackupListLoading] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [backupFolders, setBackupFolders] = useState<any[]>([]);
  const [backupListLoading, setBackupListLoading] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('security_token');
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
      loadStatistics(token);
      loadAdmins(token);
      loadBackupSettings();
      loadBackupList();
      loadBackupList();
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !adminToken) return;

    const interval = setInterval(() => {
      loadStatistics(adminToken);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated]);

  const loadBackupList = async () => {
    setBackupListLoading(true);
    try {
      const res = await fetch(`${DB_BACKUP_URL}?action=list`);
      const data = await res.json();
      if (data.success) setBackupFolders(data.folders);
    } catch {
      // ignore
    } finally {
      setBackupListLoading(false);
    }
  };

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

  const loadBackupList = async () => {
    setBackupListLoading(true);
    try {
      const res = await fetch(`${DB_BACKUP_URL}?action=list`);
      const data = await res.json();
      if (data.success) setBackupFolders(data.folders);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить список архивов', variant: 'destructive' });
    } finally {
      setBackupListLoading(false);
    }
  };

  const loadBackupSettings = async () => {
    setBackupSettingsLoading(true);
    try {
      const res = await fetch(`${DB_BACKUP_URL}?action=settings`);
      const data = await res.json();
      if (data.success) setBackupSettings(data.settings);
    } catch {
      // ignore
    } finally {
      setBackupSettingsLoading(false);
    }
  };

  const saveBackupSettings = async () => {
    setBackupSettingsLoading(true);
    try {
      await fetch(`${DB_BACKUP_URL}?action=settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupSettings),
      });
      toast({ title: 'Настройки сохранены' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить настройки', variant: 'destructive' });
    } finally {
      setBackupSettingsLoading(false);
    }
  };

  const runBackup = async (full: boolean) => {
    if (full) setFullBackupRunning(true);
    else setBackupRunning(true);
    setLastBackupResult(null);
    try {
      const res = await fetch(`${DB_BACKUP_URL}?action=backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full }),
      });
      const data = await res.json();
      setLastBackupResult(data);
      const ok = data.results?.filter((r: any) => r.success).length || 0;
      const total = data.results?.length || 0;
      toast({ title: full ? 'Полный архив создан' : 'Архив создан', description: `Архивировано таблиц: ${ok}/${total}` });
      loadBackupList();
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить архивирование', variant: 'destructive' });
    } finally {
      if (full) setFullBackupRunning(false);
      else setBackupRunning(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const token = data.token;
        localStorage.setItem('security_token', token);
        setAdminToken(token);
        setIsAuthenticated(true);
        loadStatistics(token);
        loadAdmins(token);
        toast({
          title: 'Вход выполнен',
          description: 'Добро пожаловать в панель безопасности',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const loadMDoctorLogs = async (adminLogin?: string) => {
    setLogLoading(true);
    setLogFilterAdmin(adminLogin || '');
    try {
      const params = new URLSearchParams({ action: 'logs', limit: '200' });
      if (adminLogin) params.append('admin_login', adminLogin);
      const response = await fetch(`${REGISTRY_URL}?${params}`);
      const data = await response.json();
      if (data.logs) setLogEntries(data.logs);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить журнал', variant: 'destructive' });
    } finally {
      setLogLoading(false);
    }
  };

  const handleViewLogs = (adminLogin?: string) => {
    loadMDoctorLogs(adminLogin);
    setShowLogDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('security_token');
    setIsAuthenticated(false);
    setAdminToken(null);
    setStats(null);
    setAdmins([]);
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!',
    });
  };

  const loadAdmins = async (token?: string) => {
    const authToken = token || adminToken || localStorage.getItem('security_token');
    if (!authToken) return;
    
    try {
      const response = await fetch(ADMIN_MANAGEMENT_URL, {
        headers: {
          'X-Admin-Token': authToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminToken) return;
    
    try {
      const response = await fetch(ADMIN_MANAGEMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify(newAdmin),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Администратор добавлен',
        });
        setShowAddAdmin(false);
        setNewAdmin({ login: '', email: '', password: '', full_name: '' });
        loadAdmins();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить администратора',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminToken || !editingAdmin) return;
    
    try {
      const response = await fetch(ADMIN_MANAGEMENT_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify(editingAdmin),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Администратор обновлен',
        });
        setEditingAdmin(null);
        loadAdmins();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить администратора',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!adminToken) return;
    
    if (!confirm('Вы уверены, что хотите удалить этого администратора?')) return;
    
    try {
      const response = await fetch(`${ADMIN_MANAGEMENT_URL}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Успех',
          description: 'Администратор удален',
        });
        loadAdmins();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить администратора',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    }
  };

  const loadStatistics = async (token?: string) => {
    const authToken = token || adminToken || localStorage.getItem('security_token');
    if (!authToken) {
      toast({
        title: 'Ошибка',
        description: 'Не авторизован. Войдите заново.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${RATE_LIMITER_URL}?action=get-stats`, {
        headers: {
          'X-Admin-Token': authToken,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Токен недействителен. Войдите заново.');
        }
        throw new Error('Failed to load statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить статистику',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SecurityLogin
        login={login}
        password={password}
        onLoginChange={setLogin}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Shield" size={32} className="text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Панель безопасности</h1>
                <p className="text-sm text-muted-foreground">Мониторинг и защита от ботов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Icon name={autoRefresh ? "Pause" : "Play"} size={16} className="mr-2" />
                {autoRefresh ? 'Остановить' : 'Авто-обновление'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadStatistics()} disabled={loading}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="BarChart3" size={16} className="inline mr-2" />
            Статистика
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'admins'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Users" size={16} className="inline mr-2" />
            Администраторы
          </button>
          <button
            onClick={() => setActiveTab('databases')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'databases'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Database" size={16} className="inline mr-2" />
            Базы данных
          </button>
        </div>

        {activeTab === 'stats' && (
          <SecurityStatistics
            stats={stats}
            loading={loading}
            searchIP={searchIP}
            onSearchIPChange={setSearchIP}
          />
        )}

        {activeTab === 'databases' && (
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
                  onChange={(e) => setBackupSettings({ ...backupSettings, enabled: e.target.checked })}
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
                        onChange={(e) => setBackupSettings({ ...backupSettings, start_time: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Время конца</label>
                      <input
                        type="time"
                        value={backupSettings.end_time}
                        onChange={(e) => setBackupSettings({ ...backupSettings, end_time: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Повторять через (мин)</label>
                      <input
                        type="number"
                        min={0}
                        value={backupSettings.repeat_minutes}
                        onChange={(e) => setBackupSettings({ ...backupSettings, repeat_minutes: parseInt(e.target.value) || 0 })}
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
                  <Button size="sm" onClick={saveBackupSettings} disabled={backupSettingsLoading}>
                    <Icon name="Save" size={14} className="mr-1.5" />
                    {backupSettingsLoading ? 'Сохранение...' : 'Сохранить расписание'}
                  </Button>
                </div>
              )}

              {!backupSettings.enabled && (
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={saveBackupSettings} disabled={backupSettingsLoading}>
                    <Icon name="Save" size={14} className="mr-1.5" />
                    Сохранить
                  </Button>
                </div>
              )}
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
                  onClick={() => runBackup(false)}
                  disabled={backupRunning || fullBackupRunning}
                >
                  <Icon name={backupRunning ? 'Loader2' : 'Archive'} size={14} className={`mr-1.5 ${backupRunning ? 'animate-spin' : ''}`} />
                  {backupRunning ? 'Архивирование...' : 'Архивировать базы'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => runBackup(true)}
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
                <Button variant="ghost" size="sm" onClick={loadBackupList} disabled={backupListLoading}>
                  <Icon name={backupListLoading ? 'Loader2' : 'RefreshCw'} size={14} className={backupListLoading ? 'animate-spin' : ''} />
                </Button>
              </div>

              {backupListLoading && backupFolders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Загрузка...</p>
              ) : backupFolders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Архивов пока нет</p>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {backupFolders.map((folder) => (
                    <div key={folder.folder} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => setExpandedFolder(expandedFolder === folder.folder ? null : folder.folder)}
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
              )}
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Icon name="FolderOpen" size={16} className="text-primary" />
                  Созданные архивы
                </h3>
                <Button variant="outline" size="sm" onClick={loadBackupList} disabled={backupListLoading}>
                  <Icon name={backupListLoading ? 'Loader2' : 'RefreshCw'} size={13} className={`mr-1.5 ${backupListLoading ? 'animate-spin' : ''}`} />
                  Обновить
                </Button>
              </div>

              {backupListLoading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Загрузка...</p>
              ) : backupFolders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Архивов пока нет</p>
              ) : (
                <div className="space-y-2">
                  {backupFolders.map((folder) => {
                    const isExpanded = expandedFolder === folder.folder;
                    const sizeKb = (folder.total_size / 1024).toFixed(1);
                    const dateLabel = (() => {
                      const raw = folder.folder.replace('полный_архив_', '');
                      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/);
                      return m ? `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}:${m[6]}` : folder.folder;
                    })();
                    return (
                      <div key={folder.folder} className="border rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                          onClick={() => setExpandedFolder(isExpanded ? null : folder.folder)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon name={folder.full ? 'DatabaseBackup' : 'Archive'} size={14} className={folder.full ? 'text-amber-600' : 'text-primary'} />
                            <span className="text-sm font-medium">{dateLabel}</span>
                            {folder.full && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Полный</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{folder.files.length} файлов · {sizeKb} КБ</span>
                            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t bg-muted/20 px-4 py-3 space-y-1.5">
                            {folder.files.map((file: any) => (
                              <div key={file.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <Icon name="FileText" size={12} className="text-muted-foreground" />
                                  <span className="font-medium">{file.name}</span>
                                  <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} КБ)</span>
                                </div>
                                <a
                                  href={file.url}
                                  download
                                  className="flex items-center gap-1 text-primary hover:underline"
                                >
                                  <Icon name="Download" size={12} />
                                  Скачать
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <AdminManagement
            admins={admins}
            showAddAdmin={showAddAdmin}
            editingAdmin={editingAdmin}
            newAdmin={newAdmin}
            onShowAddAdmin={setShowAddAdmin}
            onEditingAdmin={setEditingAdmin}
            onNewAdminChange={setNewAdmin}
            onAddAdmin={handleAddAdmin}
            onUpdateAdmin={handleUpdateAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            onViewLogs={handleViewLogs}
          />
        )}
      </main>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Icon name="ScrollText" size={18} />
              {logFilterAdmin ? `Журнал действий: ${logFilterAdmin}` : 'Общий журнал действий главного врача'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => {
              if (logEntries.length === 0) return;
              const printWindow = window.open('', '_blank');
              if (!printWindow) return;
              const title = logFilterAdmin ? `Журнал действий: ${logFilterAdmin}` : 'Общий журнал действий главного врача';
              const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h2 { margin: 5px 0; font-size: 16px; }
    .header p { margin: 3px 0; font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 5px; text-align: left; font-size: 11px; }
    th { background: #f0f0f0; font-weight: bold; }
    .footer { font-size: 10px; color: #666; margin-top: 10px; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${title}</h2>
    <p>ГБУЗ Антрацитовская ЦГМБ ЛНР</p>
    <p>Дата печати: ${new Date().toLocaleString('ru-RU')}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Дата</th>
        <th>Администратор</th>
        <th>Действие</th>
        <th>Подробности</th>
        <th>IP</th>
      </tr>
    </thead>
    <tbody>
      ${logEntries.map((log: any, idx: number) => {
        let details = '';
        try {
          const d = JSON.parse(log.details);
          details = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
        } catch {
          details = log.details || '';
        }
        return `
        <tr>
          <td>${idx + 1}</td>
          <td>${new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</td>
          <td>${log.admin_login || '—'}</td>
          <td>${log.action_type}</td>
          <td>${details}</td>
          <td>${log.ip_address || '—'}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  <div class="footer">Всего записей: ${logEntries.length}</div>
</body>
</html>`;
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
            }} disabled={logEntries.length === 0}>
              <Icon name="Printer" size={14} className="mr-1" />
              Печать
            </Button>
            <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700 border-green-600" onClick={() => {
              if (logEntries.length === 0) return;
              const rows = logEntries.map((log: any) => {
                let details = '';
                try {
                  const d = JSON.parse(log.details);
                  details = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                } catch {
                  details = log.details || '';
                }
                return {
                  'Дата': new Date(log.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
                  'Администратор': log.admin_login || '',
                  'Действие': log.action_type || '',
                  'Подробности': details,
                  'IP': log.ip_address || ''
                };
              });
              const ws = XLSX.utils.json_to_sheet(rows);
              ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 15 }];
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Журнал');
              const fileName = logFilterAdmin ? `журнал_${logFilterAdmin}_${new Date().toISOString().split('T')[0]}.xlsx` : `журнал_главврач_${new Date().toISOString().split('T')[0]}.xlsx`;
              XLSX.writeFile(wb, fileName);
            }} disabled={logEntries.length === 0}>
              <Icon name="Download" size={14} className="mr-1" />
              Экспорт в Excel
            </Button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {logLoading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : logEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет записей</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="py-2">Дата</TableHead>
                    <TableHead className="py-2">Администратор</TableHead>
                    <TableHead className="py-2">Действие</TableHead>
                    <TableHead className="py-2">Подробности</TableHead>
                    <TableHead className="py-2">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logEntries.map((log: any) => (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="py-2 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        }).replace(',', '')}
                      </TableCell>
                      <TableCell className="py-2">{log.admin_login || '—'}</TableCell>
                      <TableCell className="py-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                          {log.action_type}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 max-w-xs">
                        <div className="line-clamp-2 text-[11px] text-muted-foreground" title={log.details}>
                          {(() => {
                            try {
                              const d = JSON.parse(log.details);
                              return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                            } catch {
                              return log.details;
                            }
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-[10px] text-muted-foreground">{log.ip_address || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Security;