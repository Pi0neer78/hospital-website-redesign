-- Шаг 1: Вставляем уникальных пациентов из appointments_v2
-- Берём последнюю запись на пациента (по номеру телефона), учитываем created_by
INSERT INTO t_p30358746_hospital_website_red.reest_phone_max
  (full_name, phone, source_type, source, appointment_date, created_at, updated_at)
SELECT DISTINCT ON (patient_phone)
  patient_name,
  patient_phone,
  CASE created_by
    WHEN 1 THEN 'self'
    WHEN 2 THEN 'doctor'
    WHEN 3 THEN 'registrar'
    ELSE 'self'
  END,
  CASE created_by
    WHEN 1 THEN 'self'
    WHEN 2 THEN 'doctor'
    WHEN 3 THEN 'registrar'
    ELSE 'self'
  END,
  created_at,
  created_at,
  NOW()
FROM t_p30358746_hospital_website_red.appointments_v2
WHERE patient_phone IS NOT NULL AND patient_phone <> ''
ORDER BY patient_phone, created_at DESC;

-- Шаг 2: Из жалоб — добавляем тех, кого ещё нет по телефону; если есть — обновляем complaint_date
-- Сначала обновляем существующих
UPDATE t_p30358746_hospital_website_red.reest_phone_max r
SET
  complaint_date = c.created_at,
  updated_at = NOW()
FROM (
  SELECT DISTINCT ON (phone) phone, name, email, created_at
  FROM t_p30358746_hospital_website_red.complaints
  WHERE phone IS NOT NULL AND phone <> ''
  ORDER BY phone, created_at DESC
) c
WHERE r.phone = c.phone;

-- Затем вставляем тех, кого нет по телефону
INSERT INTO t_p30358746_hospital_website_red.reest_phone_max
  (full_name, phone, email, source_type, source, complaint_date, created_at, updated_at)
SELECT DISTINCT ON (c.phone)
  c.name,
  c.phone,
  c.email,
  'complaint',
  'complaint',
  c.created_at,
  c.created_at,
  NOW()
FROM t_p30358746_hospital_website_red.complaints c
WHERE c.phone IS NOT NULL AND c.phone <> ''
  AND NOT EXISTS (
    SELECT 1 FROM t_p30358746_hospital_website_red.reest_phone_max r
    WHERE r.phone = c.phone
  )
ORDER BY c.phone, c.created_at DESC;

-- Шаг 3: Из жалоб без телефона, но с email — добавляем по email
INSERT INTO t_p30358746_hospital_website_red.reest_phone_max
  (full_name, phone, email, source_type, source, complaint_date, created_at, updated_at)
SELECT DISTINCT ON (c.email)
  c.name,
  NULL,
  c.email,
  'complaint',
  'complaint',
  c.created_at,
  c.created_at,
  NOW()
FROM t_p30358746_hospital_website_red.complaints c
WHERE (c.phone IS NULL OR c.phone = '')
  AND c.email IS NOT NULL AND c.email <> ''
  AND NOT EXISTS (
    SELECT 1 FROM t_p30358746_hospital_website_red.reest_phone_max r
    WHERE r.email = c.email
  )
ORDER BY c.email, c.created_at DESC;