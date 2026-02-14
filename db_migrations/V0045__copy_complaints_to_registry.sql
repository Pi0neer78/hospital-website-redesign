INSERT INTO t_p30358746_hospital_website_red.reest_phone_max 
  (full_name, phone, email, source_type, complaint_date)
SELECT DISTINCT ON (c.phone)
  TRIM(c.name),
  c.phone,
  c.email,
  'complaint',
  c.created_at
FROM t_p30358746_hospital_website_red.complaints c
WHERE c.phone IS NOT NULL AND c.phone != ''
  AND NOT EXISTS (
    SELECT 1 FROM t_p30358746_hospital_website_red.reest_phone_max r 
    WHERE r.phone = c.phone
  )
ORDER BY c.phone, c.created_at DESC;