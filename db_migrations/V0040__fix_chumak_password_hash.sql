-- Обновляем пароль для администратора chumak.aa
-- Пароль: Anna98AA2026
-- Хеш сгенерирован через bcrypt (rounds=12)
UPDATE t_p30358746_hospital_website_red.admins 
SET 
  password_hash = '$2b$12$z30pDbZUhYWXeRJbUElpUeuZlaSfbJD8isw.oSoKoXrfCVJYzYnfa',
  updated_at = CURRENT_TIMESTAMP
WHERE login = 'chumak.aa';