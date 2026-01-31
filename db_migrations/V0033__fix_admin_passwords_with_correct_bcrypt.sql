-- Обновление пароля администратора Pioneer78 с правильным bcrypt хешом для Tytparol1!
UPDATE admins 
SET password_hash = '$2b$12$gOq33SSVpxRvvD.xxdcz0.wQSjSIBI3b50rFF1mX/B0u9T6HwRHaa'
WHERE login = 'Pioneer78';

-- Обновление пароля администратора komarova.eg с правильным bcrypt хешом для Tytparol2026
UPDATE admins 
SET password_hash = '$2b$12$XIKEnxghzJNkBbNYO3W9/OmvmtTS.t1pbygPLLOCR0NQ4Q9Td1HTO'
WHERE login = 'komarova.eg';