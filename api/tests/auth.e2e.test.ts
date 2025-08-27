import request from 'supertest';
import app from '../app.js';

describe('Auth', () => {
  it('registers and logins', async () => {
    const email = `e${Date.now()}@test.local`;
    const password = 'P@ssword123!';
    const r = await request(app).post('/auth/register').send({ name: 'User', email, password });
    expect(r.status).toBe(201);
    expect(r.body).toHaveProperty('token');
    const l = await request(app).post('/auth/login').send({ email, password });
    expect(l.status).toBe(200);
    expect(l.body).toHaveProperty('token');
  });

  it('prevents duplicate email', async () => {
    const email = `dup${Date.now()}@test.local`;
    await request(app).post('/auth/register').send({ name: 'Dup', email, password: 'P@ssword123!' });
    const r = await request(app).post('/auth/register').send({ name: 'Dup2', email, password: 'P@ssword123!' });
    expect(r.status).toBe(409);
  });
});
