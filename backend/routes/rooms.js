const express = require('express');
const router = express.Router();
const { mockRooms } = require('../data/mockData');

// In-memory working copy for dummy backend simulation
let rooms = [...mockRooms];

// GET /api/rooms - Get all rooms
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: rooms.length,
    data: rooms
  });
});

// GET /api/rooms/:id - Get single room
router.get('/:id', (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.json({ success: true, data: room });
});

// POST /api/rooms - Add room
router.post('/', (req, res) => {
  const { roomName, rows, columns, benchType, description } = req.body;
  
  if (!roomName || !rows || !columns) {
    return res.status(400).json({
      success: false,
      message: 'roomName, rows, and columns are required'
    });
  }

  const numRows = parseInt(rows, 10);
  const numCols = parseInt(columns, 10);
  const type = benchType || 'single';
  const capacity = type === 'double' ? numRows * numCols * 2 : numRows * numCols;

  const newRoom = {
    id: `room_${Date.now()}`,
    roomName,
    rows: numRows,
    columns: numCols,
    capacity,
    benchType: type,
    description: description || ''
  };

  rooms.push(newRoom);

  res.status(201).json({
    success: true,
    message: 'Room created successfully (dummy backend)',
    data: newRoom
  });
});

// PUT /api/rooms/:id - Update room
router.put('/:id', (req, res) => {
  const index = rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    const updated = { id: req.params.id, ...req.body };
    return res.json({
      success: true,
      message: 'Room updated successfully (simulated)',
      data: updated
    });
  }

  const rows = req.body.rows ? parseInt(req.body.rows, 10) : rooms[index].rows;
  const columns = req.body.columns ? parseInt(req.body.columns, 10) : rooms[index].columns;
  const benchType = req.body.benchType || rooms[index].benchType;
  const capacity = benchType === 'double' ? rows * columns * 2 : rows * columns;

  rooms[index] = {
    ...rooms[index],
    ...req.body,
    rows,
    columns,
    benchType,
    capacity
  };

  res.json({
    success: true,
    message: 'Room updated successfully',
    data: rooms[index]
  });
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', (req, res) => {
  rooms = rooms.filter(r => r.id !== req.params.id);
  res.json({
    success: true,
    message: 'Room deleted successfully',
    deletedId: req.params.id
  });
});

module.exports = router;
