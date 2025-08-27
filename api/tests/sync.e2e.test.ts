import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Sync', () => {
  it('syncs a full dive payload transactionally', async () => {
    const { token } = await registerAndLogin();

    const payload = {
      dive: {
        date: new Date().toISOString(),
        duration: 50,
        depth_max: 22,
        average_depth: 14,
        buddy_name: 'Bob',
        entry_type: 'shore',
      },
      measurements: [
        { timestamp: new Date().toISOString(), depth_current: 5, temperature: 19, ascent_speed: 0.1, air_pressure: 1, cumulative_ascent: 0 },
        { timestamp: new Date(Date.now() + 1000).toISOString(), depth_current: 10, temperature: 19, ascent_speed: 0.2, air_pressure: 1, cumulative_ascent: 0.1 },
      ],
      alerts: [
        { code: 'ASCENT_TOO_FAST', message: 'Slow', severity: 'HIGH', acknowledged: false, timestamp: new Date().toISOString() },
      ],
      compass: [
        { timestamp: new Date().toISOString(), heading: 45 },
        { timestamp: new Date(Date.now() + 1000).toISOString(), heading: 90 },
      ],
      weather: { surface_temperature: 22, wind_speed: 3, wave_height: 0.2, visibility_surface: 10, description: 'calm' },
      equipment: { wetsuit_thickness: 5, tank_size: 12, tank_pressure_start: 200, tank_pressure_end: 70, weights_used: 4 },
      media: [
        { media_type: 'image', url: 'https://example.com/img.jpg', description: 'reef', timestamp_taken: new Date().toISOString() },
      ],
    };

    const res = await request(app).post('/sync/dive').set(auth(token)).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('dive_id');
  });
});
