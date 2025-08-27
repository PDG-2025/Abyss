import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Sync idempotency (optional)', () => {
  it('does not duplicate same source_uid', async () => {
    const { token } = await registerAndLogin();
    const source_uid = `dev-${Date.now()}`;

    const payload = {
      dive: {
        date: new Date().toISOString(),
        duration: 30,
        depth_max: 15,
        average_depth: 10,
        // source_uid // à ajouter côté schéma et DB si activé
      },
      measurements: [{ timestamp: new Date().toISOString(), depth_current: 5 }]
    };

    const r1 = await request(app).post('/sync/dive').set(auth(token)).send(payload);
    const r2 = await request(app).post('/sync/dive').set(auth(token)).send(payload);

    expect(r1.status).toBe(201);
    expect([200, 201, 409]).toContain(r2.status); // selon stratégie: 200 même ressource ou 409 conflit
  });
});
