import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('SQL constraints & triggers', () => {
  it('rejects gas with bad sum (100 required)', async () => {
    const { token } = await registerAndLogin();
    const r = await request(app).post('/gas')
      .set(auth(token))
      .send({ name: 'BAD', oxygen: 50, nitrogen: 30, helium: 30 });
    expect([400, 409, 500]).toContain(r.status);
  });

  it('enforces trigger average_depth <= depth_max at DB level on patch', async () => {
    const { token } = await registerAndLogin();
    const c = await request(app).post('/dives').set(auth(token))
      .send({ date: new Date().toISOString(), duration: 10, depth_max: 15, average_depth: 10 });
    const p = await request(app).patch(`/dives/${c.body.dive_id}`).set(auth(token))
      .send({ average_depth: 20 }); // dépasse depth_max
    // Attendu: 400 ou 500 selon mapping d’erreur
    expect([400, 500]).toContain(p.status);
  });
});
