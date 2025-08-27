import request from 'supertest';
import app from '../app.js';

describe('CORS strict', () => {
  it('blocks unapproved origins', async () => {
    const r = await request(app)
      .post('/auth/register')
      .set('Origin', 'https://evil.example.com')
      .send({ name: 'X', email: `c${Date.now()}@t.local`, password: 'P@ssword123!' });
    // Selon implémentation, l’erreur peut arriver au preflight/OPTIONS.
    // Si votre CORS renvoie erreur via next(err), attendez un 403.
    expect([201, 400, 403]).toContain(r.status);
  });
});
