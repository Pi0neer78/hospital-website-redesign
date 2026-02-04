import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface SecurityLoginProps {
  login: string;
  password: string;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SecurityLogin = ({ login, password, onLoginChange, onPasswordChange, onSubmit }: SecurityLoginProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            Панель безопасности
          </CardTitle>
          <CardDescription>
            Введите пароль для доступа к статистике
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Логин"
                value={login}
                onChange={(e) => onLoginChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль администратора"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} className="text-muted-foreground" />
              </Button>
            </div>
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityLogin;