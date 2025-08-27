import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Dives CRUD', () => {
  it('creates, lists, gets, patches and deletes a dive', async () => {
    const { token } = await registerAndLogin();

    // Create dive
    const create = await request(app)
      .post('/dives')
      .set(auth(token))
      .send({
        date: new Date().toISOString(),
        duration: 42,
        depth_max: 18.5,
        average_depth: 12.3,
        buddy_name: 'Alice',
      });
    expect(create.status).toBe(201);
    const diveId = create.body.dive_id;

    // List dives
    const list = await request(app).get('/dives').set(auth(token));
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);

    // Get dive
    const getOne = await request(app).get(`/dives/${diveId}`).set(auth(token));
    expect(getOne.status).toBe(200);
    expect(getOne.body.dive_id).toBe(diveId);

    // Patch dive
    const patch = await request(app)
      .patch(`/dives/${diveId}`)
      .set(auth(token))
      .send({ ndl_limit: 25 });
    expect(patch.status).toBe(200);
    expect(patch.body.ndl_limit).toBe(25);

    // Delete dive
    const del = await request(app).delete(`/dives/${diveId}`).set(auth(token));
    expect(del.status).toBe(204);
  });
});
