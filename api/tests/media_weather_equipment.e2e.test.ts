import request from 'supertest';
import app from '../app.js';
import { registerAndLogin, auth } from './utils';

describe('Media, Weather, Equipment', () => {
  it('upserts weather and equipment; manages media list', async () => {
    const { token } = await registerAndLogin();
    const c = await request(app).post('/dives').set(auth(token))
      .send({ date: new Date().toISOString(), duration: 25, depth_max: 12, average_depth: 8 });
    const id = c.body.dive_id;
   
    // Weather upsert
    const w1 = await request(app).put(`/weather/dives/${id}/weather`).set(auth(token))
      .send({ surface_temperature: 20, description: 'ok' });
    expect(w1.status).toBe(200);
    const w2 = await request(app).get(`/weather/dives/${id}/weather`).set(auth(token));
    expect(w2.status).toBe(200);
    const wDel = await request(app).delete(`/weather/dives/${id}/weather`).set(auth(token));
    expect(wDel.status).toBe(204);

    // Equipment upsert
    const e1 = await request(app).put(`/equipment/dives/${id}/equipment`).set(auth(token))
      .send({ wetsuit_thickness: 5, tank_size: 12, tank_pressure_start: 200, tank_pressure_end: 70, weights_used: 4 });
    expect(e1.status).toBe(200);
    const e2 = await request(app).get(`/equipment/dives/${id}/equipment`).set(auth(token));
    expect(e2.status).toBe(200);
    const eDel = await request(app).delete(`/equipment/dives/${id}/equipment`).set(auth(token));
    expect(eDel.status).toBe(204);

    // Media
    const m1 = await request(app).post(`/media/dives/${id}/media`).set(auth(token))
      .send({ media_type: 'image', url: 'https://example.com/a.jpg', description: 'reef' });
    expect(m1.status).toBe(201);
    const mList = await request(app).get(`/media/dives/${id}/media?page=1&limit=10`).set(auth(token));
    expect(mList.status).toBe(200);
    const mediaId = m1.body.media_id;
    const mDel = await request(app).delete(`/media/${mediaId}`).set(auth(token));
    expect(mDel.status).toBe(204);
  });
});
