import { create } from 'zustand';

export type DistanceUnit = 'm' | 'ft';
export type PressureUnit = 'bar' | 'psi';
export type TempUnit = 'C' | 'F';
export type VolumeUnit = 'L' | 'cuft';
export type WeightUnit = 'kg' | 'lb';

type SettingsState = {
  distance: DistanceUnit;
  pressure: PressureUnit;
  temperature: TempUnit;
  volume: VolumeUnit;
  weight: WeightUnit;
  timezone: string;
  setDistance: (v: DistanceUnit) => void;
  setPressure: (v: PressureUnit) => void;
  setTemperature: (v: TempUnit) => void;
  setVolume: (v: VolumeUnit) => void;
  setWeight: (v: WeightUnit) => void;
  setTimezone: (tz: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  distance: 'm',
  pressure: 'bar',
  temperature: 'C',
  volume: 'L',
  weight: 'kg',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  setDistance: (v) => set({ distance: v }),
  setPressure: (v) => set({ pressure: v }),
  setTemperature: (v) => set({ temperature: v }),
  setVolume: (v) => set({ volume: v }),
  setWeight: (v) => set({ weight: v }),
  setTimezone: (tz) => set({ timezone: tz }),
}));
