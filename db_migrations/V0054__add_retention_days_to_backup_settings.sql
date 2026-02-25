ALTER TABLE "t_p30358746_hospital_website_red".backup_settings
ADD COLUMN IF NOT EXISTS retention_days INTEGER NOT NULL DEFAULT 0;