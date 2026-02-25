ALTER TABLE "t_p30358746_hospital_website_red".backup_records
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]';