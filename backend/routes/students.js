const express = require('express');
const router = express.Router();
const { mockStudents } = require('../data/mockData');

// In-memory working copy for dummy backend simulation
let students = [...mockStudents];

// GET /api/students - Get all students
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: students.length,
    data: students
  });
});

// GET /api/students/:id - Get single student
router.get('/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// POST /api/students - Add student (echoes back created student with fake ID)
router.post('/', (req, res) => {
  const { rollNumber, name, className, section, subjectCode } = req.body;
  
  if (!rollNumber || !name || !className) {
    return res.status(400).json({
      success: false,
      message: 'rollNumber, name, and className are required'
    });
  }

  const newStudent = {
    id: `stu_${Date.now()}`,
    rollNumber,
    name,
    className,
    section: section || 'A',
    subjectCode: subjectCode || 'GEN101'
  };

  students.push(newStudent);

  res.status(201).json({
    success: true,
    message: 'Student created successfully (dummy backend)',
    data: newStudent
  });
});

// PUT /api/students/:id - Update student
router.put('/:id', (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    // If not found in-memory, still return simulated updated object
    const updated = { id: req.params.id, ...req.body };
    return res.json({
      success: true,
      message: 'Student updated successfully (simulated)',
      data: updated
    });
  }

  students[index] = { ...students[index], ...req.body };
  res.json({
    success: true,
    message: 'Student updated successfully',
    data: students[index]
  });
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', (req, res) => {
  students = students.filter(s => s.id !== req.params.id);
  res.json({
    success: true,
    message: 'Student deleted successfully',
    deletedId: req.params.id
  });
});

module.exports = router;
