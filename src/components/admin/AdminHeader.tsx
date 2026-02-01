import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Shield" size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Панель администратора</h1>
        </div>
        <div className="flex gap-2">
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

export default AdminHeader;
