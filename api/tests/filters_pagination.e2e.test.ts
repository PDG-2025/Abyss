import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Filters & pagination', () => {
  it('filters dives by date and paginates', async () => {
    const { token } = await registerAndLogin();
    for (let i = 0; i < 5; i++) {
      await request(app).post('/dives').set(auth(token)).send({
        date: new Date(Date.now() - i * 86400000).toISOString(),
        duration: 30,
        depth_max: 18,
        average_depth: 12
      });
    }
    const from = new Date(Date.now() - 2 * 86400000).toISOString();
    const list = await request(app).get(`/dives?from=${encodeURIComponent(from)}&page=1&limit=2`).set(auth(token));
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeLessThanOrEqual(2);
  });
});
