/**
 * AllocationEngine - Smart Examination Hall Seat Allocation Algorithm
 * 
 * Objectives:
 * 1. Distribute students across designated halls according to room capacity.
 * 2. Prevent malpractice by avoiding adjacent seating (front, back, left, right,
 *    and shared bench partners) of students from the same class, section, or subject.
 * 3. Maximize diversity through multi-way round-robin interleaving and serpentine grid fill.
 * 4. Gracefully fallback with conflict flagging if cohort diversity is mathematically insufficient.
 */

const AllocationEngine = {
  /**
   * Main entry point for seat allocation
   * @param {Array} students - Array of student objects {id, rollNumber, name, className, section, subjectCode}
   * @param {Array} rooms - Array of room objects {id, roomName, rows, columns, capacity, benchType}
   * @param {Object} options - Custom options { prioritizeSubject: true, strictDoubleBench: true }
   * @returns {Object} Comprehensive allocation report
   */
  allocateSeats(students = [], rooms = [], options = {}) {
    console.log(`[AllocationEngine] Starting allocation for ${students.length} students across ${rooms.length} rooms`);

    // STEP 1: Validation and Capacity Calculations
    if (!students || students.length === 0) {
      throw new Error('No students provided for seat allocation.');
    }
    if (!rooms || rooms.length === 0) {
      throw new Error('No rooms selected for seat allocation.');
    }

    // Clone to avoid mutating original source arrays
    const studentPool = JSON.parse(JSON.stringify(students));
    const activeRooms = JSON.parse(JSON.stringify(rooms));

    // Calculate total seating capacity
    const totalCapacity = activeRooms.reduce((sum, r) => sum + (r.capacity || (r.rows * r.columns)), 0);
    const isOverflow = studentPool.length > totalCapacity;
    const overflowCount = isOverflow ? studentPool.length - totalCapacity : 0;

    // Separate students that fit within capacity vs overflow
    const eligibleStudents = isOverflow ? studentPool.slice(0, totalCapacity) : studentPool;
    const unallocatedStudents = isOverflow ? studentPool.slice(totalCapacity) : [];

    // STEP 2: Balanced Distribution of Diverse Cohorts Across Selected Rooms
    // We want each room to receive an even mix of all departments/subjects rather than putting
    // all Computer Science in Room 1 and all IT in Room 2.
    const roomQueues = this._partitionStudentsProportionally(eligibleStudents, activeRooms);

    // STEP 3: Grid Placement per Room
    const allAllocations = [];
    const roomGrids = {};
    const roomStats = {};
    let totalConflicts = 0;

    for (const room of activeRooms) {
      const roomStudents = roomQueues[room.id] || [];
      const numRows = room.rows;
      const numCols = room.columns;
      const isDoubleBench = room.benchType === 'double';

      // 2D grid representation initialized to null
      const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));

      // Interleave students for this room using maximum diversity round-robin
      const interleavedQueue = this._interleaveByDiversity(roomStudents);

      let roomConflictCount = 0;
      let roomAllocatedCount = 0;

      // STEP 4: Serpentine (Zig-zag) Grid Fill
      // Row 0: 0 -> cols-1 (left to right)
      // Row 1: cols-1 -> 0 (right to left)
      // This increases the physical seat distance between consecutive items across row boundaries.
      for (let r = 0; r < numRows; r++) {
        const isReversed = r % 2 === 1;
        const colIndices = isReversed
          ? Array.from({ length: numCols }, (_, i) => numCols - 1 - i)
          : Array.from({ length: numCols }, (_, i) => i);

        for (const c of colIndices) {
          if (interleavedQueue.length === 0) {
            break; // No more students to place in this room
          }

          // STEP 5: Adjacency Check & Lookahead Candidate Swapping
          // Find the best candidate from the queue who does not conflict with adjacent neighbors
          const placementResult = this._findBestCandidate(
            interleavedQueue,
            grid,
            r,
            c,
            numRows,
            numCols,
            isDoubleBench
          );

          const studentToPlace = placementResult.student;
          const hasConflict = placementResult.hasConflict;
          const conflictReasons = placementResult.reasons;

          if (hasConflict) {
            roomConflictCount++;
            totalConflicts++;
          }

          // Format human-friendly seat coordinate (e.g. Row A, Col 1 => A1)
          const rowLetter = String.fromCharCode(65 + r);
          const colNumber = c + 1;
          const seatLabel = `${rowLetter}${colNumber}`;
          
          // Bench label for double sharing (Bench 1-A, 1-B, etc.)
          const benchIndex = Math.floor(c / (isDoubleBench ? 2 : 1)) + 1;
          const benchSlot = isDoubleBench ? (c % 2 === 0 ? 'Left' : 'Right') : 'Single';

          const allocationRecord = {
            studentId: studentToPlace.id,
            student: studentToPlace,
            roomId: room.id,
            roomName: room.roomName,
            seatRow: r,
            seatColumn: c,
            seatLabel: seatLabel,
            benchIndex: benchIndex,
            benchSlot: benchSlot,
            hasConflict: hasConflict,
            conflictReason: conflictReasons.join('; ')
          };

          // Place into grid and master allocation list
          grid[r][c] = allocationRecord;
          allAllocations.push(allocationRecord);
          roomAllocatedCount++;
        }
      }

      roomGrids[room.id] = grid;
      roomStats[room.id] = {
        roomId: room.id,
        roomName: room.roomName,
        capacity: room.capacity || (numRows * numCols),
        allocated: roomAllocatedCount,
        vacant: (room.capacity || (numRows * numCols)) - roomAllocatedCount,
        conflicts: roomConflictCount
      };
    }

    console.log(`[AllocationEngine] Allocation completed: ${allAllocations.length} allocated, ${unallocatedStudents.length} unallocated, ${totalConflicts} conflicts`);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      allocations: allAllocations,
      unallocated: unallocatedStudents,
      roomGrids: roomGrids,
      roomStats: roomStats,
      summary: {
        totalStudents: students.length,
        totalCapacity: totalCapacity,
        totalAllocated: allAllocations.length,
        totalUnallocated: unallocatedStudents.length,
        totalConflicts: totalConflicts,
        roomCount: activeRooms.length,
        conflictRate: allAllocations.length > 0 ? ((totalConflicts / allAllocations.length) * 100).toFixed(1) : 0
      }
    };
  },

  /**
   * Proportionally distribute a diverse mix of students across rooms
   * Ensures each room receives a representative blend of all classes.
   */
  _partitionStudentsProportionally(students, rooms) {
    const roomQueues = {};
    rooms.forEach(r => { roomQueues[r.id] = []; });

    // Group students by composite key (class + subject)
    const groups = {};
    for (const s of students) {
      const key = `${s.className || 'General'}__${s.subjectCode || 'GEN'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }

    // Distribute from each group across rooms based on room capacity ratio
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || (r.rows * r.columns)), 0);

    for (const key of Object.keys(groups)) {
      const groupStudents = groups[key];
      let studentIdx = 0;

      // Assign to each room proportionally
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const roomCap = room.capacity || (room.rows * room.columns);
        const quota = Math.round((roomCap / totalCapacity) * groupStudents.length);
        
        const countToTake = (i === rooms.length - 1)
          ? groupStudents.length - studentIdx // Give remainder to last room
          : Math.min(quota, groupStudents.length - studentIdx);

        for (let k = 0; k < countToTake && studentIdx < groupStudents.length; k++) {
          roomQueues[room.id].push(groupStudents[studentIdx]);
          studentIdx++;
        }
      }
    }

    return roomQueues;
  },

  /**
   * Interleave students by maximum diversity (Multi-way round robin)
   * Groups by class/subject, then pulls one by one from the largest groups.
   */
  _interleaveByDiversity(students) {
    if (students.length <= 1) return [...students];

    // Group students by class and subject
    const groupsMap = new Map();
    for (const student of students) {
      const groupKey = `${student.className || ''}__${student.subjectCode || ''}`;
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey).push(student);
    }

    // Convert to array of group arrays
    const groups = Array.from(groupsMap.values());
    const interleaved = [];
    let lastKey = null;

    while (groups.some(g => g.length > 0)) {
      // Sort groups by remaining count descending
      groups.sort((a, b) => b.length - a.length);

      // Try to pick from a group different from the immediately preceding one
      let chosenGroupIndex = -1;
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].length > 0) {
          const candidateKey = `${groups[i][0].className}__${groups[i][0].subjectCode}`;
          if (candidateKey !== lastKey || groups.filter(g => g.length > 0).length === 1) {
            chosenGroupIndex = i;
            break;
          }
        }
      }

      if (chosenGroupIndex === -1) {
        // Fallback to the first non-empty group
        chosenGroupIndex = groups.findIndex(g => g.length > 0);
      }

      const pickedStudent = groups[chosenGroupIndex].shift();
      interleaved.push(pickedStudent);
      lastKey = `${pickedStudent.className}__${pickedStudent.subjectCode}`;
    }

    return interleaved;
  },

  /**
   * Evaluates the 4-way orthogonal neighbors (and double-bench partner) for conflict.
   * Returns a conflict score and reasons list.
   */
  _checkAdjacencyConflict(student, grid, r, c, numRows, numCols, isDoubleBench) {
    const reasons = [];

    // Orthogonal neighbors: Left, Right, Front (row-1), Back (row+1)
    const directions = [
      { name: 'Front', dr: -1, dc: 0 },
      { name: 'Back', dr: 1, dc: 0 },
      { name: 'Left', dr: 0, dc: -1 },
      { name: 'Right', dr: 0, dc: 1 }
    ];

    for (const dir of directions) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;

      if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
        const neighborSeat = grid[nr][nc];
        if (neighborSeat && neighborSeat.student) {
          const neighbor = neighborSeat.student;

          // Check same class / department
          if (student.className && neighbor.className && student.className === neighbor.className) {
            reasons.push(`Same class (${student.className}) with ${dir.name} seat ${neighborSeat.seatLabel} (${neighbor.rollNumber})`);
          }
          // Check same subject
          else if (student.subjectCode && neighbor.subjectCode && student.subjectCode === neighbor.subjectCode) {
            reasons.push(`Same subject (${student.subjectCode}) with ${dir.name} seat ${neighborSeat.seatLabel}`);
          }
        }
      }
    }

    // Special check for double-bench: adjacent partner on same table
    if (isDoubleBench) {
      // Benches are pairs: (0, 1), (2, 3), (4, 5)...
      const partnerCol = (c % 2 === 0) ? c + 1 : c - 1;
      if (partnerCol >= 0 && partnerCol < numCols) {
        const partnerSeat = grid[r][partnerCol];
        if (partnerSeat && partnerSeat.student) {
          const partner = partnerSeat.student;
          if (student.className === partner.className) {
            reasons.push(`Bench partner ${partnerSeat.seatLabel} has identical class (${student.className})`);
          }
        }
      }
    }

    return {
      hasConflict: reasons.length > 0,
      reasons: reasons
    };
  },

  /**
   * Find best candidate from the queue using lookahead swapping to avoid adjacency violations.
   */
  _findBestCandidate(queue, grid, r, c, numRows, numCols, isDoubleBench) {
    // 1. Try immediate front candidate
    const firstCandidate = queue[0];
    const initialCheck = this._checkAdjacencyConflict(firstCandidate, grid, r, c, numRows, numCols, isDoubleBench);
    
    if (!initialCheck.hasConflict) {
      // Ideal match!
      return {
        student: queue.shift(),
        hasConflict: false,
        reasons: []
      };
    }

    // 2. Lookahead search: scan down the queue for the first student with 0 conflicts
    for (let i = 1; i < queue.length; i++) {
      const candidate = queue[i];
      const check = this._checkAdjacencyConflict(candidate, grid, r, c, numRows, numCols, isDoubleBench);

      if (!check.hasConflict) {
        // Swap candidate to this seat and remove from queue
        const [selectedStudent] = queue.splice(i, 1);
        return {
          student: selectedStudent,
          hasConflict: false,
          reasons: []
        };
      }
    }

    // 3. Graceful fallback: if no 100% clean candidate exists (e.g. cohort has 90% students from same class),
    // pick candidate with fewest conflict reasons
    let bestIndex = 0;
    let minReasonsCount = initialCheck.reasons.length;
    let bestReasons = initialCheck.reasons;

    for (let i = 1; i < Math.min(queue.length, 25); i++) {
      const check = this._checkAdjacencyConflict(queue[i], grid, r, c, numRows, numCols, isDoubleBench);
      if (check.reasons.length < minReasonsCount) {
        minReasonsCount = check.reasons.length;
        bestIndex = i;
        bestReasons = check.reasons;
      }
    }

    const [fallbackStudent] = queue.splice(bestIndex, 1);
    return {
      student: fallbackStudent,
      hasConflict: true,
      reasons: bestReasons
    };
  }
};

window.AllocationEngine = AllocationEngine;
