import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface CodeSentModalProps {
  open: boolean;
  phone: string;
  onClose: () => void;
}

export default function CodeSentModal({ open, phone, onClose }: CodeSentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md text-center p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-8 pt-8 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Icon name="MessageCircle" size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Код отправлен!</h2>
          <p className="text-blue-100 text-sm">
            Сообщение направлено в мессенджер MAX на номер
          </p>
          <p className="text-white font-semibold text-lg mt-1">{phone}</p>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon name="TriangleAlert" size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Важно!</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Код придёт от <span className="font-bold">робота АЦГМБ</span>.
                  Пожалуйста, <span className="font-semibold">не отвечайте ему</span> и{" "}
                  <span className="font-semibold">не перезванивайте</span> — робот не принимает входящие сообщения и звонки.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon name="KeyRound" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">Что делать с кодом?</p>
                <p className="text-sm text-green-700 leading-relaxed">
                  Введите полученный код <span className="font-semibold">в окне записи на приём</span> — оно уже ждёт вас.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            <Icon name="Check" size={16} className="mr-2" />
            Понятно, ввожу код
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
