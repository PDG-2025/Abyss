DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entry_kind') THEN
    CREATE TYPE entry_kind AS ENUM ('shore','boat','pool','other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'water_kind') THEN
    CREATE TYPE water_kind AS ENUM ('salt','fresh','brackish','unknown');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_kind') THEN
    CREATE TYPE media_kind AS ENUM ('image','video');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    CREATE TYPE alert_severity AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
  END IF;
END$$;

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Device" (
  device_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  serial_number VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  firmware_version VARCHAR(50) NOT NULL,
  UNIQUE (user_id, serial_number)
);

CREATE TABLE IF NOT EXISTS "BatteryStatus" (
  battery_id SERIAL PRIMARY KEY,
  device_id INT NOT NULL REFERENCES "Device"(device_id) ON DELETE CASCADE,
  percentage INT NOT NULL,
  status_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_battery_pct CHECK (percentage BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS "Location" (
  location_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  water_type water_kind NOT NULL DEFAULT 'unknown',
  certification_required VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS "Gas" (
  gas_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  oxygen REAL NOT NULL DEFAULT 21.0,
  nitrogen REAL NOT NULL DEFAULT 79.0,
  helium REAL NOT NULL DEFAULT 0.0,
  CONSTRAINT chk_gas_bounds CHECK (
    oxygen >= 0 AND nitrogen >= 0 AND helium >= 0
    AND oxygen <= 100 AND nitrogen <= 100 AND helium <= 100
  ),
  CONSTRAINT chk_gas_sum CHECK (ROUND((oxygen + nitrogen + helium)::numeric,2) = 100.00)
);

CREATE TABLE IF NOT EXISTS "Dive" (
  dive_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  device_id INT REFERENCES "Device"(device_id) ON DELETE SET NULL,
  location_id INT REFERENCES "Location"(location_id) ON DELETE SET NULL,
  gas_id INT REFERENCES "Gas"(gas_id) ON DELETE SET NULL,
  buddy_name VARCHAR(100),
  dive_purpose VARCHAR(100),
  entry_type entry_kind DEFAULT 'other',
  certification_level VARCHAR(100),
  visibility_underwater REAL,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INT NOT NULL,
  depth_max REAL NOT NULL,
  average_depth REAL NOT NULL,
  ndl_limit INT,
  CONSTRAINT chk_dive_nonneg CHECK (
    duration >= 0 AND depth_max >= 0 AND average_depth >= 0
    AND (ndl_limit IS NULL OR ndl_limit >= 0)
  )
);

CREATE TABLE IF NOT EXISTS "Measurement" (
  measurement_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  depth_current REAL NOT NULL,
  temperature REAL,
  ascent_speed REAL,
  air_pressure REAL,
  cumulative_ascent REAL,
  CONSTRAINT chk_meas_nonneg CHECK (
    depth_current >= 0
    AND (ascent_speed IS NULL OR ascent_speed >= 0)
    AND (air_pressure IS NULL OR air_pressure >= 0)
    AND (cumulative_ascent IS NULL OR cumulative_ascent >= 0)
  )
);

CREATE TABLE IF NOT EXISTS "Alert" (
  alert_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  message VARCHAR(255),
  severity alert_severity NOT NULL DEFAULT 'LOW',
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "DecompressionStop" (
  stop_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  depth REAL NOT NULL,
  duration INT NOT NULL,
  CONSTRAINT chk_stop_nonneg CHECK (depth >= 0 AND duration >= 0)
);

CREATE TABLE IF NOT EXISTS "Compass" (
  compass_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  heading REAL NOT NULL,
  CONSTRAINT chk_heading CHECK (heading >= 0 AND heading < 360)
);

CREATE TABLE IF NOT EXISTS "SurfaceInterval" (
  interval_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  previous_dive_id INT REFERENCES "Dive"(dive_id) ON DELETE SET NULL,
  interval_duration INT NOT NULL,
  CONSTRAINT chk_interval_nonneg CHECK (interval_duration >= 0)
);

CREATE TABLE IF NOT EXISTS "WeatherConditions" (
  weather_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  surface_temperature REAL,
  wind_speed REAL,
  wave_height REAL,
  visibility_surface REAL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "Equipment" (
  equipment_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  wetsuit_thickness REAL,
  tank_size REAL,
  tank_pressure_start REAL,
  tank_pressure_end REAL,
  weights_used REAL,
  CONSTRAINT chk_tank_pressures CHECK (
    (tank_pressure_start IS NULL OR tank_pressure_start >= 0)
    AND (tank_pressure_end IS NULL OR tank_pressure_end >= 0)
  )
);

CREATE TABLE IF NOT EXISTS "Media" (
  media_id SERIAL PRIMARY KEY,
  dive_id INT NOT NULL REFERENCES "Dive"(dive_id) ON DELETE CASCADE,
  media_type media_kind NOT NULL,
  url VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  timestamp_taken TIMESTAMP WITH TIME ZONE,
  uploaded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexation (performances requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_device_user ON "Device"(user_id);
CREATE INDEX IF NOT EXISTS idx_battery_device_date ON "BatteryStatus"(device_id, status_date DESC);

CREATE INDEX IF NOT EXISTS idx_dive_user_date ON "Dive"(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_dive_location ON "Dive"(location_id);
CREATE INDEX IF NOT EXISTS idx_dive_gas ON "Dive"(gas_id);

CREATE INDEX IF NOT EXISTS idx_meas_dive_time ON "Measurement"(dive_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_alert_dive_time ON "Alert"(dive_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_compass_dive_time ON "Compass"(dive_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_weather_dive ON "WeatherConditions"(dive_id);
CREATE INDEX IF NOT EXISTS idx_equip_dive ON "Equipment"(dive_id);
CREATE INDEX IF NOT EXISTS idx_media_dive ON "Media"(dive_id);
CREATE INDEX IF NOT EXISTS idx_surface_user_prev ON "SurfaceInterval"(user_id, previous_dive_id);

-- Vues
CREATE OR REPLACE VIEW vw_dive_summary AS
SELECT
  d.dive_id,
  d.user_id,
  d.date,
  d.duration,
  d.depth_max,
  d.average_depth,
  d.ndl_limit,
  l.name AS location_name,
  g.name AS gas_name
FROM "Dive" d
LEFT JOIN "Location" l ON l.location_id = d.location_id
LEFT JOIN "Gas" g ON g.gas_id = d.gas_id;

CREATE OR REPLACE VIEW vw_device_last_battery AS
SELECT b.device_id, b.percentage, b.status_date
FROM "BatteryStatus" b
JOIN (
  SELECT device_id, MAX(status_date) AS max_date
  FROM "BatteryStatus"
  GROUP BY device_id
) last ON last.device_id = b.device_id AND last.max_date = b.status_date;

-- Triggers de cohérence
CREATE OR REPLACE FUNCTION trg_check_dive_depths() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.average_depth > NEW.depth_max THEN
    RAISE EXCEPTION 'average_depth (%) cannot exceed depth_max (%)', NEW.average_depth, NEW.depth_max;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_dive_depths ON "Dive";
CREATE TRIGGER check_dive_depths
BEFORE INSERT OR UPDATE ON "Dive"
FOR EACH ROW
EXECUTE FUNCTION trg_check_dive_depths();