const express = require('express');
const router = express.Router();

/**
 * Helper: basic allocation simulation on backend
 */
function runBasicAllocation(students, rooms) {
  const allocations = [];
  const unallocated = [];
  let studentIndex = 0;

  for (const room of rooms) {
    const totalRoomSeats = room.rows * room.columns;
    let seatIndex = 0;

    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.columns; c++) {
        if (studentIndex < students.length) {
          const student = students[studentIndex];
          const rowChar = String.fromCharCode(65 + r);
          const colNum = c + 1;
          
          allocations.push({
            studentId: student.id,
            student: student,
            roomId: room.id,
            roomName: room.roomName,
            seatRow: r,
            seatColumn: c,
            seatLabel: `${rowChar}${colNum}`,
            hasConflict: false
          });
          studentIndex++;
          seatIndex++;
        }
      }
    }
  }

  while (studentIndex < students.length) {
    unallocated.push(students[studentIndex]);
    studentIndex++;
  }

  return {
    allocations,
    unallocated,
    totalAllocated: allocations.length,
    totalUnallocated: unallocated.length
  };
}

// POST /api/allocate - Run allocation
router.post('/', (req, res) => {
  const { students = [], rooms = [], examDetails = {} } = req.body;

  if (!students.length || !rooms.length) {
    return res.status(400).json({
      success: false,
      message: 'Both students and rooms arrays are required for allocation'
    });
  }

  const result = runBasicAllocation(students, rooms);

  res.json({
    success: true,
    message: 'Allocation processed successfully by backend',
    timestamp: new Date().toISOString(),
    examDetails,
    data: result
  });
});

module.exports = router;
