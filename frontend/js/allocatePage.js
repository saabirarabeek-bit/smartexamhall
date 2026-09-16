/**
 * Allocation Page Controller
 * Manages Exam Session configuration, room/subject selections, running the smart
 * allocation engine, rendering interactive visual seat charts, and searching/filtering.
 */

let allStudents = [];
let allRooms = [];
let currentAllocationResult = null;

document.addEventListener('DOMContentLoaded', async () => {
  initAllocatePage();
});

async function initAllocatePage() {
  allStudents = StorageService.getAll('students');
  allRooms = StorageService.getAll('rooms');

  populateExamSetupForm();
  setupEventListeners();

  // Check if there is an existing allocation in storage
  const savedAllocation = StorageService.getLatestAllocation();
  if (savedAllocation) {
    currentAllocationResult = savedAllocation;
    renderAllocationResults(savedAllocation);
  }

  // Handle URL query parameters (e.g. ?search=CS2401)
  const urlParams = new URLSearchParams(window.location.search);
  const searchRoll = urlParams.get('search');
  if (searchRoll) {
    const searchInput = document.getElementById('chart-search-roll');
    if (searchInput) searchInput.value = searchRoll;
    setTimeout(() => {
      handleSearchStudent(searchRoll);
    }, 300);
  }
}

/**
 * Populate rooms checkboxes and subjects in setup form
 */
function populateExamSetupForm() {
  // Set default date to today, time to 09:30 AM
  const dateInput = document.getElementById('exam-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Rooms selector checkboxes
  const roomsContainer = document.getElementById('rooms-selector-list');
  if (roomsContainer) {
    if (allRooms.length === 0) {
      roomsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No rooms found. Please create rooms first.</p>`;
    } else {
      roomsContainer.innerHTML = allRooms.map(room => {
        const cap = room.capacity || (room.rows * room.columns);
        return `
          <label style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); cursor: pointer; font-size: 0.85rem;">
            <input type="checkbox" name="selectedRooms" value="${room.id}" checked onchange="updateSetupCounters()">
            <span style="color: #fff; font-weight: 600;">${room.roomName}</span>
            <span class="badge badge-default" style="margin-left: auto;">${cap} Seats</span>
          </label>
        `;
      }).join('');
    }
  }

  // Subjects selector checkboxes
  const subjects = [...new Set(allStudents.map(s => s.subjectCode).filter(Boolean))].sort();
  const subjectsContainer = document.getElementById('subjects-selector-list');
  if (subjectsContainer) {
    if (subjects.length === 0) {
      subjectsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No subjects found.</p>`;
    } else {
      subjectsContainer.innerHTML = subjects.map(sub => `
        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.825rem; color: var(--text-secondary); cursor: pointer;">
          <input type="checkbox" name="selectedSubjects" value="${sub}" checked onchange="updateSetupCounters()">
          <span class="seat-subject-pill">${sub}</span>
        </label>
      `).join('');
    }
  }

  updateSetupCounters();
}

/**
 * Update dynamic capacity vs student numbers counter
 */
function updateSetupCounters() {
  const selectedRoomIds = Array.from(document.querySelectorAll('input[name="selectedRooms"]:checked')).map(el => el.value);
  const selectedSubjects = Array.from(document.querySelectorAll('input[name="selectedSubjects"]:checked')).map(el => el.value);

  const selectedRooms = allRooms.filter(r => selectedRoomIds.includes(r.id));
  const totalSelectedCap = selectedRooms.reduce((sum, r) => sum + (r.capacity || (r.rows * r.columns)), 0);

  const eligibleStudents = allStudents.filter(s => selectedSubjects.includes(s.subjectCode));

  const countBadge = document.getElementById('setup-status-badge');
  if (countBadge) {
    const diff = totalSelectedCap - eligibleStudents.length;
    if (diff < 0) {
      countBadge.className = 'badge badge-conflict';
      countBadge.innerHTML = `⚠️ Deficit of ${Math.abs(diff)} seats (${eligibleStudents.length} Students vs ${totalSelectedCap} Seats)`;
    } else {
      countBadge.className = 'badge badge-cse';
      countBadge.innerHTML = `✓ ${eligibleStudents.length} Candidates • ${totalSelectedCap} Total Seats (${diff} Vacant)`;
    }
  }
}

function setupEventListeners() {
  const setupForm = document.getElementById('exam-session-form');
  if (setupForm) {
    setupForm.addEventListener('submit', handleRunAllocation);
  }

  // Live roll number search on chart
  const searchInput = document.getElementById('chart-search-roll');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleSearchStudent(e.target.value);
    });
  }

  // Filter seats by class
  const classFilter = document.getElementById('chart-class-filter');
  if (classFilter) {
    classFilter.addEventListener('change', (e) => {
      filterChartSeats(e.target.value);
    });
  }
}

/**
 * Trigger Smart Allocation
 */
async function handleRunAllocation(e) {
  e.preventDefault();

  const selectedRoomIds = Array.from(document.querySelectorAll('input[name="selectedRooms"]:checked')).map(el => el.value);
  const selectedSubjects = Array.from(document.querySelectorAll('input[name="selectedSubjects"]:checked')).map(el => el.value);

  if (selectedRoomIds.length === 0) {
    showToast('Please select at least one examination room.', 'error');
    return;
  }

  const selectedRooms = allRooms.filter(r => selectedRoomIds.includes(r.id));
  const candidateStudents = allStudents.filter(s => selectedSubjects.length === 0 || selectedSubjects.includes(s.subjectCode));

  if (candidateStudents.length === 0) {
    showToast('No students match the selected exam subjects.', 'error');
    return;
  }

  const examDetails = {
    examName: document.getElementById('exam-name')?.value || 'Mid-Semester Examinations',
    date: document.getElementById('exam-date')?.value || new Date().toISOString().split('T')[0],
    time: document.getElementById('exam-time')?.value || '09:30 AM - 12:30 PM',
    subjects: selectedSubjects,
    rooms: selectedRoomIds
  };

  showLoadingSpinner(true, 'Running Smart Allocation Algorithm & Balancing Rooms...');

  try {
    // Artificial slight delay to simulate complex solver calculation
    await new Promise(r => setTimeout(r, 450));

    // Execute Smart Allocation Engine
    const result = AllocationEngine.allocateSeats(candidateStudents, selectedRooms);
    result.examDetails = examDetails;

    // Persist to localStorage
    StorageService.saveAllocation(result);
    currentAllocationResult = result;

    // Inform dummy backend in background (contract demonstration)
    ApiService.requestBackendAllocation({
      students: candidateStudents,
      rooms: selectedRooms,
      examDetails: examDetails
    }).catch(err => console.warn('Backend notification notice:', err.message));

    // Render results
    renderAllocationResults(result);
    showToast('Seat allocation completed successfully!', 'success');
  } catch (err) {
    console.error('Allocation failure:', err);
    showToast(`Allocation error: ${err.message}`, 'error');
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Render Allocation KPI Cards, Warnings and Seating Chart
 */
function renderAllocationResults(result) {
  const resultsContainer = document.getElementById('allocation-results-section');
  if (!resultsContainer) return;
  resultsContainer.style.display = 'block';

  const s = result.summary;

  // KPIs
  document.getElementById('res-total-students').textContent = s.totalStudents;
  document.getElementById('res-total-allocated').textContent = s.totalAllocated;
  document.getElementById('res-total-capacity').textContent = s.totalCapacity;
  document.getElementById('res-total-unallocated').textContent = s.totalUnallocated;
  document.getElementById('res-total-conflicts').textContent = s.totalConflicts;

  // Unallocated warning block
  const alertContainer = document.getElementById('res-alerts-container');
  let alertHtml = '';

  if (s.totalUnallocated > 0) {
    alertHtml += `
      <div class="warnings-banner danger">
        <div class="warning-icon">🚨</div>
        <div class="warnings-content">
          <h4>Capacity Overflow: ${s.totalUnallocated} Candidate(s) Unallocated</h4>
          <p>The total student cohort exceeds selected hall capacity. Please assign additional exam rooms to accommodate remaining students.</p>
        </div>
      </div>
    `;
  }

  if (s.totalConflicts > 0) {
    alertHtml += `
      <div class="warnings-banner">
        <div class="warning-icon">⚠️</div>
        <div class="warnings-content">
          <h4>Adjacency Conflict Notice (${s.totalConflicts} Seats)</h4>
          <p>Due to high concentration of students in a single department, complete orthogonal separation was mathematically impossible for ${s.totalConflicts} seat(s). Flagged with red notices in chart.</p>
        </div>
      </div>
    `;
  }

  alertContainer.innerHTML = alertHtml;

  // Populate chart class filter dropdown
  const chartClassFilter = document.getElementById('chart-class-filter');
  if (chartClassFilter) {
    const classes = [...new Set(result.allocations.map(a => a.student?.className).filter(Boolean))].sort();
    chartClassFilter.innerHTML = '<option value="">Highlight All Classes</option>' +
      classes.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // Initialize SeatChart component
  SeatChart.init(result, 'seatchart-view-container');

  // Smooth scroll down to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

/**
 * Live search student by roll number on chart
 */
function handleSearchStudent(roll) {
  const statusEl = document.getElementById('search-result-status');
  if (!statusEl) return;

  if (!roll || !roll.trim()) {
    statusEl.innerHTML = '';
    document.querySelectorAll('.seat-card.highlighted').forEach(el => el.classList.remove('highlighted'));
    return;
  }

  const match = SeatChart.highlightStudent(roll);
  if (match) {
    statusEl.innerHTML = `
      <span style="color: #34d399; font-weight: 600; font-size: 0.85rem;">
        ✓ Located ${match.student.name} in <strong>${match.roomName}</strong> at Seat <strong style="color: var(--accent-cyan);">${match.seatLabel}</strong>
      </span>
    `;
  } else {
    statusEl.innerHTML = `
      <span style="color: #f87171; font-size: 0.85rem;">
        ✕ Student roll "${roll}" not found in current allocation.
      </span>
    `;
  }
}

/**
 * Dim non-matching classes on the seat chart
 */
function filterChartSeats(selectedClass) {
  const cards = document.querySelectorAll('.seat-card');
  cards.forEach(card => {
    if (!selectedClass) {
      card.style.opacity = '1';
      return;
    }
    const roll = card.getAttribute('data-roll');
    const allocation = currentAllocationResult?.allocations?.find(a => a.student?.rollNumber === roll);
    if (allocation && allocation.student?.className === selectedClass) {
      card.style.opacity = '1';
    } else {
      card.style.opacity = '0.25';
    }
  });
}

function showLoadingSpinner(show, message = 'Processing...') {
  let spinner = document.getElementById('spinner-overlay');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'spinner-overlay';
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = `
      <div class="spinner"></div>
      <p id="spinner-msg" style="color: #fff; font-size: 0.95rem; font-weight: 600;">Processing...</p>
    `;
    document.body.appendChild(spinner);
  }

  const msgEl = document.getElementById('spinner-msg');
  if (msgEl) msgEl.textContent = message;

  if (show) {
    spinner.classList.add('active');
  } else {
    spinner.classList.remove('active');
  }
}
