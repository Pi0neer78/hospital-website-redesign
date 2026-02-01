import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AvailableDate {
  date: string;
  label: string;
  isWorking: boolean;
  slotsCount?: number;
}

interface DateSlotSelectorProps {
  availableDates: AvailableDate[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  availableSlots: string[];
  isLoadingDates: boolean;
  isLoadingSlots: boolean;
  onSelectSlot: (slot: string) => void;
  selectedSlot?: string;
}

const DateSlotSelector = ({ 
  availableDates, 
  selectedDate, 
  setSelectedDate, 
  availableSlots, 
  isLoadingDates, 
  isLoadingSlots,
  onSelectSlot,
  selectedSlot
}: DateSlotSelectorProps) => {
  return (
    <div id="available-dates-section" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Icon name="Calendar" size={20} />
          Доступные даты
        </h3>
        {isLoadingDates ? (
          <div className="text-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Загрузка дат...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map((dateItem) => (
              <Button
                key={dateItem.date}
                variant={selectedDate === dateItem.date ? 'default' : 'outline'}
                className={`h-auto py-2 px-1 flex flex-col items-center justify-center ${
                  !dateItem.isWorking ? 'opacity-50 cursor-not-allowed' : ''
                } ${selectedDate === dateItem.date ? 'ring-2 ring-primary' : ''}`}
                onClick={() => dateItem.isWorking && setSelectedDate(dateItem.date)}
                disabled={!dateItem.isWorking}
              >
                <span className="text-xs font-medium">{dateItem.label}</span>
                {dateItem.slotsCount !== undefined && (
                  <span className="text-[10px] mt-1">
                    {dateItem.slotsCount > 0 ? `${dateItem.slotsCount} слотов` : 'Нет мест'}
                  </span>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Доступное время
          </h3>
          {isLoadingSlots ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Загрузка слотов...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground">Нет доступных слотов на эту дату</p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? 'default' : 'outline'}
                  onClick={() => onSelectSlot(slot)}
                  className={selectedSlot === slot ? 'ring-2 ring-primary' : ''}
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateSlotSelector;
