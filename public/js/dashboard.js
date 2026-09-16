/**
 * Dashboard Logic
 * Initializes KPIs, warning panels, and quick lookup for roll numbers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

function initDashboard() {
  // Load data from StorageService
  const students = StorageService.getAll('students');
  const rooms = StorageService.getAll('rooms');
  const latestAllocation = StorageService.getLatestAllocation();

  // Compute metrics
  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || (r.rows * r.columns)), 0);

  let allocatedCount = 0;
  let vacantCount = totalCapacity;
  let conflictCount = 0;
  let unallocatedCount = 0;

  if (latestAllocation && latestAllocation.summary) {
    allocatedCount = latestAllocation.summary.totalAllocated || 0;
    vacantCount = totalCapacity - allocatedCount;
    conflictCount = latestAllocation.summary.totalConflicts || 0;
    unallocatedCount = latestAllocation.summary.totalUnallocated || 0;
  }

  // Populate Metric Cards
  document.getElementById('stat-total-students').textContent = totalStudents;
  document.getElementById('stat-total-rooms').textContent = totalRooms;
  document.getElementById('stat-total-capacity').textContent = totalCapacity;
  document.getElementById('stat-allocated').textContent = allocatedCount;
  document.getElementById('stat-vacant').textContent = Math.max(0, vacantCount);

  // Warnings Banner
  const warningsContainer = document.getElementById('dashboard-warnings');
  const warnings = [];

  if (totalStudents > totalCapacity) {
    warnings.push({
      type: 'danger',
      title: 'Insufficient Total Capacity',
      msg: `Total students (${totalStudents}) exceeds total room capacity (${totalCapacity}). At least ${totalStudents - totalCapacity} student(s) will remain unallocated.`
    });
  }

  if (unallocatedCount > 0) {
    warnings.push({
      type: 'danger',
      title: 'Unallocated Students in Last Run',
      msg: `${unallocatedCount} student(s) could not be placed due to room capacity limits in the most recent session.`
    });
  }

  if (conflictCount > 0) {
    warnings.push({
      type: 'warning',
      title: 'Adjacency Notice in Last Allocation',
      msg: `${conflictCount} seat(s) could not strictly satisfy same-class/subject separation due to cohort concentration.`
    });
  }

  if (warnings.length > 0) {
    warningsContainer.innerHTML = warnings.map(w => `
      <div class="warnings-banner ${w.type}">
        <div class="warning-icon">${w.type === 'danger' ? '🚨' : '⚠️'}</div>
        <div class="warnings-content">
          <h4>${w.title}</h4>
          <p>${w.msg}</p>
        </div>
      </div>
    `).join('');
  } else {
    warningsContainer.innerHTML = `
      <div class="warnings-banner" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
        <div class="warning-icon" style="color: #34d399;">✓</div>
        <div class="warnings-content">
          <h4 style="color: #34d399;">System Healthy</h4>
          <p>Capacity is sufficient. No active violations or unallocated overflows detected.</p>
        </div>
      </div>
    `;
  }

  // Setup Quick Search Form
  const quickSearchForm = document.getElementById('quick-search-form');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('quick-roll-input');
      const roll = input ? input.value.trim() : '';
      if (roll) {
        window.location.href = `allocate.html?search=${encodeURIComponent(roll)}`;
      }
    });
  }

  // Setup Reset Demo Data Button
  const btnReset = document.getElementById('btn-reset-demo');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Reset system data to initial 48 demo students and 3 rooms?')) {
        StorageService.resetToDefaults();
        showToast('Demo data restored successfully!', 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }

  // Populate Recent Allocations Preview if exists
  const recentSection = document.getElementById('recent-allocation-summary');
  if (recentSection && latestAllocation) {
    const s = latestAllocation.summary;
    recentSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h4 style="color: #fff; font-size: 1.05rem;">Latest Allocation Run</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
            Processed on ${new Date(latestAllocation.timestamp).toLocaleString()} • ${s.totalAllocated} Allocated • ${s.totalConflicts} Adjacency Notice(s)
          </p>
        </div>
        <a href="allocate.html" class="btn btn-primary btn-sm">View Live Seating Chart →</a>
      </div>
    `;
  }
}

/**
 * Global Toast Notification Helper
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;
