import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

async function createDive(token: string) {
  const r = await request(app).post('/dives').set(auth(token)).send({
    date: new Date().toISOString(),
    duration: 60,
    depth_max: 20,
    average_depth: 12,
  });

  return r.body.dive_id as number;
}

describe('Bulk endpoints', () => {
  it('inserts measurements/alerts/compass in bulk', async () => {
    const { token } = await registerAndLogin();
    const diveId = await createDive(token);

    // Measurements
    const measPayload = Array.from({ length: 10 }).map((_, i) => ({
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      depth_current: 10 + i * 0.1,
      temperature: 18.5,
      ascent_speed: 0.2,
      air_pressure: 1.0,
      cumulative_ascent: i * 0.05,
    }));
    const meas = await request(app).post(`/measurements/bulk/${diveId}`).set(auth(token)).send(measPayload);
    expect(meas.status).toBe(201);
    expect(meas.body.inserted).toBe(10);

    // Alerts
    const alertsPayload = [
      { code: 'ASCENT_TOO_FAST', message: 'Slow down', severity: 'HIGH', timestamp: new Date().toISOString() },
      { code: 'NDL_EXCEEDED', message: 'Decompression required', severity: 'CRITICAL', timestamp: new Date().toISOString() },
    ];
    const alerts = await request(app).post(`/alerts/bulk/${diveId}`).set(auth(token)).send(alertsPayload);
    expect(alerts.status).toBe(201);
    expect(alerts.body.inserted).toBe(2);

    // Compass
    const compassPayload = Array.from({ length: 5 }).map((_, i) => ({
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      heading: (i * 45) % 360,
    }));
    const comp = await request(app).post(`/compass/bulk/${diveId}`).set(auth(token)).send(compassPayload);
    expect(comp.status).toBe(201);
    expect(comp.body.inserted).toBe(5);
  });
});
