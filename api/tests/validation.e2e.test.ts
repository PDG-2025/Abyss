import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Validation & Zod errors', () => {
  it('rejects invalid email on register', async () => {
    const r = await request(app).post('/auth/register').send({ name: 'X', email: 'bad-email', password: 'P@ssword123!' });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Validation error');
    expect(r.body.details).toBeDefined();
  });

  it('rejects dive where average_depth > depth_max (Zod)', async () => {
    const { token } = await registerAndLogin();
    const r = await request(app)
      .post('/dives')
      .set(auth(token))
      .send({ date: new Date().toISOString(), duration: 40, depth_max: 10, average_depth: 12 });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Validation error');
  });

  it('rejects bulk measurements with negative depth (Zod)', async () => {
    const { token } = await registerAndLogin();
    const create = await request(app)
      .post('/dives').set(auth(token))
      .send({ date: new Date().toISOString(), duration: 30, depth_max: 12, average_depth: 10 });
    const diveId = create.body.dive_id;
    const r = await request(app).post(`/measurements/bulk/${diveId}`).set(auth(token)).send([
      { timestamp: new Date().toISOString(), depth_current: -1 }
    ]);
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Validation error');
  });
});
