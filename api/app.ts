import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import morgan from 'morgan';

import { limiterGlobal, limiterAuth, limiterSync } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import deviceRoutes from './routes/devices';
import diveRoutes from './routes/dives';
import measurementRoutes from './routes/measurements';
import alertRoutes from './routes/alerts';
import compassRoutes from './routes/compass';
import mediaRoutes from './routes/media';
import weatherRoutes from './routes/weather';
import equipmentRoutes from './routes/equipment';
import gasRoutes from './routes/gas';
import locationRoutes from './routes/locations';
import surfaceRoutes from './routes/surfaceIntervals';
import syncRoutes from './routes/sync';

const app = express();

// CORS strict avec whitelist
const ALLOWED_ORIGINS = [process.env.MOBILE_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean) as string[];
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) return next();
  const err: any = new Error('CORS blocked');
  return next(err);
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS blocked'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: false,
}));

// Sécurité + perf
app.use(helmet());

app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

// Rate limit global
app.use(limiterGlobal);

// Branches routes avec limiters ciblés
app.use('/auth', limiterAuth, authRoutes);
app.use('/sync', limiterSync, syncRoutes);

// Autres routes
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/dives', diveRoutes);
app.use('/measurements', measurementRoutes);
app.use('/alerts', alertRoutes);
app.use('/compass', compassRoutes);
app.use('/media', mediaRoutes);
app.use('/weather', weatherRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/gas', gasRoutes);
app.use('/locations', locationRoutes);
app.use('/surface-intervals', surfaceRoutes);

// Gestionnaire d’erreurs global
app.use(errorHandler);

export default app;
