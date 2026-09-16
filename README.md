# Smart Examination Hall Seat Allocation System

An automated, intelligent exam hall seat allocation and visual management system designed to minimize malpractice risk by preventing adjacent seating of students from the same class, section, or subject.

Built with **Vanilla HTML5, CSS3, and JavaScript** on the frontend with client-side **`localStorage`** persistence, accompanied by a **Node.js + Express** dummy REST API server.

---

## 🌟 Key Features

1. **Malpractice Prevention Allocation Algorithm (`allocationEngine.js`)**:
   - **Diversity Grouping & Interleaving**: Automatically segregates students by composite keys (`className + subjectCode`) and interleaves candidates using multi-way round robin.
   - **Serpentine (Boustrophedon) Fill**: Traverses grid rows alternately (left-to-right, then right-to-left) to maximize spatial distance between consecutive seats.
   - **4-Way Orthogonal & Bench Adjacency Validation**: Continuously inspects Front, Back, Left, Right, and double-bench partners.
   - **Lookahead Candidate Swapping**: Scans down the remaining student queue to swap conflict-free candidates into the active seat.
   - **Graceful Fallback & Conflict Flagging**: If a demographic cohort is too concentrated for complete separation, seats are flagged with detailed audit reasons without breaking the allocation.
   - **Capacity Overflow Protection**: Warns and cleanly separates candidates that exceed total hall capacity.

2. **Interactive Visual Seating Grid (`seatChart.js`)**:
   - Realistic hall layout featuring an **Invigilator's Podium & Blackboard** header.
   - Color-coded badges for departments:
     - 🟦 **B.Tech CSE**: Sky Blue
     - 🟪 **B.Tech IT**: Violet
     - 🟧 **B.Tech ECE**: Amber
     - 🟥 **B.Tech MECH**: Rose
   - Click any seat to open a detailed modal with student info and neighbor relationships (front, back, left, right).
   - Instant roll number search with auto-scroll and pulse/glow focus animation.
   - Filter by class to dim non-matching candidates.

3. **Hall & Student Management**:
   - Full CRUD operations persisted in `localStorage` under `StorageService`.
   - Dynamic grid preview during hall creation (adjust rows 1–12 and cols 1–12 to see real-time layout).
   - Bulk candidate import supporting both CSV lines and JSON arrays.
   - Pre-seeded with **48 students** across 4 departments and **3 halls** (66 total seats).

4. **Print & Export Ready**:
   - `@media print` optimized hall rosters featuring official examination header, seat coordinates, subject codes, and student signature columns.
   - One-click **CSV Export** per hall for exam supervisors.

---

## 🏗️ Architecture & File Structure

```
examhall/
├── backend/
│   ├── data/
│   │   └── mockData.js           # Static seed data (48 students, 3 rooms)
│   ├── routes/
│   │   ├── students.js           # Dummy REST API for students (GET, POST, PUT, DELETE)
│   │   ├── rooms.js              # Dummy REST API for rooms (GET, POST, PUT, DELETE)
│   │   └── allocation.js         # Dummy & server-side allocation endpoint
│   ├── package.json              # Node dependencies (express, cors)
│   └── server.js                 # Express server on port 5000 (serves REST API & static frontend)
│
├── frontend/
│   ├── index.html                # Executive Dashboard with KPIs and quick locator
│   ├── students.html             # Student CRUD, filter, and CSV/JSON bulk import
│   ├── rooms.html                # Exam hall CRUD with live grid visualizer
│   ├── allocate.html             # Exam event setup, allocation runner & interactive chart
│   ├── css/
│   │   ├── style.css             # Modern dark slate design system, animations, badges, grid
│   │   └── print.css             # Print-optimized A4 hall seating rosters & signature sheets
│   └── js/
│       ├── storage.js            # Namespaced localStorage CRUD service & default seeds
│       ├── api.js                # Fetch wrapper with simulated latency & fallback
│       ├── allocationEngine.js   # Core smart allocation algorithm
│       ├── seatChart.js          # Interactive CSS Grid seat map renderer
│       ├── students.js           # Student page logic & CSV parser
│       ├── rooms.js              # Room page logic & dynamic grid preview
│       ├── dashboard.js          # Dashboard KPIs and warnings
│       └── allocatePage.js       # Exam session runner and search controller
│
└── README.md
```

> **Data Persistence Model**: All real CRUD operations persist inside the browser via `localStorage` through `StorageService`. The Express backend provides full REST API contracts with simulated response latency (300–600ms) to demonstrate real-world asynchronous UI states.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended, tested on v22)
- Any modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Run the Express Backend Server

Open a terminal in the project directory:

```bash
cd backend
npm install
npm start
```

You will see:
```
🚀 Examination Hall Seat Allocator API Server Running
📡 URL: http://localhost:5000
🌐 Frontend UI available at: http://localhost:5000
⚙️  Simulated REST endpoints live at: http://localhost:5000/api
```

### 2. Open the Web Application

- **Via Local Server**: Open [http://localhost:5000](http://localhost:5000) in your browser.
- **Direct File Opening**: You can also double-click or serve `frontend/index.html` directly from any static web server (such as Live Server, Python `http.server`, or direct file URL).

---

## 🧮 How the Smart Allocation Algorithm Works

The algorithm in [`frontend/js/allocationEngine.js`](frontend/js/allocationEngine.js) executes the following sequential steps:

```
[Student Cohort]  ──▶  [Group by Class / Subject]
                              │
                              ▼
                     [Multi-Way Round Robin Interleave]
                              │
                              ▼
                     [Proportional Room Partitioning]
                              │
                              ▼
              [Serpentine Grid Fill (Row 0: ➜, Row 1: 🠔)]
                              │
                              ▼
              [4-Way Adjacency Check: L, R, F, B + Partner]
                     │                       │
           (Clean Match)           (Conflict Detected)
                     │                       │
                     ▼                       ▼
            [Place in Seat]         [Lookahead Swap Buffer]
                                             │
                                    ┌────────┴────────┐
                              (Candidate Found)   (No Candidate)
                                    │                   │
                                    ▼                   ▼
                           [Swap & Place Clean]  [Place & Flag Conflict]
```

### Detailed Algorithm Steps:
1. **Capacity Validation & Overflow Partitioning**:
   Computes total capacity across all selected rooms (`sum(rows * cols)`). If students exceed capacity, candidates beyond total capacity are moved to `unallocatedStudents` with an alert.
2. **Proportional Multi-Department Room Partitioning**:
   Rather than clustering all CS students in Room 1 and all IT students in Room 2, students from each class/subject group are distributed proportionally across halls.
3. **Maximum Diversity Interleaving**:
   Within each room's queue, candidates are grouped by composite key (`className + subjectCode`). A multi-way round-robin scheduler pulls one candidate from each group in descending order of remaining group size.
4. **Serpentine (Zig-Zag) Grid Traversal**:
   Seats in even rows (`0, 2, 4...`) are filled Left-to-Right (`0 -> cols - 1`), while odd rows (`1, 3, 5...`) are filled Right-to-Left (`cols - 1 -> 0`). This ensures that the last seat of row $r$ and the first seat of row $r+1$ are on opposite ends of the room.
5. **4-Way Orthogonal & Bench Adjacency Verification**:
   Before placing a candidate at `(r, c)`, the engine checks:
   - Front neighbor: `(r - 1, c)`
   - Back neighbor: `(r + 1, c)`
   - Left neighbor: `(r, c - 1)`
   - Right neighbor: `(r, c + 1)`
   - Bench Partner (if double-sharing): `(r, partnerCol)`
6. **Lookahead Candidate Swap Heuristic**:
   If the candidate shares `className` or `subjectCode` with an adjacent neighbor, the engine performs a lookahead scan down the remaining queue for the first student who has zero conflicts with the surrounding neighbors, swapping them into the seat.
7. **Graceful Fallback**:
   If a cohort has extreme demographic imbalance (e.g. 90% students from one class), the best available candidate is assigned, and the seat is flagged with `hasConflict: true` and an explicit note (e.g., `Same class (B.Tech CSE) with Front seat A2`).

---

## 🧪 Testing & Verification

### Sample Seed Cohort
- **Hall 101 - Main Exam Center**: 5 Rows × 6 Columns = 30 Seats (Single Desk)
- **Hall 102 - Science Wing**: 4 Rows × 5 Columns = 20 Seats (Single Desk)
- **Hall 103 - Seminar Hall**: 4 Rows × 4 Columns = 16 Seats (Double Sharing)
- **Total Capacity**: 66 Seats
- **Students**: 48 students across 4 engineering departments:
  - 12 in `B.Tech CSE` (Subject: `CS301`)
  - 12 in `B.Tech IT` (Subject: `IT302`)
  - 12 in `B.Tech ECE` (Subject: `EC303`)
  - 12 in `B.Tech MECH` (Subject: `ME304`)

### Verification Checklist:
- [x] Dashboard KPIs load dynamic counts from storage.
- [x] Add, edit, and delete student records with instant table updates.
- [x] Bulk import parses both CSV and JSON formats.
- [x] Add exam hall with real-time responsive grid preview.
- [x] Run allocation across 3 halls: distributes 48 students evenly with 0 conflicts.
- [x] Live search for roll number `CS2401` pulses and scrolls to seat `A1`.
- [x] Click any seat to inspect student details and 4-way neighbors.
- [x] Export room seating chart as CSV.
- [x] Print preview formats cleanly with exam header, grid, and attendance signature lines.
