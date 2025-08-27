import request from 'supertest';
import app from '../app.js';

export async function registerAndLogin() {
  const email = `u${Date.now()}@test.local`;
  const password = 'P@ssword123!';
  await request(app).post('/auth/register').send({ name: 'Test', email, password });
  const res = await request(app).post('/auth/login').send({ email, password });
  return { token: res.body.token, user: res.body.user };
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export default app;
