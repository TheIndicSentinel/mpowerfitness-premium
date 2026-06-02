const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/* ── Environment validation ───────────────────────────────────────── */
const REQUIRED_ENV = ['JWT_SECRET'];
const WARN_ENV     = ['UPI_ID', 'UPI_NAME', 'FRONTEND_URL'];

(function validateEnv() {
  const missing = REQUIRED_ENV.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`\n❌ FATAL: Missing required environment variables:\n  ${missing.join('\n  ')}\n`);
    console.error('  Create a .env file based on .env.example and set these values.\n');
    process.exit(1);
  }
  const warned = WARN_ENV.filter(k => !process.env[k]);
  if (warned.length) {
    console.warn(`\n⚠️  Missing recommended env vars (using defaults):\n  ${warned.join(', ')}\n`);
  }
})();

const { sequelize } = require('./models/index');
const { connectRedis } = require('./config/redis');
const { socketHandler } = require('./utils/socketHandler');

const authRoutes          = require('./routes/auth');
const adminRoutes         = require('./routes/admin');
const bookingsRouter      = require('./routes/bookings');
const chatRouter          = require('./routes/chat');
const workoutsRouter      = require('./routes/workouts');
const progressRouter      = require('./routes/progress');
const paymentsRouterUPI   = require('./routes/payments');
const usersRouter         = require('./routes/users');
const trainersRouter      = require('./routes/trainers');
const notificationsRouter = require('./routes/notifications');
const nutritionRouter     = require('./routes/nutrition');
const programsRouter      = require('./routes/programs');
const blogsRouter         = require('./routes/blogs');
const communityRouter     = require('./routes/community');
const consultationRouter  = require('./routes/consultation');

['avatars','workouts','progress'].forEach(dir => {
  const p = path.join(__dirname, '../uploads', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
// Render (and most PaaS) put the app behind a single reverse proxy that sets
// X-Forwarded-For. Trust exactly one hop so express-rate-limit can read the
// real client IP without throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1);
const httpServer = createServer(app);

/* ── CORS allow-list ───────────────────────────────────────────────
   FRONTEND_URL may be a comma-separated list (apex + www + onrender URL).
   In production we also transparently allow any *.onrender.com origin so a
   freshly deployed/renamed Render static site is never blocked even if the
   env var lags behind. In development everything is allowed.            */
const explicitOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;                       // same-origin / curl / mobile apps
  if (process.env.NODE_ENV !== 'production') return true;
  const clean = origin.replace(/\/$/, '');
  if (explicitOrigins.includes(clean)) return true;
  try {
    const host = new URL(clean).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.endsWith('.onrender.com')) return true; // any Render preview/prod URL
  } catch (_) {}
  return false;
};

// CORS origin callback used by both Express and Socket.IO
const corsOrigin = (origin, cb) =>
  isOriginAllowed(origin) ? cb(null, true) : cb(null, false);

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET','POST'], credentials: true }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: corsOrigin, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','Accept'] }));
app.options('*', cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 30 }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('io', io);
socketHandler(io);

/* ── DB readiness gate ─────────────────────────────────────────────
   While the database is still waking up (free-tier cold start), return a
   friendly 503 for data routes instead of a confusing 500. The frontend
   can detect this and show a "warming up, retry shortly" message. Health,
   root and static asset routes are exempt so monitoring still works.    */
app.use('/api', (req, res, next) => {
  const isReady = app.get('dbReady') && app.get('dbReady')();
  if (isReady) return next();
  // Allow auth refresh + health-style probes through to fail fast naturally
  return res.status(503).json({
    success: false,
    code: 'DB_WARMING_UP',
    message: 'Server is starting up. Please try again in a few seconds.',
  });
});

app.get('/', (req, res) => res.json({ 
  message: 'Welcome to Mpower Fitness API', 
  status: 'Ready', 
  apiVersion: '2.1.0', 
  documentation: '/health' 
}));

app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/users',         usersRouter);
app.use('/api/trainers',      trainersRouter);
app.use('/api/bookings',      bookingsRouter);
app.use('/api/payments',      paymentsRouterUPI);
app.use('/api/workouts',      workoutsRouter);
app.use('/api/progress',      progressRouter);
app.use('/api/programs',      programsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/nutrition',     nutritionRouter);
app.use('/api/chat',          chatRouter);
app.use('/api/blogs',         blogsRouter);
app.use('/api/community',     communityRouter);
app.use('/api/consultations', consultationRouter);

app.get('/health', (req, res) => res.json({
  status: 'healthy',
  service: 'Mpower Fitness API',
  version: '2.1.0',
  db: sequelize.getDialect(),
  dbReady: app.get('dbReady') ? app.get('dbReady')() : false,
  env: process.env.NODE_ENV
}));

/* ── 404 handler ──────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success:false, message:`Route ${req.method} ${req.path} not found` });
});

/* ── Global error handler ─────────────────────────────────────────── */
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status  = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  // Log server errors; suppress expected client errors in production
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.stack || err);
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`[WARN]  ${req.method} ${req.path} → ${status}: ${message}`);
  }

  // Never leak stack traces to clients in production
  const body = { success:false, message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack.split('\n').slice(0, 5);
  }

  res.status(status).json(body);
});

/* ── DB readiness flag — routes can check this to give graceful errors ── */
let dbReady = false;
app.set('dbReady', () => dbReady);

/* Connect + sync the database with retries. On a free-tier Postgres the
   instance can take 30-60s to wake from cold; we must NOT crash the web
   service while we wait — the HTTP server is already listening so health
   checks pass and the site loads. */
const initDatabase = async (attempt = 1) => {
  const MAX_ATTEMPTS = 10;
  try {
    await sequelize.authenticate();
    // alter adds new columns without dropping existing data
    await sequelize.sync({ alter: true });
    dbReady = true;
    console.log(`✅ Database ready (${sequelize.getDialect()})`);

    // Seed is idempotent — each resource guarded by an exists() check
    try {
      const { seed } = require('./utils/seeder');
      await seed();
    } catch (seedErr) {
      console.warn('⚠️  Seeder skipped:', seedErr.message);
    }
  } catch (err) {
    console.warn(`⚠️  DB connect attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`);
    if (attempt < MAX_ATTEMPTS) {
      const delay = Math.min(2000 * attempt, 15000); // backoff, capped at 15s
      setTimeout(() => initDatabase(attempt + 1), delay);
    } else {
      console.error('❌ Database unreachable after retries — API will keep serving and retry on demand.');
      // Keep trying slowly in the background so the service self-heals
      setTimeout(() => initDatabase(1), 60000);
    }
  }
};

const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  // 1. Bind the port FIRST so Render's health check and the frontend can reach
  //    the API immediately, even before the database has finished waking up.
  httpServer.listen(PORT, () => console.log(`🚀 API → http://localhost:${PORT}`));
  // 2. Connect Redis (optional — no-ops if REDIS_URL unset) and the database
  //    in the background. Neither blocks the server from accepting requests.
  connectRedis().catch(() => {});
  initDatabase();
};

if (require.main === module) startServer();
else initDatabase().catch(e => console.warn('DB init:', e.message));

module.exports = { app, io, startServer };
