import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import pool,{ query } from "../db/pool"

// Option: exécuter les migrations si besoin (ou utiliser npm run test:migrate avant jest)
beforeAll(async () => {
  // S’assurer que la connexion fonctionne
  await query('SELECT 1');
});

afterEach(async () => {
  // Nettoyage entre tests (ordre n’a pas d’importance avec CASCADE)
  await query('TRUNCATE "BatteryStatus","Media","Equipment","WeatherConditions","Compass","DecompressionStop","Alert","Measurement","Dive","Device","SurfaceInterval" RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
