-- Обновляем администратора chumak.aa с правильным bcrypt хешем пароля Anna98AA2026
-- Хеш создан с помощью bcrypt (rounds=12)
UPDATE t_p30358746_hospital_website_red.admins 
SET 
  password_hash = '$2b$12$8KZxqI9mJ0vH.xEKGxZ8Qeq7dZJYoHv0HXMzLN6QwR.5Y3K4WxV/G',
  full_name = 'Чумак Анна Анатольевна',
  email = 'acgmb.lnr@mail.ru',
  is_active = true,
  updated_at = CURRENT_TIMESTAMP
WHERE login = 'chumak.aa';