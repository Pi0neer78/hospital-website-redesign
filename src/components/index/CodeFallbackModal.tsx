import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface CodeFallbackModalProps {
  code: string | null;
  onClose: () => void;
}

export default function CodeFallbackModal({ code, onClose }: CodeFallbackModalProps) {
  return (
    <Dialog open={!!code} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md text-center p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-amber-500 to-amber-600 px-8 pt-8 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Icon name="TriangleAlert" size={40} className="text-white" />
            </div>
          </div>
          <DialogTitle className="text-white text-xl font-bold mb-1">Код подтверждения</DialogTitle>
          <DialogDescription className="text-amber-50 text-sm">
            Отправка кода в MAX временно недоступна! Используйте указанный код!
          </DialogDescription>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl py-5">
            <p className="text-xs text-amber-700 mb-1">Ваш код</p>
            <p className="text-4xl font-bold tracking-[0.3em] text-gray-900 select-all">{code}</p>
          </div>
          <Button onClick={onClose} className="w-full">
            ОК
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
