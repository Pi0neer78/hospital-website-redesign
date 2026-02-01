import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { DailySchedule } from '@/types/doctor';

interface DailyScheduleCardProps {
  schedule: DailySchedule;
  onEdit: (schedule: DailySchedule) => void;
  onToggleActive: (scheduleId: number, isActive: boolean) => void;
  onDelete: (scheduleId: number) => void;
}

export const DailyScheduleCard = ({
  schedule,
  onEdit,
  onToggleActive,
  onDelete
}: DailyScheduleCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <Card className={schedule.is_active ? '' : 'opacity-50 bg-gray-50'}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg">{formatDate(schedule.schedule_date)}</h4>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(schedule)}
              title="Редактировать"
            >
              <Icon name="Edit" size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleActive(schedule.id, !schedule.is_active)}
              title={schedule.is_active ? "Деактивировать" : "Активировать"}
            >
              <Icon name={schedule.is_active ? "Eye" : "EyeOff"} size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(schedule.id)}
              className="text-destructive hover:text-destructive"
              title="Удалить"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">Дата:</span> {schedule.schedule_date}
          </p>
          <p>
            <span className="font-medium">Время:</span> {schedule.start_time} - {schedule.end_time}
          </p>
          {schedule.break_start_time && schedule.break_end_time && (
            <p>
              <span className="font-medium">Перерыв:</span> {schedule.break_start_time} - {schedule.break_end_time}
            </p>
          )}
          <p>
            <span className="font-medium">Длительность слота:</span> {schedule.slot_duration} мин
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
