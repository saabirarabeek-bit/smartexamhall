/**
 * StorageService - LocalStorage CRUD Helper
 * Manages client-side persistence for students, rooms, and exam allocations.
 * Namespaced keys ensure zero collision with other apps.
 */

const STORAGE_KEYS = {
  STUDENTS: 'exam_seat_app_students',
  ROOMS: 'exam_seat_app_rooms',
  ALLOCATIONS: 'exam_seat_app_allocations',
  EXAM_EVENTS: 'exam_seat_app_exam_events',
  SETTINGS: 'exam_seat_app_settings'
};

// Default seed dataset (48 students across 4 departments, 3 halls)
const DEFAULT_ROOMS_SEED = [
  {
    id: "room_101",
    roomName: "Hall 101 - Main Exam Center",
    rows: 5,
    columns: 6,
    capacity: 30,
    benchType: "single",
    description: "Ground floor main academic block"
  },
  {
    id: "room_102",
    roomName: "Hall 102 - Science Wing",
    rows: 4,
    columns: 5,
    capacity: 20,
    benchType: "single",
    description: "First floor north wing"
  },
  {
    id: "room_103",
    roomName: "Hall 103 - Seminar Hall",
    rows: 4,
    columns: 4,
    capacity: 16,
    benchType: "double",
    description: "Second floor quiet seminar hall"
  }
];

const DEFAULT_STUDENTS_SEED = [
  // Computer Science - Section A (CS301)
  { id: "stu_101", rollNumber: "CS2401", name: "Aarav Sharma", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_102", rollNumber: "CS2402", name: "Ananya Iyer", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_103", rollNumber: "CS2403", name: "Devansh Patel", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_104", rollNumber: "CS2404", name: "Diya Mukherjee", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_105", rollNumber: "CS2405", name: "Ishaan Gupta", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_106", rollNumber: "CS2406", name: "Kavya Nair", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_107", rollNumber: "CS2407", name: "Manav Verma", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_108", rollNumber: "CS2408", name: "Meera Reddy", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_109", rollNumber: "CS2409", name: "Nikhil Joshi", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_110", rollNumber: "CS2410", name: "Pooja Malhotra", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_111", rollNumber: "CS2411", name: "Pranav Rao", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_112", rollNumber: "CS2412", name: "Riya Sen", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },

  // Information Technology - Section A (IT302)
  { id: "stu_201", rollNumber: "IT2401", name: "Aditya Roy", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_202", rollNumber: "IT2402", name: "Bhavna Kapoor", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_203", rollNumber: "IT2403", name: "Chetan Das", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_204", rollNumber: "IT2404", name: "Deepika Pillai", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_205", rollNumber: "IT2405", name: "Gautam Mehta", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_206", rollNumber: "IT2406", name: "Harini Sundaram", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_207", rollNumber: "IT2407", name: "Kunal Bansal", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_208", rollNumber: "IT2408", name: "Lavanya Nambiar", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_209", rollNumber: "IT2409", name: "Madhav Singh", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_210", rollNumber: "IT2410", name: "Neha Saxena", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_211", rollNumber: "IT2411", name: "Omkar Kulkarni", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_212", rollNumber: "IT2412", name: "Parul Chawla", className: "B.Tech IT", section: "A", subjectCode: "IT302" },

  // Electronics & Communication - Section A (EC303)
  { id: "stu_301", rollNumber: "EC2401", name: "Abhinav Mishra", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_302", rollNumber: "EC2402", name: "Anjali Menon", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_303", rollNumber: "EC2403", name: "Arjun Bhat", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_304", rollNumber: "EC2404", name: "Divya Nagesh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_305", rollNumber: "EC2405", name: "Farhan Ali", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_306", rollNumber: "EC2406", name: "Isha Deshmukh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_307", rollNumber: "EC2407", name: "Karthik Srinivas", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_308", rollNumber: "EC2408", name: "Mansi Agrawal", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_309", rollNumber: "EC2409", name: "Naveen Tewari", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_310", rollNumber: "EC2410", name: "Pallavi Ghosh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_311", rollNumber: "EC2411", name: "Rahul Soni", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_312", rollNumber: "EC2412", name: "Sneha Hegde", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },

  // Mechanical Engineering - Section A (ME304)
  { id: "stu_401", rollNumber: "ME2401", name: "Aakash Choudhury", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_402", rollNumber: "ME2402", name: "Amrita Varma", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_403", rollNumber: "ME2403", name: "Brijesh Pandey", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_404", rollNumber: "ME2404", name: "Dinesh Solanki", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_405", rollNumber: "ME2405", name: "Geetika Kaul", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_406", rollNumber: "ME2406", name: "Himanshu Tiwari", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_407", rollNumber: "ME2407", name: "Jatin Singhal", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_408", rollNumber: "ME2408", name: "Kritika Bajaj", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_409", rollNumber: "ME2409", name: "Mayank Trivedi", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_410", rollNumber: "ME2410", name: "Nikita Biswas", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_411", rollNumber: "ME2411", name: "Rohit Chauhan", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_412", rollNumber: "ME2412", name: "Shweta Nair", className: "B.Tech MECH", section: "A", subjectCode: "ME304" }
];

const StorageService = {
  /**
   * Resolve localStorage key name
   */
  _getKey(collection) {
    const map = {
      students: STORAGE_KEYS.STUDENTS,
      rooms: STORAGE_KEYS.ROOMS,
      allocations: STORAGE_KEYS.ALLOCATIONS,
      examEvents: STORAGE_KEYS.EXAM_EVENTS,
      settings: STORAGE_KEYS.SETTINGS
    };
    return map[collection] || `exam_seat_app_${collection}`;
  },

  /**
   * Initialize and seed local storage if not already seeded
   */
  init(force = false) {
    try {
      const studentsKey = this._getKey('students');
      const roomsKey = this._getKey('rooms');

      if (force || !localStorage.getItem(studentsKey)) {
        localStorage.setItem(studentsKey, JSON.stringify(DEFAULT_STUDENTS_SEED));
      }
      if (force || !localStorage.getItem(roomsKey)) {
        localStorage.setItem(roomsKey, JSON.stringify(DEFAULT_ROOMS_SEED));
      }

      return true;
    } catch (err) {
      console.error('StorageService init error:', err);
      return false;
    }
  },

  /**
   * Reset data to default seed
   */
  resetToDefaults() {
    this.init(true);
    localStorage.removeItem(this._getKey('allocations'));
    localStorage.removeItem(this._getKey('examEvents'));
  },

  /**
   * Retrieve all items from a collection
   */
  getAll(collection) {
    try {
      this.init();
      const raw = localStorage.getItem(this._getKey(collection));
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error(`StorageService.getAll('${collection}') error:`, err);
      return [];
    }
  },

  /**
   * Retrieve single item by ID
   */
  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => String(item.id) === String(id)) || null;
  },

  /**
   * Create a new item in collection
   */
  create(collection, data) {
    try {
      const items = this.getAll(collection);
      const newItem = {
        id: data.id || `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
        ...data
      };
      items.push(newItem);
      localStorage.setItem(this._getKey(collection), JSON.stringify(items));
      return newItem;
    } catch (err) {
      console.error(`StorageService.create('${collection}') error:`, err);
      throw err;
    }
  },

  /**
   * Bulk create or replace items
   */
  bulkCreate(collection, newItems) {
    try {
      const items = this.getAll(collection);
      const stamped = newItems.map((item, idx) => ({
        id: item.id || `${collection.slice(0, 3)}_${Date.now()}_${idx}`,
        createdAt: new Date().toISOString(),
        ...item
      }));
      const combined = [...items, ...stamped];
      localStorage.setItem(this._getKey(collection), JSON.stringify(combined));
      return stamped;
    } catch (err) {
      console.error(`StorageService.bulkCreate('${collection}') error:`, err);
      throw err;
    }
  },

  /**
   * Update an item by ID
   */
  update(collection, id, patch) {
    try {
      const items = this.getAll(collection);
      const index = items.findIndex(item => String(item.id) === String(id));
      if (index === -1) {
        throw new Error(`Item with id "${id}" not found in ${collection}`);
      }

      items[index] = {
        ...items[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this._getKey(collection), JSON.stringify(items));
      return items[index];
    } catch (err) {
      console.error(`StorageService.update('${collection}', '${id}') error:`, err);
      throw err;
    }
  },

  /**
   * Delete an item by ID
   */
  remove(collection, id) {
    try {
      const items = this.getAll(collection);
      const filtered = items.filter(item => String(item.id) !== String(id));
      const deleted = items.length !== filtered.length;
      if (deleted) {
        localStorage.setItem(this._getKey(collection), JSON.stringify(filtered));
      }
      return deleted;
    } catch (err) {
      console.error(`StorageService.remove('${collection}', '${id}') error:`, err);
      throw err;
    }
  },

  /**
   * Save latest allocation result
   */
  saveAllocation(allocationResult) {
    try {
      localStorage.setItem(this._getKey('allocations'), JSON.stringify(allocationResult));
      return true;
    } catch (err) {
      console.error('StorageService.saveAllocation error:', err);
      return false;
    }
  },

  /**
   * Retrieve latest allocation result
   */
  getLatestAllocation() {
    try {
      const raw = localStorage.getItem(this._getKey('allocations'));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('StorageService.getLatestAllocation error:', err);
      return null;
    }
  }
};

// Ensure seeded on first load
StorageService.init();

// Export globally for browser scripts
window.StorageService = StorageService;
