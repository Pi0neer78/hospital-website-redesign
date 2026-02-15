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
  const [activeTab, setActiveTab] = useState<'stats' | 'admins'>('stats');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({ login: '', email: '', password: '', full_name: '' });
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logFilterAdmin, setLogFilterAdmin] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('security_token');
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
      loadStatistics(token);
      loadAdmins(token);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !adminToken) return;

    const interval = setInterval(() => {
      loadStatistics(adminToken);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated]);

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
        </div>

        {activeTab === 'stats' && (
          <SecurityStatistics
            stats={stats}
            loading={loading}
            searchIP={searchIP}
            onSearchIPChange={setSearchIP}
          />
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