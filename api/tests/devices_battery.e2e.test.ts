import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Devices & Battery', () => {
  it('creates device, logs battery, lists device dives', async () => {
    const { token } = await registerAndLogin();
    const d = await request(app).post('/devices').set(auth(token))
      .send({ serial_number: 'SN-X1', model: 'Abyss', firmware_version: '1.0' });
    expect(d.status).toBe(201);
    const id_device = d.body[0].device_id
    const b = await request(app).post(`/devices/${id_device}/battery`).set(auth(token))
      .send({ percentage: 90 });
    expect(b.status).toBe(201);

    const cDive = await request(app).post('/dives').set(auth(token))
      .send({ device_id: id_device, date: new Date().toISOString(), duration: 30, depth_max: 18, average_depth: 12 });
    expect(cDive.status).toBe(201);

    const listByDevice = await request(app).get(`/devices/${id_device}/dives?page=1&limit=5`).set(auth(token));
    expect(listByDevice.status).toBe(200);
    expect(Array.isArray(listByDevice.body.data)).toBe(true);
  });
});
