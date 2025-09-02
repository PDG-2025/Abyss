import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Ownership & permissions', () => {
  it('prevents accessing another user dive', async () => {
    const a = await registerAndLogin();
    const b = await registerAndLogin();

    const diveA = await request(app).post('/dives').set(auth(a.token))
      .send({ date: new Date().toISOString(), duration: 20, depth_max: 15, average_depth: 10 });

    const getByB = await request(app).get(`/dives/${diveA.body.dive_id}`).set(auth(b.token));
    expect(getByB.status).toBe(404);
    
    const delByB = await request(app).delete(`/dives/${diveA.body.dive_id}`).set(auth(b.token));
    expect(delByB.status).toBe(404);
  });

  it('prevents battery post on another user device', async () => {
    const a = await registerAndLogin();
    const b = await registerAndLogin();

    const deviceA = await request(app).post('/devices').set(auth(a.token))
      .send({ serial_number: 'SN-OWN', model: 'M1', firmware_version: '1.0' });

    const batteryByB = await request(app).post(`/devices/${deviceA.body[0].device_id}/battery`)
      .set(auth(b.token)).send({ percentage: 80 });
    expect(batteryByB.status).toBe(404);
  });
});
