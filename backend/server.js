import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import evidenceRoutes from './src/routes/evidenceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const envCorsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...envCorsOrigins,
].filter(Boolean);

app.use(helmet());
app.disable('x-powered-by');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.pages.dev')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: '1mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Keep-alive health check endpoint for external uptime services (e.g. Render spin-up keepalive)
app.get(['/', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'NodeGuard Digital Forensics API',
  });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/evidence', evidenceRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred.'
      : err.message || 'An error occurred processing the request.';
  return res.status(status).json({ success: false, message });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[NodeGuard] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[NodeGuard Server Error] Startup failed: ${error.message}`);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;