import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RegistrarHeaderProps {
  registrarInfo: any;
  onOpenInstruction: () => void;
  onLogout: () => void;
}

const RegistrarHeader = ({ registrarInfo, onOpenInstruction, onLogout }: RegistrarHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="UserCheck" size={32} className="text-primary" />
          <div>
            <h1 className="text-xl font-bold">{registrarInfo?.full_name}</h1>
            <p className="text-sm text-muted-foreground">{registrarInfo?.clinic}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={onOpenInstruction}
          >
            <Icon name="BookOpen" size={18} className="mr-2" />
            Инструкция
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

export default RegistrarHeader;
