import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CHECK_INTERVALS } from '@/constants/doctor';
import type { DoctorInfo } from '@/types/doctor';

interface DoctorHeaderProps {
  doctorInfo: DoctorInfo;
  autoRefreshEnabled: boolean;
  soundEnabled: boolean;
  checkInterval: number;
  toggleAutoRefresh: () => void;
  toggleSound: () => void;
  changeCheckInterval: (seconds: number) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export const DoctorHeader = ({
  doctorInfo,
  autoRefreshEnabled,
  soundEnabled,
  checkInterval,
  toggleAutoRefresh,
  toggleSound,
  changeCheckInterval,
  onRefresh,
  onLogout
}: DoctorHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Stethoscope" size={32} className="text-primary" />
          <div>
            <h1 className="text-xl font-bold">{doctorInfo.full_name}</h1>
            <p className="text-sm text-muted-foreground">{doctorInfo.position}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
            <span className="text-xs font-medium text-gray-700">Автообновление</span>
            <Button
              size="sm"
              variant={autoRefreshEnabled ? "default" : "outline"}
              onClick={toggleAutoRefresh}
              className="h-7 px-2"
            >
              <Icon name={autoRefreshEnabled ? "Pause" : "Play"} size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleSound}
              disabled={!autoRefreshEnabled}
              className="h-7 px-2"
              title={soundEnabled ? "Звук вкл" : "Звук выкл"}
            >
              <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={14} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!autoRefreshEnabled}
                  className="h-7 px-2 text-xs"
                >
                  {checkInterval}с
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Интервал проверки</DialogTitle>
                  <DialogDescription>
                    Выберите как часто проверять наличие новых записей
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {CHECK_INTERVALS.map((seconds) => (
                    <Button
                      key={seconds}
                      variant={checkInterval === seconds ? 'default' : 'outline'}
                      onClick={() => changeCheckInterval(seconds)}
                      className="h-16 flex flex-col"
                    >
                      <span className="text-2xl font-bold">{seconds}</span>
                      <span className="text-xs">секунд</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="h-7 px-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
              title="Обновить записи вручную"
            >
              <Icon name="RefreshCw" size={14} />
            </Button>
          </div>
          <Button variant="default" asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/doctor-guide">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Инструкция
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Icon name="Home" size={18} className="mr-2" />
              На главную
            </a>
          </Button>
          <Button variant="destructive" onClick={onLogout}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выход
          </Button>
        </div>
      </div>
    </header>
  );
};
