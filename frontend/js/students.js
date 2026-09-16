/**
 * Students Management Logic
 * Handles CRUD operations, search/filter, bulk CSV/JSON import, and modals.
 */

let allStudents = [];
let studentToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  setupEventListeners();
});

function setupEventListeners() {
  // Search and filter inputs
  const searchInput = document.getElementById('student-search');
  const classFilter = document.getElementById('class-filter');
  const subjectFilter = document.getElementById('subject-filter');

  if (searchInput) searchInput.addEventListener('input', filterStudents);
  if (classFilter) classFilter.addEventListener('change', filterStudents);
  if (subjectFilter) subjectFilter.addEventListener('change', filterStudents);

  // Student Form submission (Add / Edit)
  const studentForm = document.getElementById('student-form');
  if (studentForm) {
    studentForm.addEventListener('submit', handleStudentFormSubmit);
  }

  // Bulk Import Form submission
  const bulkForm = document.getElementById('bulk-import-form');
  if (bulkForm) {
    bulkForm.addEventListener('submit', handleBulkImportSubmit);
  }
}

/**
 * Load students from StorageService with simulated API delay for realism
 */
async function loadStudents() {
  showLoadingSpinner(true);
  try {
    // Demonstrates calling ApiService with local fallback
    const res = await ApiService.getStudents();
    allStudents = res.data || StorageService.getAll('students');

    populateFilterDropdowns();
    renderStudentTable(allStudents);
  } catch (err) {
    console.error('Failed to load students:', err);
    allStudents = StorageService.getAll('students');
    renderStudentTable(allStudents);
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Populate dynamic class and subject options in filter dropdowns
 */
function populateFilterDropdowns() {
  const classFilter = document.getElementById('class-filter');
  const subjectFilter = document.getElementById('subject-filter');
  if (!classFilter || !subjectFilter) return;

  const classes = [...new Set(allStudents.map(s => s.className).filter(Boolean))].sort();
  const subjects = [...new Set(allStudents.map(s => s.subjectCode).filter(Boolean))].sort();

  classFilter.innerHTML = '<option value="">All Departments / Classes</option>' +
    classes.map(c => `<option value="${c}">${c}</option>`).join('');

  subjectFilter.innerHTML = '<option value="">All Subject Codes</option>' +
    subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

/**
 * Render students into data table
 */
function renderStudentTable(students) {
  const tbody = document.getElementById('students-table-body');
  const countSpan = document.getElementById('student-count-badge');
  if (countSpan) countSpan.textContent = `${students.length} Students`;
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No students found matching your search or filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s, idx) => {
    const badgeClass = getDeptBadgeClass(s.className);
    return `
      <tr>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>
        <td>
          <span class="font-mono" style="font-weight: 700; color: #fff;">${escapeHtml(s.rollNumber)}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(s.name)}</div>
        </td>
        <td>
          <span class="badge ${badgeClass}">${escapeHtml(s.className)}</span>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--text-secondary);">Sec ${escapeHtml(s.section || 'A')}</span>
        </td>
        <td>
          <span class="seat-subject-pill">${escapeHtml(s.subjectCode || 'N/A')}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="openEditStudentModal('${s.id}')" title="Edit Student">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${s.id}', '${escapeHtml(s.name)}')" title="Delete Student">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter students based on query inputs
 */
function filterStudents() {
  const query = (document.getElementById('student-search')?.value || '').trim().toLowerCase();
  const selectedClass = document.getElementById('class-filter')?.value || '';
  const selectedSubject = document.getElementById('subject-filter')?.value || '';

  const filtered = allStudents.filter(s => {
    const matchesQuery = !query ||
      s.rollNumber.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query);
    const matchesClass = !selectedClass || s.className === selectedClass;
    const matchesSubject = !selectedSubject || s.subjectCode === selectedSubject;
    return matchesQuery && matchesClass && matchesSubject;
  });

  renderStudentTable(filtered);
}

/**
 * Modal Handling: Add New Student
 */
function openAddStudentModal() {
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  document.getElementById('student-id').value = '';
  document.getElementById('student-roll').value = '';
  document.getElementById('student-name').value = '';
  document.getElementById('student-class').value = 'B.Tech CSE';
  document.getElementById('student-section').value = 'A';
  document.getElementById('student-subject').value = 'CS301';

  document.getElementById('student-modal-overlay').classList.add('active');
}

/**
 * Modal Handling: Edit Student
 */
function openEditStudentModal(id) {
  const student = allStudents.find(s => String(s.id) === String(id));
  if (!student) return;

  document.getElementById('student-modal-title').textContent = 'Edit Student';
  document.getElementById('student-id').value = student.id;
  document.getElementById('student-roll').value = student.rollNumber;
  document.getElementById('student-name').value = student.name;
  document.getElementById('student-class').value = student.className;
  document.getElementById('student-section').value = student.section || 'A';
  document.getElementById('student-subject').value = student.subjectCode || '';

  document.getElementById('student-modal-overlay').classList.add('active');
}

function closeStudentModal() {
  document.getElementById('student-modal-overlay').classList.remove('active');
}

/**
 * Handle Add/Edit Form submission
 */
async function handleStudentFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('student-id').value;
  const studentData = {
    rollNumber: document.getElementById('student-roll').value.trim().toUpperCase(),
    name: document.getElementById('student-name').value.trim(),
    className: document.getElementById('student-class').value.trim(),
    section: document.getElementById('student-section').value.trim().toUpperCase() || 'A',
    subjectCode: document.getElementById('student-subject').value.trim().toUpperCase()
  };

  if (!studentData.rollNumber || !studentData.name) {
    showToast('Please fill in Roll Number and Student Name.', 'error');
    return;
  }

  showLoadingSpinner(true);
  try {
    if (id) {
      // Update
      StorageService.update('students', id, studentData);
      await ApiService.updateStudent(id, studentData);
      showToast(`Student ${studentData.rollNumber} updated successfully!`, 'success');
    } else {
      // Check duplicate roll
      const duplicate = allStudents.some(s => s.rollNumber.toUpperCase() === studentData.rollNumber);
      if (duplicate) {
        showToast(`Roll number "${studentData.rollNumber}" already exists!`, 'error');
        showLoadingSpinner(false);
        return;
      }

      StorageService.create('students', studentData);
      await ApiService.createStudent(studentData);
      showToast(`Student ${studentData.rollNumber} added successfully!`, 'success');
    }

    closeStudentModal();
    await loadStudents();
  } catch (err) {
    showToast(`Error saving student: ${err.message}`, 'error');
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Delete Confirmation
 */
function openDeleteModal(id, studentName) {
  studentToDeleteId = id;
  document.getElementById('delete-student-name').textContent = studentName;
  document.getElementById('delete-modal-overlay').classList.add('active');
}

function closeDeleteModal() {
  studentToDeleteId = null;
  document.getElementById('delete-modal-overlay').classList.remove('active');
}

async function confirmDeleteStudent() {
  if (!studentToDeleteId) return;

  showLoadingSpinner(true);
  try {
    StorageService.remove('students', studentToDeleteId);
    await ApiService.deleteStudent(studentToDeleteId);
    showToast('Student deleted successfully.', 'info');
    closeDeleteModal();
    await loadStudents();
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Bulk Import Modal
 */
function openBulkImportModal() {
  document.getElementById('bulk-import-text').value = '';
  document.getElementById('bulk-modal-overlay').classList.add('active');
}

function closeBulkImportModal() {
  document.getElementById('bulk-modal-overlay').classList.remove('active');
}

/**
 * Process Bulk Import (Supports CSV lines or JSON array)
 */
async function handleBulkImportSubmit(e) {
  e.preventDefault();
  const rawText = document.getElementById('bulk-import-text').value.trim();
  if (!rawText) {
    showToast('Please paste CSV or JSON data to import.', 'error');
    return;
  }

  const parsedStudents = [];

  // Try JSON first
  if (rawText.startsWith('[') && rawText.endsWith(']')) {
    try {
      const json = JSON.parse(rawText);
      json.forEach(item => {
        if (item.rollNumber && item.name) {
          parsedStudents.push({
            rollNumber: String(item.rollNumber).trim().toUpperCase(),
            name: String(item.name).trim(),
            className: String(item.className || 'B.Tech CSE').trim(),
            section: String(item.section || 'A').trim().toUpperCase(),
            subjectCode: String(item.subjectCode || 'GEN101').trim().toUpperCase()
          });
        }
      });
    } catch (err) {
      showToast('Invalid JSON format: ' + err.message, 'error');
      return;
    }
  } else {
    // Parse CSV: rollNumber, name, className, section, subjectCode
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach((line, index) => {
      // Skip header line if detected
      if (index === 0 && (line.toLowerCase().includes('roll') || line.toLowerCase().includes('name'))) {
        return;
      }
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        parsedStudents.push({
          rollNumber: parts[0].toUpperCase(),
          name: parts[1],
          className: parts[2] || 'B.Tech CSE',
          section: (parts[3] || 'A').toUpperCase(),
          subjectCode: (parts[4] || 'GEN101').toUpperCase()
        });
      }
    });
  }

  if (parsedStudents.length === 0) {
    showToast('No valid student rows found. Expected format: RollNumber, Name, Class, Section, SubjectCode', 'error');
    return;
  }

  showLoadingSpinner(true);
  try {
    StorageService.bulkCreate('students', parsedStudents);
    showToast(`Successfully imported ${parsedStudents.length} students!`, 'success');
    closeBulkImportModal();
    await loadStudents();
  } catch (err) {
    showToast('Import error: ' + err.message, 'error');
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Helpers
 */
function getDeptBadgeClass(className = '') {
  const norm = className.toUpperCase();
  if (norm.includes('CS')) return 'badge-cse';
  if (norm.includes('IT')) return 'badge-it';
  if (norm.includes('EC')) return 'badge-ece';
  if (norm.includes('ME')) return 'badge-mech';
  return 'badge-default';
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showLoadingSpinner(show) {
  let spinner = document.getElementById('spinner-overlay');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'spinner-overlay';
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = `
      <div class="spinner"></div>
      <p style="color: #fff; font-size: 0.9rem; font-weight: 500;">Simulating Network Request...</p>
    `;
    document.body.appendChild(spinner);
  }

  if (show) {
    spinner.classList.add('active');
  } else {
    spinner.classList.remove('active');
  }
}
