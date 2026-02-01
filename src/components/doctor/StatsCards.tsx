import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  scheduledCount: number;
  completedCount: number;
  cancelledCount: number;
}

export const StatsCards = ({ scheduledCount, completedCount, cancelledCount }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Запланировано</p>
              <p className="text-3xl font-bold text-green-900">{scheduledCount}</p>
            </div>
            <Icon name="Calendar" size={40} className="text-green-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Завершено</p>
              <p className="text-3xl font-bold text-blue-900">{completedCount}</p>
            </div>
            <Icon name="CheckCircle" size={40} className="text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Отменено</p>
              <p className="text-3xl font-bold text-gray-900">{cancelledCount}</p>
            </div>
            <Icon name="XCircle" size={40} className="text-gray-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
