const path = require('path');
const fs = require('fs');

// ✅ Auto detect .env location
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log("✅ .env loaded from:", envPath);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error("❌ .env file NOT found");
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const expenseRoutes = require('./routes/expense.routes');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ Debug ENV
console.log("🔍 ENV Check:");
console.log("  DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("  JWT_SECRET exists:  ", !!process.env.JWT_SECRET);
console.log("  PORT:               ", process.env.PORT);

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not set');
  process.exit(1);
}

// ✅ Add this BEFORE routes to log every request
app.use((req, res, next) => {
  console.log(`📍 Incoming: ${req.method} ${req.url}`);
  console.log(`📦 Body:`, req.body);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/expenses', expenseRoutes);

app.get('/ping', (req, res) => {
  res.json({
    message: '✅ Server is running',
    routes: [
      'POST /auth/signup',
      'POST /auth/login',
      'GET /vehicles',
      'POST /vehicles',
      'PATCH /vehicles/:id/status',
      'GET /drivers',
      'POST /drivers',
      'PATCH /drivers/:id/status',
      'GET /trips',
      'POST /trips',
      'PATCH /trips/:id/status',
      'GET /maintenance',
      'POST /maintenance',
      'PATCH /maintenance/:id/status',
      'GET /expenses',
      'POST /expenses',
      'DELETE /expenses/:id',
    ],
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

// ✅ Handle Port In Use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`👉 Run: taskkill /F /IM node.exe`);
    process.exit(1);
  }
});
