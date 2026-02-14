
INSERT INTO t_p30358746_hospital_website_red.reest_phone_max 
  (full_name, phone, email, source_type, appointment_date)
SELECT DISTINCT ON (patient_phone)
  TRIM(patient_name),
  patient_phone,
  NULL,
  'appointment',
  created_at
FROM t_p30358746_hospital_website_red.appointments_v2
WHERE created_by = 1
  AND patient_phone IS NOT NULL
  AND patient_phone != ''
  AND NOT EXISTS (
    SELECT 1 FROM t_p30358746_hospital_website_red.reest_phone_max r 
    WHERE r.phone = appointments_v2.patient_phone
  )
ORDER BY patient_phone, created_at DESC;
