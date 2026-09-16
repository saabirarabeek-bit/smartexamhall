/**
 * ApiService - Fetch wrapper simulating REST API network calls
 * Connects to http://localhost:5000/api when available,
 * with artificial latency to demonstrate asynchronous loading states.
 */

const API_BASE_URL = 'http://localhost:5000/api';

const ApiService = {
  // Artificial delay in milliseconds to simulate network latency
  simulatedDelayMs: 350,

  /**
   * Helper delay promise
   */
  _delay(ms = this.simulatedDelayMs) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Safe fetch with fallback
   */
  async _request(endpoint, options = {}) {
    await this._delay();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (networkErr) {
      console.warn(`[ApiService] Network call to ${endpoint} failed or backend offline. Falling back to local StorageService.`, networkErr.message);
      return { _fallback: true, error: networkErr.message };
    }
  },

  // Students endpoints
  async getStudents() {
    const res = await this._request('/students');
    if (res._fallback) {
      return { success: true, data: StorageService.getAll('students'), source: 'localStorage' };
    }
    return { ...res, source: 'backend' };
  },

  async createStudent(studentData) {
    const res = await this._request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    return res;
  },

  async updateStudent(id, studentData) {
    const res = await this._request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
    return res;
  },

  async deleteStudent(id) {
    const res = await this._request(`/students/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  // Rooms endpoints
  async getRooms() {
    const res = await this._request('/rooms');
    if (res._fallback) {
      return { success: true, data: StorageService.getAll('rooms'), source: 'localStorage' };
    }
    return { ...res, source: 'backend' };
  },

  async createRoom(roomData) {
    const res = await this._request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
    return res;
  },

  async updateRoom(id, roomData) {
    const res = await this._request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
    return res;
  },

  async deleteRoom(id) {
    const res = await this._request(`/rooms/${id}`, {
      method: 'DELETE'
    });
    return res;
  },

  // Allocation endpoint
  async requestBackendAllocation(payload) {
    return await this._request('/allocate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

window.ApiService = ApiService;
