const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function getAuthHeader() {
  const token = localStorage.getItem('kaamsetu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request('/auth/me'),
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
  },

  // Workers
  workers: {
    search: (params = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.city) query.append('city', params.city);
      if (params.verifiedOnly) query.append('verifiedOnly', 'true');
      if (params.availableOnly) query.append('availableOnly', 'true');
      if (params.maxRate) query.append('maxRate', params.maxRate);
      if (params.customerLat != null) query.append('customerLat', params.customerLat);
      if (params.customerLon != null) query.append('customerLon', params.customerLon);
      if (params.maxDistanceKm != null) query.append('maxDistanceKm', params.maxDistanceKm);
      if (params.sortByDistance) query.append('sortByDistance', 'true');
      return request(`/workers/search?${query.toString()}`);
    },
    getById: (id) => request(`/workers/${id}`),
    getMyProfile: () => request('/workers/me'),
    updateProfile: (profileData) =>
      request('/workers/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    toggleAvailability: () =>
      request('/workers/me/availability', {
        method: 'PATCH',
      }),
    updateLocation: (locationData) =>
      request('/workers/me/location', {
        method: 'PATCH',
        body: JSON.stringify(locationData),
      }),
  },

  // Bookings
  bookings: {
    create: (bookingData) =>
      request('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),
    getCustomerBookings: () => request('/bookings/customer'),
    getWorkerBookings: () => request('/bookings/worker'),
    getById: (id) => request(`/bookings/${id}`),
    updateStatus: (id, statusData) =>
      request(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }),
    updateLocation: (id, locationData) =>
      request(`/bookings/${id}/location`, {
        method: 'PATCH',
        body: JSON.stringify(locationData),
      }),
    getLiveTracking: (id) => request(`/bookings/${id}/live-tracking`),
  },

  // Reviews
  reviews: {
    add: (reviewData) =>
      request('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    getForWorker: (workerId) => request(`/reviews/worker/${workerId}`),
    reply: (reviewId, reply) =>
      request(`/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ workerReply: reply }),
      }),
  },

  // Direct In-App Chat
  messages: {
    getForBooking: (bookingId) => request(`/messages/booking/${bookingId}`),
    send: (bookingId, message) =>
      request(`/messages/booking/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    getUnreadCount: () => request('/notifications/unread-count'),
    markAllRead: () =>
      request('/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getWorkers: () => request('/admin/workers'),
    verifyWorker: (workerId, verificationData) =>
      request(`/admin/workers/${workerId}/verify`, {
        method: 'POST',
        body: JSON.stringify(verificationData),
      }),
    getBookings: () => request('/admin/bookings'),
    getUsers: () => request('/admin/users'),
    toggleUserStatus: (userId) =>
      request(`/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      }),
  },
};

