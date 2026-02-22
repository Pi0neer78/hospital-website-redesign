-- Добавляем колонку source если не существует
ALTER TABLE t_p30358746_hospital_website_red.reest_phone_max
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'self';

-- Обновляем существующие записи: source_type='appointment' -> source='self'
UPDATE t_p30358746_hospital_website_red.reest_phone_max
  SET source = CASE 
    WHEN source_type = 'complaint' THEN 'complaint'
    ELSE 'self'
  END
WHERE source = 'self';

COMMENT ON COLUMN t_p30358746_hospital_website_red.reest_phone_max.source IS 'self=самостоятельно, doctor=врач, registrar=регистратор, complaint=жалоба';