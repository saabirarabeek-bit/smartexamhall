// ============================================================================
// NOTE: This is a dummy backend for demo purposes. Real data persistence
// happens in the browser via localStorage. These endpoints simulate a real API
// contract only.
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/students');
const roomRoutes = require('./routes/rooms');
const allocationRoutes = require('./routes/allocation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for demo visibility
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// REST API Routes (Simulated contracts)
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocate', allocationRoutes);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Examination Hall Seat Allocation System Dummy API is running',
    version: '1.0.0',
    documentation: {
      students: '/api/students (GET, POST, PUT, DELETE)',
      rooms: '/api/rooms (GET, POST, PUT, DELETE)',
      allocate: '/api/allocate (POST)'
    },
    disclaimer: 'Data is simulated in-memory. Persistent storage is client-side via localStorage.'
  });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for root or client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Examination Hall Seat Allocator API Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend UI available at: http://localhost:${PORT}`);
  console.log(`⚙️  Simulated REST endpoints live at: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
