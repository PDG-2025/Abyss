/* scripts/seed-api.ts */
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const EMAIL = process.env.SEED_USER_EMAIL || `seed.${Date.now()}@test.local`;
const PASSWORD = process.env.SEED_USER_PASSWORD || "P@ssword123!";

type Token = string;

function client(token?: Token) {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 15000,
    validateStatus: () => true,
  });
}

// --- Auth ---
async function registerOrLogin(): Promise<{ token: Token; user: any }> {
  const anon = client();
  const r = await anon.post("/auth/register", {
    name: "Seed User",
    email: EMAIL,
    password: PASSWORD,
  });
  if (r.status !== 201 && r.status !== 409)
    throw new Error(`Register failed: ${r.status} ${JSON.stringify(r.data)}`);

  const l = await anon.post("/auth/login", {
    email: EMAIL,
    password: PASSWORD,
  });
  if (l.status !== 200)
    throw new Error(`Login failed: ${l.status} ${JSON.stringify(l.data)}`);
  return { token: l.data.token, user: l.data.user };
}

// --- Device ---
async function createDevice(token: Token) {
  const c = client(token);
  const res = await c.post("/devices", {
    serial_number: `SN-${Date.now()}`,
    model: "Abyss-One",
    firmware_version: "1.0.0",
  });
  if (res.status !== 201)
    throw new Error(
      `Create device failed: ${res.status} ${JSON.stringify(res.data)}`
    );
  return res.data;
}

// --- Gas presets ---
async function ensureGasPresets(token: Token) {
  const c = client(token);
  const presets = [
    { name: "AIR", oxygen: 21, nitrogen: 79, helium: 0 },
    { name: "EAN32", oxygen: 32, nitrogen: 68, helium: 0 },
    { name: "EAN36", oxygen: 36, nitrogen: 64, helium: 0 },
  ];
  for (const g of presets) {
    await c.post("/gas", g);
  }
  const list = await c.get("/gas");
  const byName: Record<string, any> = {};
  for (const g of list.data) byName[g.name] = g;
  return byName;
}

// --- Locations ---
async function createLocations(token: Token) {
  const c = client(token);
  const locs = [
    {
      name: "Lac Léman - Rivaz",
      latitude: 46.472,
      longitude: 6.775,
      water_type: "fresh",
      certification_required: "Open Water",
    },
    {
      name: "Méditerranée - Carry-le-Rouet",
      latitude: 43.33,
      longitude: 5.15,
      water_type: "salt",
      certification_required: "Open Water",
    },
  ];
  const out: any[] = [];
  for (const l of locs) {
    const res = await c.post("/locations", l);
    out.push(res.data);
  }
  return out;
}

// --- Génération profil plongée ---
function genDiveProfile(start: Date, depthMax: number, points = 100) {
  const arr: any[] = [];
  for (let i = 0; i < points; i++) {
    // Profondeur simulée : descente, palier, remontée
    const t = i / (points - 1);
    let depth: number;
    if (t < 0.4) depth = depthMax * (t / 0.4); // descente
    else if (t < 0.8) depth = depthMax; // palier
    else depth = depthMax * ((1 - t) / 0.2); // remontée
    arr.push({
      timestamp: new Date(start.getTime() + i * 1000).toISOString(),
      depth_current: Math.max(0, depth),
      temperature: 18 + Math.cos(i / 50),
      ascent_speed: 0.1 + Math.random() * 0.2,
      air_pressure: 1.0,
      cumulative_ascent: i * 0.05,
    });
  }
  return arr;
}

function genCompass(start: Date, count = 20, stepMs = 2000) {
  return Array.from({ length: count }).map((_, i) => ({
    timestamp: new Date(start.getTime() + i * stepMs).toISOString(),
    heading: (i * 18) % 360,
  }));
}

function genAlerts(start: Date) {
  return [
    {
      code: "ASCENT_TOO_FAST",
      message: "Slow down",
      severity: "HIGH",
      acknowledged: false,
      timestamp: new Date(start.getTime() + 30000).toISOString(),
    },
    {
      code: "NDL_EXCEEDED",
      message: "Decompression required",
      severity: "CRITICAL",
      acknowledged: false,
      timestamp: new Date(start.getTime() + 60000).toISOString(),
    },
  ];
}

// --- Créer une plongée et tout le bulk ---
async function createDiveWithData(
  token: Token,
  device_id: number,
  location_id: number,
  gas_id: number,
  depthMax: number,
  start: Date
) {
  const c = client(token);
  const divePayload = {
    device_id,
    location_id,
    gas_id,
    buddy_name: "Bob",
    entry_type: "shore",
    date: start.toISOString(),
    duration: 60,
    depth_max: depthMax,
    average_depth: depthMax * 0.7,
    ndl_limit: 30,
    dive_purpose: "Training",
    certification_level: "Open Water",
  };
  // Créer dive
  const dive = await c.post("/dives", divePayload);
  const diveId = dive.data.dive_id;

  // Bulk mesures
  await c.post(`/measurements/bulk/${diveId}`, genDiveProfile(start, depthMax));
  await c.post(`/compass/bulk/${diveId}`, genCompass(start, 30, 2000));
  await c.post(`/alerts/bulk/${diveId}`, genAlerts(start));

  // Ajouter météo
  await c.put(`/weather/dives/${diveId}/weather`, {
    surface_temperature: 20 + Math.random() * 5,
    wind_speed: 1 + Math.random() * 3,
    wave_height: 0.1 + Math.random(),
    visibility_surface: 8 + Math.random() * 2,
    description: "Calm",
  });

  // Ajouter équipement
  await c.put(`/equipment/dives/${diveId}/equipment`, {
    wetsuit_thickness: 5,
    tank_size: 12,
    tank_pressure_start: 200,
    tank_pressure_end: 70,
    weights_used: 4,
  });

  return diveId;
}

// --- Main ---
async function main() {
  const { token } = await registerOrLogin();
  const device = await createDevice(token);
  const gasByName = await ensureGasPresets(token);
  const locations = await createLocations(token);

  console.log("Seeding multiple dives...");

  const startTime = new Date(Date.now() - 3600_000);
  const dives = [];
  for (let i = 0; i < 5; i++) {
    const diveStart = new Date(startTime.getTime() + i * 2 * 3600_000); // toutes les 2h
    const depthMax = 10 + Math.random() * 20; // profondeur entre 10 et 30m
    const diveId = await createDiveWithData(
      token,
      device.device_id,
      locations[i % locations.length].location_id,
      gasByName.AIR.gas_id,
      depthMax,
      diveStart
    );
    dives.push(diveId);
    console.log(`Dive ${diveId} created with max depth ${depthMax.toFixed(2)}m`);
  }

  console.log("Seeding complete for dives:", dives);
}

main().catch((e) => {
  console.error("Seed failed:", e?.response?.status, e?.response?.data || e);
  process.exit(1);
});
