/**
 * Rooms Management Logic
 * Handles Room CRUD operations, capacity auto-calculation, dynamic grid preview,
 * and bench type selection.
 */

let allRooms = [];
let roomToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadRooms();
  setupEventListeners();
});

function setupEventListeners() {
  const roomForm = document.getElementById('room-form');
  if (roomForm) {
    roomForm.addEventListener('submit', handleRoomFormSubmit);
  }

  // Live grid preview listeners
  const rowsInput = document.getElementById('room-rows');
  const colsInput = document.getElementById('room-columns');
  const benchInput = document.getElementById('room-bench-type');

  if (rowsInput) rowsInput.addEventListener('input', updateGridPreview);
  if (colsInput) colsInput.addEventListener('input', updateGridPreview);
  if (benchInput) benchInput.addEventListener('change', updateGridPreview);
}

/**
 * Load rooms from storage / api
 */
async function loadRooms() {
  showLoadingSpinner(true);
  try {
    const res = await ApiService.getRooms();
    allRooms = res.data || StorageService.getAll('rooms');
    renderRoomsList(allRooms);
  } catch (err) {
    console.error('Error loading rooms:', err);
    allRooms = StorageService.getAll('rooms');
    renderRoomsList(allRooms);
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Render room cards grid
 */
function renderRoomsList(rooms) {
  const container = document.getElementById('rooms-grid-container');
  const countBadge = document.getElementById('room-count-badge');
  const totalCapBadge = document.getElementById('total-capacity-badge');

  if (countBadge) countBadge.textContent = `${rooms.length} Rooms`;

  const totalCap = rooms.reduce((sum, r) => sum + (r.capacity || (r.rows * r.columns)), 0);
  if (totalCapBadge) totalCapBadge.textContent = `${totalCap} Total Capacity`;

  if (!container) return;

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="card text-center" style="grid-column: 1 / -1; padding: 3rem;">
        <p style="color: var(--text-muted);">No examination halls configured yet. Click "Add Hall" to create one.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = rooms.map(room => {
    const calculatedCap = room.benchType === 'double' ? room.rows * room.columns * 2 : room.rows * room.columns;
    const capacity = room.capacity || calculatedCap;

    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">${escapeHtml(room.roomName)}</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                ${escapeHtml(room.description || 'Standard Exam Hall')}
              </p>
            </div>
            <span class="badge ${room.benchType === 'double' ? 'badge-it' : 'badge-cse'}">
              ${room.benchType === 'double' ? 'Double Sharing' : 'Single Bench'}
            </span>
          </div>

          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; gap: 0.5rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Rows</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: #fff;">${room.rows}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Columns</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: #fff;">${room.columns}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Capacity</div>
                <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-cyan);">${capacity}</div>
              </div>
            </div>
          </div>

          <!-- Mini visual layout grid -->
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
              <span>Layout Outline (${room.rows} × ${room.columns} Desks)</span>
              <span>Podium ▲</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(${room.columns}, 1fr); gap: 4px; background: rgba(0,0,0,0.25); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); max-height: 110px; overflow: hidden;">
              ${Array.from({ length: room.rows * room.columns }).map(() => `
                <div style="height: 12px; background: rgba(56, 189, 248, 0.2); border-radius: 2px; border: 1px solid rgba(56, 189, 248, 0.3);"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
          <button class="btn btn-outline btn-sm" onclick="openEditRoomModal('${room.id}')">
            ✏️ Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteRoomModal('${room.id}', '${escapeHtml(room.roomName)}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Update modal mini grid preview live
 */
function updateGridPreview() {
  const rows = Math.min(12, Math.max(1, parseInt(document.getElementById('room-rows').value, 10) || 1));
  const cols = Math.min(12, Math.max(1, parseInt(document.getElementById('room-columns').value, 10) || 1));
  const benchType = document.getElementById('room-bench-type').value;

  const totalCap = benchType === 'double' ? rows * cols * 2 : rows * cols;
  document.getElementById('calculated-capacity').textContent = totalCap;

  const previewContainer = document.getElementById('modal-grid-preview');
  if (previewContainer) {
    previewContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    previewContainer.innerHTML = Array.from({ length: rows * cols }).map((_, i) => `
      <div style="height: 14px; background: rgba(79, 70, 229, 0.35); border-radius: 2px; border: 1px solid rgba(79, 70, 229, 0.6); display: flex; align-items: center; justify-content: center; font-size: 8px; color: #a5b4fc;">
        ${benchType === 'double' ? '••' : '•'}
      </div>
    `).join('');
  }
}

/**
 * Open Add Room Modal
 */
function openAddRoomModal() {
  document.getElementById('room-modal-title').textContent = 'Add Exam Room';
  document.getElementById('room-id').value = '';
  document.getElementById('room-name').value = '';
  document.getElementById('room-rows').value = 5;
  document.getElementById('room-columns').value = 6;
  document.getElementById('room-bench-type').value = 'single';
  document.getElementById('room-description').value = '';

  updateGridPreview();
  document.getElementById('room-modal-overlay').classList.add('active');
}

/**
 * Open Edit Room Modal
 */
function openEditRoomModal(id) {
  const room = allRooms.find(r => String(r.id) === String(id));
  if (!room) return;

  document.getElementById('room-modal-title').textContent = 'Edit Exam Room';
  document.getElementById('room-id').value = room.id;
  document.getElementById('room-name').value = room.roomName;
  document.getElementById('room-rows').value = room.rows;
  document.getElementById('room-columns').value = room.columns;
  document.getElementById('room-bench-type').value = room.benchType || 'single';
  document.getElementById('room-description').value = room.description || '';

  updateGridPreview();
  document.getElementById('room-modal-overlay').classList.add('active');
}

function closeRoomModal() {
  document.getElementById('room-modal-overlay').classList.remove('active');
}

/**
 * Save Room (Add / Edit)
 */
async function handleRoomFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('room-id').value;
  const rows = parseInt(document.getElementById('room-rows').value, 10);
  const cols = parseInt(document.getElementById('room-columns').value, 10);
  const benchType = document.getElementById('room-bench-type').value;
  const capacity = benchType === 'double' ? rows * cols * 2 : rows * cols;

  const roomData = {
    roomName: document.getElementById('room-name').value.trim(),
    rows: rows,
    columns: cols,
    capacity: capacity,
    benchType: benchType,
    description: document.getElementById('room-description').value.trim()
  };

  if (!roomData.roomName || !roomData.rows || !roomData.columns) {
    showToast('Please specify Room Name, Rows, and Columns.', 'error');
    return;
  }

  showLoadingSpinner(true);
  try {
    if (id) {
      StorageService.update('rooms', id, roomData);
      await ApiService.updateRoom(id, roomData);
      showToast(`Hall "${roomData.roomName}" updated successfully!`, 'success');
    } else {
      StorageService.create('rooms', roomData);
      await ApiService.createRoom(roomData);
      showToast(`Hall "${roomData.roomName}" added successfully!`, 'success');
    }

    closeRoomModal();
    await loadRooms();
  } catch (err) {
    showToast(`Error saving room: ${err.message}`, 'error');
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Delete Room Modal
 */
function openDeleteRoomModal(id, name) {
  roomToDeleteId = id;
  document.getElementById('delete-room-name').textContent = name;
  document.getElementById('delete-room-modal-overlay').classList.add('active');
}

function closeDeleteRoomModal() {
  roomToDeleteId = null;
  document.getElementById('delete-room-modal-overlay').classList.remove('active');
}

async function confirmDeleteRoom() {
  if (!roomToDeleteId) return;

  showLoadingSpinner(true);
  try {
    StorageService.remove('rooms', roomToDeleteId);
    await ApiService.deleteRoom(roomToDeleteId);
    showToast('Room deleted successfully.', 'info');
    closeDeleteRoomModal();
    await loadRooms();
  } catch (err) {
    showToast(`Failed to delete room: ${err.message}`, 'error');
  } finally {
    showLoadingSpinner(false);
  }
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
