import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface BackupProgressDialogProps {
  open: boolean;
  done: number;
  total: number;
  current: string;
  title?: string;
  unit?: string;
  icon?: string;
}

export default function BackupProgressDialog({ open, done, total, current, title = 'Идёт архивирование', unit = 'Таблиц', icon = 'DatabaseBackup' }: BackupProgressDialogProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-b from-amber-500 to-amber-600 px-8 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Icon name={icon} size={36} className="text-white" />
            </div>
          </div>
          <DialogTitle className="text-white text-xl font-bold mb-1">{title}</DialogTitle>
          <DialogDescription className="text-amber-50 text-sm">
            Не закрывайте и не обновляйте окно, пока операция не завершится
          </DialogDescription>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{percent}%</span>
            <span className="text-sm text-muted-foreground">
              {unit}: {Math.min(done, total).toLocaleString('ru-RU')} из {total ? total.toLocaleString('ru-RU') : '...'}
            </span>
          </div>
          <Progress value={percent} className="h-3" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-[20px]">
            <Icon name="Loader2" size={14} className="animate-spin shrink-0" />
            <span className="truncate">{current ? `Сейчас: ${current}` : 'Подготовка...'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
