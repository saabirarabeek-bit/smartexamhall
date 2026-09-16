/**
 * SeatChart - Interactive Seating Chart UI Component
 * Renders CSS Grid of examination seats, manages room switching,
 * student inspection modal, search highlighting, and CSV/Print export.
 */

const SeatChart = {
  activeAllocation: null,
  currentRoomId: null,
  containerEl: null,
  modalEl: null,

  /**
   * Initialize SeatChart with allocation result and container
   */
  init(allocationResult, containerId = 'seatchart-container') {
    this.activeAllocation = allocationResult;
    this.containerEl = document.getElementById(containerId);
    
    if (!this.containerEl) {
      console.error(`SeatChart container #${containerId} not found`);
      return;
    }

    // Pick first room as active room by default
    const roomIds = Object.keys(allocationResult.roomGrids || {});
    if (roomIds.length > 0) {
      this.currentRoomId = roomIds[0];
    }

    this.render();
  },

  /**
   * Render the entire seating visualization interface
   */
  render() {
    if (!this.activeAllocation || !this.containerEl) return;

    const { allocations, roomGrids, roomStats, summary } = this.activeAllocation;
    const roomIds = Object.keys(roomGrids);

    if (roomIds.length === 0) {
      this.containerEl.innerHTML = `
        <div class="card text-center" style="padding: 3rem;">
          <p style="color: var(--text-muted);">No seating allocation data found. Run an allocation first.</p>
        </div>
      `;
      return;
    }

    const currentGrid = roomGrids[this.currentRoomId];
    const currentStats = roomStats[this.currentRoomId] || {};

    let html = `
      <div class="hall-visualizer">
        <!-- Room Selector Tabs -->
        <div class="room-tabs">
    `;

    roomIds.forEach(roomId => {
      const stats = roomStats[roomId] || {};
      const isActive = roomId === this.currentRoomId;
      html += `
        <button class="room-tab-btn ${isActive ? 'active' : ''}" onclick="SeatChart.switchRoom('${roomId}')">
          <span>${stats.roomName || roomId}</span>
          <span class="badge ${stats.conflicts > 0 ? 'badge-conflict' : 'badge-default'}">
            ${stats.allocated}/${stats.capacity}
          </span>
        </button>
      `;
    });

    html += `
        </div>

        <!-- Room Header & Quick Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff;">
              ${currentStats.roomName || 'Exam Hall'}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Occupancy: <strong style="color: var(--accent-cyan);">${currentStats.allocated}</strong> / ${currentStats.capacity} seats occupied (${currentStats.vacant} vacant)
              ${currentStats.conflicts > 0 ? `• <span style="color: #f87171; font-weight: 600;">⚠️ ${currentStats.conflicts} Adjacent Notice(s)</span>` : '• <span style="color: #34d399;">✓ Zero Conflicts</span>'}
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="SeatChart.exportCurrentRoomCSV()">
              📥 Export Room CSV
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              🖨️ Print Hall Sheet
            </button>
          </div>
        </div>

        <!-- Teacher's Podium / Blackboard Marker -->
        <div class="board-podium">
          <span>▲ FRONT OF EXAM HALL • TEACHER'S PODIUM & BLACKBOARD ▲</span>
        </div>

        <!-- Grid Container -->
        <div class="seat-grid-wrapper">
    `;

    // Render CSS Grid
    if (currentGrid && currentGrid.length > 0) {
      const numRows = currentGrid.length;
      const numCols = currentGrid[0].length;

      html += `
        <div class="seat-grid" id="seat-grid-element" style="grid-template-columns: repeat(${numCols}, minmax(115px, 1fr));">
      `;

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const seat = currentGrid[r][c];
          const rowChar = String.fromCharCode(65 + r);
          const colNum = c + 1;
          const fallbackLabel = `${rowChar}${colNum}`;

          if (seat && seat.student) {
            const student = seat.student;
            const deptClass = this._getDeptClass(student.className);
            const conflictClass = seat.hasConflict ? 'has-conflict' : '';

            html += `
              <div class="seat-card ${deptClass} ${conflictClass}" 
                   id="seat-node-${seat.roomId}-${r}-${c}"
                   data-roll="${student.rollNumber}"
                   data-room="${seat.roomId}"
                   onclick="SeatChart.openSeatModal('${seat.roomId}', ${r}, ${c})">
                ${seat.hasConflict ? `<div class="conflict-badge" title="${seat.conflictReason || 'Adjacency Notice'}">!</div>` : ''}
                <div class="seat-header">
                  <span class="seat-label">${seat.seatLabel}</span>
                  <span class="seat-roll">${student.rollNumber}</span>
                </div>
                <div class="seat-name" title="${student.name}">${student.name}</div>
                <div class="seat-footer">
                  <span class="badge ${this._getBadgeClass(student.className)}">${student.className.replace('B.Tech ', '')}</span>
                  <span class="seat-subject-pill">${student.subjectCode || 'EXAM'}</span>
                </div>
              </div>
            `;
          } else {
            // Vacant seat
            html += `
              <div class="seat-card empty-seat">
                <span class="seat-label">${fallbackLabel}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">Vacant</span>
              </div>
            `;
          }
        }
      }

      html += `</div>`;
    }

    html += `
        </div>

        <!-- Color Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background: var(--dept-cse);"></div>
            <span>B.Tech CSE</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--dept-it);"></div>
            <span>B.Tech IT</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--dept-ece);"></div>
            <span>B.Tech ECE</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--dept-mech);"></div>
            <span>B.Tech MECH</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #ef4444;"></div>
            <span>Adjacency Notice</span>
          </div>
        </div>
      </div>

      <!-- Printable Attendance Section (Visible during Print) -->
      <div class="printable-room-section" style="display: none;">
        <div class="print-header">
          <h2>Examination Hall Seating Plan & Attendance Roster</h2>
          <p>Official Academic Examination Session</p>
        </div>
        <div class="print-meta-grid">
          <div><strong>Hall:</strong> ${currentStats.roomName || 'Hall'}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Total Allocated:</strong> ${currentStats.allocated} Students</div>
        </div>
        <table class="print-attendance-table">
          <thead>
            <tr>
              <th>Seat</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class / Dept</th>
              <th>Subject</th>
              <th>Student Signature</th>
            </tr>
          </thead>
          <tbody>
            ${this._generatePrintRows(currentGrid)}
          </tbody>
        </table>
        <div class="print-signatures">
          <div class="sig-line">Invigilator Signature</div>
          <div class="sig-line">Chief Superintendent Signature</div>
        </div>
      </div>
    `;

    this.containerEl.innerHTML = html;
  },

  /**
   * Helper to format table rows for print view
   */
  _generatePrintRows(grid) {
    if (!grid) return '';
    const rows = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const seat = grid[r][c];
        if (seat && seat.student) {
          rows.push(`
            <tr>
              <td><strong>${seat.seatLabel}</strong></td>
              <td>${seat.student.rollNumber}</td>
              <td>${seat.student.name}</td>
              <td>${seat.student.className} - Sec ${seat.student.section}</td>
              <td>${seat.student.subjectCode}</td>
              <td style="min-width: 120px;"></td>
            </tr>
          `);
        }
      }
    }
    return rows.join('');
  },

  /**
   * Switch active room view
   */
  switchRoom(roomId) {
    this.currentRoomId = roomId;
    this.render();
  },

  /**
   * Highlight and focus a specific roll number
   */
  highlightStudent(rollNumber) {
    if (!this.activeAllocation || !rollNumber) return false;

    const cleanRoll = rollNumber.trim().toUpperCase();
    const found = this.activeAllocation.allocations.find(
      a => a.student && a.student.rollNumber.toUpperCase() === cleanRoll
    );

    if (!found) {
      return false;
    }

    // Switch to target room if currently viewing another
    if (this.currentRoomId !== found.roomId) {
      this.currentRoomId = found.roomId;
      this.render();
    }

    // Scroll and pulse target element
    setTimeout(() => {
      const el = document.getElementById(`seat-node-${found.roomId}-${found.seatRow}-${found.seatColumn}`);
      if (el) {
        document.querySelectorAll('.seat-card.highlighted').forEach(node => node.classList.remove('highlighted'));
        el.classList.add('highlighted');
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 100);

    return found;
  },

  /**
   * Open modal with full student & seat adjacency details
   */
  openSeatModal(roomId, r, c) {
    const grid = this.activeAllocation?.roomGrids?.[roomId];
    if (!grid || !grid[r] || !grid[r][c]) return;

    const seat = grid[r][c];
    const student = seat.student;
    if (!student) return;

    // Determine surrounding neighbors
    const neighbors = [];
    const dirs = [
      { name: 'Front (Row - 1)', dr: -1, dc: 0 },
      { name: 'Back (Row + 1)', dr: 1, dc: 0 },
      { name: 'Left (Col - 1)', dr: 0, dc: -1 },
      { name: 'Right (Col + 1)', dr: 0, dc: 1 }
    ];

    dirs.forEach(d => {
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
        const nSeat = grid[nr][nc];
        if (nSeat && nSeat.student) {
          neighbors.push({
            position: d.name,
            seatLabel: nSeat.seatLabel,
            student: nSeat.student
          });
        }
      }
    });

    const modalBodyHtml = `
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
        <div style="width: 54px; height: 54px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary), var(--accent-cyan)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: white;">
          ${student.name.charAt(0)}
        </div>
        <div>
          <h4 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0;">${student.name}</h4>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--accent-cyan); font-weight: 600;">
            ${student.rollNumber}
          </span>
        </div>
      </div>

      <div class="form-row" style="margin-bottom: 1.25rem;">
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Hall & Seat</label>
          <div style="font-weight: 600; color: #fff; font-size: 1rem;">
            ${seat.roomName} • <span style="color: var(--accent-cyan);">${seat.seatLabel}</span>
          </div>
        </div>
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Department & Sec</label>
          <div style="font-weight: 600; color: #fff; font-size: 1rem;">
            ${student.className} (Sec ${student.section})
          </div>
        </div>
      </div>

      <div class="form-row" style="margin-bottom: 1.5rem;">
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Exam Subject</label>
          <div style="font-weight: 600; color: #fff; font-size: 1rem;">
            ${student.subjectCode}
          </div>
        </div>
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Bench Type / Slot</label>
          <div style="font-weight: 600; color: #fff; font-size: 1rem;">
            Bench ${seat.benchIndex} (${seat.benchSlot})
          </div>
        </div>
      </div>

      ${seat.hasConflict ? `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1.25rem;">
          <h5 style="color: #f87171; font-size: 0.85rem; margin-bottom: 0.25rem;">⚠️ Adjacency Notice</h5>
          <p style="color: #fca5a5; font-size: 0.8rem; margin: 0;">${seat.conflictReason}</p>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.8rem; color: #34d399;">
          ✓ Fully satisfies diversity rules: no adjacent student shares class or subject.
        </div>
      `}

      <div>
        <h5 style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em;">
          Immediate Neighbors (Front, Back, Left, Right)
        </h5>
        ${neighbors.length === 0 ? '<p style="font-size: 0.8rem; color: var(--text-muted);">No adjacent students (corner or vacant).</p>' : `
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${neighbors.map(n => `
              <div style="background: var(--bg-surface-elevated); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                <div>
                  <span style="color: var(--text-muted); font-weight: 500;">${n.position}:</span>
                  <strong style="color: #fff; margin-left: 0.4rem;">${n.student.name}</strong> (${n.student.rollNumber})
                </div>
                <div style="display: flex; gap: 0.35rem;">
                  <span class="badge ${SeatChart._getBadgeClass(n.student.className)}">${n.student.className.replace('B.Tech ', '')}</span>
                  <span class="seat-subject-pill">${n.seatLabel}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Render modal in generic modal overlay
    let overlay = document.getElementById('seat-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'seat-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3>Student Seating Details</h3>
            <button class="btn-close" onclick="SeatChart.closeSeatModal()">✕</button>
          </div>
          <div class="modal-body" id="seat-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="SeatChart.closeSeatModal()">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    document.getElementById('seat-modal-body').innerHTML = modalBodyHtml;
    overlay.classList.add('active');
  },

  closeSeatModal() {
    const overlay = document.getElementById('seat-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  /**
   * Export current room allocation as CSV
   */
  exportCurrentRoomCSV() {
    if (!this.activeAllocation || !this.currentRoomId) return;

    const grid = this.activeAllocation.roomGrids[this.currentRoomId];
    const roomName = this.activeAllocation.roomStats[this.currentRoomId]?.roomName || 'Room';

    if (!grid) return;

    let csvContent = 'Seat,RollNumber,Name,Class,Section,Subject,BenchSlot,ConflictNotice\n';

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const seat = grid[r][c];
        if (seat && seat.student) {
          const s = seat.student;
          csvContent += `"${seat.seatLabel}","${s.rollNumber}","${s.name}","${s.className}","${s.section}","${s.subjectCode}","${seat.benchSlot}","${seat.hasConflict ? seat.conflictReason : 'None'}"\n`;
        }
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${roomName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_seating_chart.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  _getDeptClass(className = '') {
    const norm = className.toUpperCase();
    if (norm.includes('CS')) return 'dept-cse';
    if (norm.includes('IT')) return 'dept-it';
    if (norm.includes('EC')) return 'dept-ece';
    if (norm.includes('ME')) return 'dept-mech';
    return '';
  },

  _getBadgeClass(className = '') {
    const norm = className.toUpperCase();
    if (norm.includes('CS')) return 'badge-cse';
    if (norm.includes('IT')) return 'badge-it';
    if (norm.includes('EC')) return 'badge-ece';
    if (norm.includes('ME')) return 'badge-mech';
    return 'badge-default';
  }
};

window.SeatChart = SeatChart;
