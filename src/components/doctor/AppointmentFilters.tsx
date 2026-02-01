import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AppointmentFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilterFrom: string;
  setDateFilterFrom: (date: string) => void;
  dateFilterTo: string;
  setDateFilterTo: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCount: number;
  onExportExcel: () => void;
  onPrint: () => void;
}

export const AppointmentFilters = ({
  statusFilter,
  setStatusFilter,
  dateFilterFrom,
  setDateFilterFrom,
  dateFilterTo,
  setDateFilterTo,
  searchQuery,
  setSearchQuery,
  filteredCount,
  onExportExcel,
  onPrint
}: AppointmentFiltersProps) => {
  return (
    <div className="flex gap-2 items-center flex-wrap mb-4">
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
        <Icon name="Search" size={14} className="text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск по ФИО, телефону, СНИЛС, ОМС..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-7 w-[200px] text-xs"
        />
      </div>
      
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
        <Icon name="Calendar" size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">С</span>
        <Input
          type="date"
          value={dateFilterFrom}
          onChange={(e) => setDateFilterFrom(e.target.value)}
          className="h-7 w-[130px] text-xs"
        />
        <span className="text-xs font-medium text-muted-foreground">По</span>
        <Input
          type="date"
          value={dateFilterTo}
          onChange={(e) => setDateFilterTo(e.target.value)}
          className="h-7 w-[130px] text-xs"
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Icon name="CalendarRange" size={14} />
            Период
            <Icon name="ChevronDown" size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDateFilterFrom(today);
              setDateFilterTo(today);
            }}
            className="cursor-pointer"
          >
            Сегодня
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              const today = new Date();
              const nextWeek = new Date(today);
              nextWeek.setDate(today.getDate() + 7);
              setDateFilterFrom(today.toISOString().split('T')[0]);
              setDateFilterTo(nextWeek.toISOString().split('T')[0]);
            }}
            className="cursor-pointer"
          >
            Неделя
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              const today = new Date();
              const nextMonth = new Date(today);
              nextMonth.setMonth(today.getMonth() + 1);
              setDateFilterFrom(today.toISOString().split('T')[0]);
              setDateFilterTo(nextMonth.toISOString().split('T')[0]);
            }}
            className="cursor-pointer"
          >
            Месяц
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Icon name="Filter" size={14} />
            {statusFilter === 'all' ? 'Все' : 
             statusFilter === 'scheduled' ? 'Запланировано' :
             statusFilter === 'completed' ? 'Завершено' : 'Отменено'}
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-xs font-semibold">
              {filteredCount}
            </span>
            <Icon name="ChevronDown" size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setStatusFilter('all')} className="cursor-pointer">
            Все
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('scheduled')} className="cursor-pointer">
            Запланировано
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="cursor-pointer">
            Завершено
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="cursor-pointer">
            Отменено
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={onExportExcel} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
        <Icon name="FileSpreadsheet" size={14} />
        Excel
      </Button>
      
      <Button onClick={onPrint} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
        <Icon name="Printer" size={14} />
        Печать
      </Button>
    </div>
  );
};
