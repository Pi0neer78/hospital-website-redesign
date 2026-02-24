import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NameErrorModalProps {
  open: boolean;
  errorMessage: string;
  onClose: () => void;
}

const NameErrorModal = ({ open, errorMessage, onClose }: NameErrorModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 px-6 pt-6 pb-4 flex gap-4 items-start">
          <img
            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/ba1d293c-008d-42b2-a876-21affaf3f8f0.jpg"
            alt="Недовольный врач"
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border-2 border-red-200 shadow"
          />
          <div>
            <h2 className="text-lg font-bold text-red-700 leading-tight mb-1">Неверно заполнено ФИО!</h2>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Как правильно заполнять ФИО:</p>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Минимум <strong>два слова</strong>: фамилия и имя</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Каждое слово — <strong>не менее 2 букв</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Только <strong>буквы</strong> (русские или латинские) и дефис</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Нельзя: цифры, точки, спецсимволы</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Нельзя: сокращения типа <strong>«А»</strong> или <strong>«И.»</strong></span>
            </li>
          </ul>
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Пример:</span> Иванов Иван Иванович
          </div>
        </div>

        <div className="px-6 pb-5">
          <Button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white">
            Понял, исправлю
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NameErrorModal;
