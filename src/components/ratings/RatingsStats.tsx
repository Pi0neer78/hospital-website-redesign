/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const STATS_URL = 'https://functions.poehali.dev/3b25f41d-7581-4cd1-b467-47d00b68f03c';

const RatingsStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(STATS_URL);
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const renderPeriodCard = (title: string, periodKey: string, icon: string) => {
    const periodData = stats?.[periodKey];
    if (!periodData) return null;

    const maxCount = Math.max(
      periodData.rating_1,
      periodData.rating_2,
      periodData.rating_3,
      periodData.rating_4,
      periodData.rating_5
    ) || 1;

    return (
      <Card key={periodKey}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name={icon} size={18} className="text-blue-600" />
            {title}
          </CardTitle>
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
                        rating === 2 ? 'bg-orange-500' :
                        'bg-red-500'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderPeriodCard('За сутки', 'day', 'Clock')}
        {renderPeriodCard('За неделю', 'week', 'Calendar')}
        {renderPeriodCard('За месяц', 'month', 'CalendarDays')}
        {renderPeriodCard('С начала года', 'year', 'CalendarRange')}
      </div>
    </div>
  );
};

export default RatingsStats;
