import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import evidenceRoutes from './src/routes/evidenceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'NodeGuard Digital Forensics API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/evidence', evidenceRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 400;
  return res.status(status).json({
    success: false,
    message: err.message || 'An error occurred processing the request.',
  });
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
