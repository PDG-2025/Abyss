export type User = {
  user_id: number;
  name: string;
  email: string;
};

export type Device = {
  device_id: number;
  user_id: number;
  serial_number: string;
  model: string;
  firmware_version: string;
};

export type Dive = {
  dive_id: number;
  user_id: number;
  device_id?: number | null;
  location_id?: number | null;
  gas_id?: number | null;
  buddy_name?: string | null;
  dive_purpose?: string | null;
  entry_type?: 'shore' | 'boat' | 'pool' | 'other' | null;
  certification_level?: string | null;
  visibility_underwater?: number | null;
  notes?: string | null;
  date: string; // ISO
  duration: number;
  depth_max: number;
  average_depth: number;
  ndl_limit?: number | null;
};

export type Measurement = {
  measurement_id?: number;
  dive_id: number;
  timestamp: string;
  depth_current: number;
  temperature?: number | null;
  ascent_speed?: number | null;
  air_pressure?: number | null;
  cumulative_ascent?: number | null;
};

export type Alert = {
  alert_id?: number;
  dive_id: number;
  code: string;
  message?: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
  timestamp: string;
};

export type CompassSample = {
  compass_id?: number;
  dive_id: number;
  timestamp: string;
  heading: number;
};

export type WeatherConditions = {
  weather_id?: number;
  dive_id: number;
  surface_temperature?: number | null;
  wind_speed?: number | null;
  wave_height?: number | null;
  visibility_surface?: number | null;
  description?: string | null;
};

export type Equipment = {
  equipment_id?: number;
  dive_id: number;
  wetsuit_thickness?: number | null;
  tank_size?: number | null;
  tank_pressure_start?: number | null;
  tank_pressure_end?: number | null;
  weights_used?: number | null;
};

export type Media = {
  media_id?: number;
  dive_id: number;
  media_type: 'image' | 'video';
  url: string;
  description?: string | null;
  timestamp_taken?: string | null;
  uploaded_date?: string | null;
};

export type Paged<T> = { page: number; limit: number; data: T[] };
