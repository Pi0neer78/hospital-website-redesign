CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.visitor_counter (
  id SERIAL PRIMARY KEY,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(visit_date)
);

INSERT INTO t_p30358746_hospital_website_red.visitor_counter (visit_date, count)
VALUES (CURRENT_DATE, 0)
ON CONFLICT (visit_date) DO NOTHING;
