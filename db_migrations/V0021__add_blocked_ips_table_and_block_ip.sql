-- Создание таблицы для блокировки IP-адресов
CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.blocked_ips (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    blocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMP NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocked_ips_ip ON t_p30358746_hospital_website_red.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_until ON t_p30358746_hospital_website_red.blocked_ips(blocked_until);

-- Добавление записи о блокировке IP 158.160.16.200 на 24 часа
INSERT INTO t_p30358746_hospital_website_red.blocked_ips (ip_address, blocked_until, reason)
VALUES ('158.160.16.200', NOW() + INTERVAL '24 hours', 'Заблокирован администратором')
ON CONFLICT (ip_address) 
DO UPDATE SET 
    blocked_until = NOW() + INTERVAL '24 hours',
    blocked_at = NOW(),
    reason = 'Заблокирован администратором';