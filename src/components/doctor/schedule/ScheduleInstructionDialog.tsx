import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ScheduleInstructionDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="HelpCircle" size={16} className="mr-2" />
          Как настроить расписание?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройка расписания приема</DialogTitle>
          <DialogDescription>Подробная инструкция по работе с расписанием</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Создание нового расписания</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Нажмите кнопку "Добавить расписание"</li>
              <li>Выберите день недели (Понедельник - Воскресенье)</li>
              <li>Укажите время начала и окончания приема</li>
              <li>При необходимости добавьте перерыв (время начала и окончания перерыва)</li>
              <li>Укажите длительность одного слота в минутах (по умолчанию 15 минут)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Управление расписанием</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Редактировать:</strong> измените время работы или длительность слота</li>
              <li><strong>Копировать:</strong> примените расписание одного дня на другие дни недели</li>
              <li><strong>Активировать/Деактивировать:</strong> временно отключите расписание без удаления</li>
              <li><strong>Удалить:</strong> полностью удалите расписание на выбранный день</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Длительность слота</h3>
            <p className="mb-2">Длительность слота определяет, сколько времени выделяется на один прием пациента. Примеры:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>15 минут — быстрые консультации</li>
              <li>30 минут — стандартный прием</li>
              <li>45-60 минут — расширенный прием</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInstructionDialog;
