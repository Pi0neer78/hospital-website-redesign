/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
const STATS_URL = 'https://functions.poehali.dev/3b25f41d-7581-4cd1-b467-47d00b68f03c';
const VOTERS_URL = 'https://functions.poehali.dev/8a7de09a-52aa-4279-8b4e-2ebe90c6cbdd';

const STAR_COLORS: Record<number, string> = {
  5: 'text-green-600 bg-green-50',
  4: 'text-blue-600 bg-blue-50',
  3: 'text-yellow-600 bg-yellow-50',
  2: 'text-orange-600 bg-orange-50',
  1: 'text-red-600 bg-red-50',
};

const RatingsStats = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const [votersOpen, setVotersOpen] = useState(false);
  const [votersPeriod, setVotersPeriod] = useState<string>('all');
  const [votersPeriodTitle, setVotersPeriodTitle] = useState<string>('');
  const [voters, setVoters] = useState<any[]>([]);
  const [votersLoading, setVotersLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(STATS_URL);
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
        const now = new Date();
        setLastUpdateTime(now.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVoters = async (period: string) => {
    setVotersLoading(true);
    setVoters([]);
    try {
      const res = await fetch(`${VOTERS_URL}?period=${period}`);
      const data = await res.json();
      setVoters(data.voters || []);
    } catch (e) {
      console.error('Error loading voters:', e);
    } finally {
      setVotersLoading(false);
    }
  };

  const openVoters = (period: string, title: string) => {
    setVotersPeriod(period);
    setVotersPeriodTitle(title);
    setRatingFilter('all');
    setVotersOpen(true);
    loadVoters(period);
  };

  const handleRefresh = async () => {
    await loadStats();
    toast({ title: "Статистика обновлена", description: "Данные голосования актуализированы" });
  };

  useEffect(() => { loadStats(); }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dtStr: string) => {
    if (!dtStr) return '—';
    const d = new Date(dtStr);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredVoters = voters.filter(v => ratingFilter === 'all' || v.rating === ratingFilter);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = filteredVoters.map(v => `
      <tr>
        <td>${v.patient_name || '—'}</td>
        <td style="text-align:center">${v.rating} ★</td>
        <td>${formatDateTime(v.voted_at)}</td>
        <td>${v.patient_phone || '—'}</td>
        <td>${v.doctor_name || '—'}</td>
        <td>${v.appointment_date ? formatDate(v.appointment_date) + (v.appointment_time ? ' ' + v.appointment_time : '') : '—'}</td>
      </tr>`).join('');
    w.document.write(`
      <html><head><title>Голосование — ${votersPeriodTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h2 { margin-bottom: 8px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; }
        th { background: #f0f4f8; }
      </style></head>
      <body>
        <h2>Голосование — ${votersPeriodTitle}</h2>
        <p>Фильтр по оценке: ${ratingFilter === 'all' ? 'Все' : ratingFilter + ' ★'} | Записей: ${filteredVoters.length}</p>
        <table>
          <thead><tr>
            <th>ФИО</th><th>Оценка</th><th>Дата голосования</th>
            <th>Телефон</th><th>Врач</th><th>Запись</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`);
    w.document.close();
    w.print();
  };

  const handleExcel = () => {
    const data = filteredVoters.map(v => ({
      'ФИО': v.patient_name || '',
      'Оценка': v.rating,
      'Дата голосования': formatDateTime(v.voted_at),
      'Телефон': v.patient_phone || '',
      'Врач': v.doctor_name || '',
      'Дата записи': v.appointment_date ? formatDate(v.appointment_date) : '',
      'Время записи': v.appointment_time || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Голосование');
    XLSX.writeFile(wb, `golosovanie_${votersPeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const renderPeriodCard = (title: string, periodKey: string, icon: string) => {
    const periodData = stats?.[periodKey];
    if (!periodData) return null;

    const maxCount = Math.max(
      periodData.rating_1, periodData.rating_2, periodData.rating_3,
      periodData.rating_4, periodData.rating_5
    ) || 1;

    const dateRange = periodKey === 'day'
      ? formatDate(periodData.date_to)
      : `${formatDate(periodData.date_from)} — ${formatDate(periodData.date_to)}`;

    return (
      <Card key={periodKey}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name={icon} size={18} className="text-blue-600" />
              {title}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => openVoters(periodKey, title)}
            >
              <Icon name="Eye" size={13} />
              Смотреть
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{dateRange}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Всего оценок</div>
              <div className="text-2xl font-bold text-blue-600">{periodData.total_count}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Средняя оценка</div>
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                {periodData.avg_rating}
                <Icon name="Star" size={18} className="fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Распределение оценок</div>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = periodData[`rating_${rating}`];
              const percentage = periodData.total_count > 0 ? (count / periodData.total_count) * 100 : 0;
              const barWidth = (count / maxCount) * 100;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-xs font-medium">{rating}</span>
                    <Icon name="Star" size={12} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        rating === 5 ? 'bg-green-500' :
                        rating === 4 ? 'bg-blue-500' :
                        rating === 3 ? 'bg-yellow-500' :
                        rating === 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 rounded-lg border">
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Последнее обновление статистики</p>
          <p className="text-sm font-medium">{lastUpdateTime || 'Загрузка...'}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading} className="gap-2">
          <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderPeriodCard('За сутки', 'day', 'Clock')}
        {renderPeriodCard('За неделю', 'week', 'Calendar')}
        {renderPeriodCard('За месяц', 'month', 'CalendarDays')}
        {renderPeriodCard('С начала года', 'year', 'CalendarRange')}
        {renderPeriodCard('За все время', 'all', 'Infinity')}
      </div>

      <Dialog open={votersOpen} onOpenChange={setVotersOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Users" size={18} className="text-blue-600" />
              Голосование — {votersPeriodTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2 py-2 border-b">
            <span className="text-sm text-muted-foreground">Фильтр по оценке:</span>
            <Button
              size="sm"
              variant={ratingFilter === 'all' ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => setRatingFilter('all')}
            >
              Все
            </Button>
            {[5, 4, 3, 2, 1].map(r => (
              <Button
                key={r}
                size="sm"
                variant={ratingFilter === r ? 'default' : 'outline'}
                className={`h-7 text-xs gap-1 ${ratingFilter !== r ? STAR_COLORS[r] : ''}`}
                onClick={() => setRatingFilter(r)}
              >
                {r} <Icon name="Star" size={11} className="fill-yellow-400 text-yellow-400" />
              </Button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">Записей: {filteredVoters.length}</span>
          </div>

          <div className="flex-1 overflow-auto">
            {votersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredVoters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Нет данных за выбранный период</div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground border-b">ФИО</th>
                    <th className="text-center px-3 py-2 font-medium text-xs text-muted-foreground border-b">Оценка</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground border-b">Дата голосования</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground border-b">Телефон</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground border-b">Врач</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground border-b">Запись</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((v, i) => (
                    <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                      <td className="px-3 py-2 font-medium">{v.patient_name || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STAR_COLORS[v.rating]}`}>
                          {v.rating} <Icon name="Star" size={11} className="fill-yellow-400 text-yellow-400" />
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDateTime(v.voted_at)}</td>
                      <td className="px-3 py-2">{v.patient_phone || '—'}</td>
                      <td className="px-3 py-2">{v.doctor_name || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {v.appointment_date ? `${formatDate(v.appointment_date)}${v.appointment_time ? ' ' + v.appointment_time : ''}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button size="sm" variant="outline" className="gap-2" onClick={handlePrint}>
              <Icon name="Printer" size={15} />
              Печать
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-green-700 border-green-300 hover:bg-green-50" onClick={handleExcel}>
              <Icon name="FileSpreadsheet" size={15} />
              Сохранить в Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingsStats;