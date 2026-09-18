import {
  hostels as mockHostels,
  rooms as mockRooms,
  students as mockStudents,
  complaints as mockComplaints,
  notifications as mockNotifications,
  attendance as mockAttendance,
  payments as mockPayments,
  matches as mockMatches,
  currentStudent as mockCurrentStudent,
  stats as mockStats,
  occupancyByHostel as mockOccupancy,
} from "./mock-data";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bit_auth_token");
  }
  return null;
}

export function setToken(token) {
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("bit_auth_token", token);
    else localStorage.removeItem("bit_auth_token");
  }
}

export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("bit_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // Fallback
      }
    }
  }
  return mockCurrentStudent;
}

export function setCurrentUser(user) {
  if (typeof window !== "undefined") {
    if (user) localStorage.setItem("bit_user", JSON.stringify(user));
    else localStorage.removeItem("bit_user");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.error || `HTTP Error ${res.status}` };
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Network error (${endpoint}): ${err.message}`);
    return {
      error:
        "Cannot connect to backend server. Make sure the Express server is running on port 5000.",
    };
  }
}

// AUTH API
export async function apiLogin(regNo, password, role) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ regNo, password, role }),
  });

  if (result && result.token) {
    setToken(result.token);
    if (result.user) setCurrentUser(result.user);
  }

  return result;
}

export async function apiRegister(studentData) {
  const result = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(studentData),
  });

  if (result && result.token) {
    setToken(result.token);
    if (result.user) setCurrentUser(result.user);
  }

  return result;
}

export async function apiGetMe() {
  const data = await request("/auth/me");
  return data || mockCurrentStudent;
}

// HOSTELS API
export async function apiGetHostels(type = "All", search = "") {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (search) params.append("search", search);

  const data = await request(`/hostels?${params.toString()}`);
  if (data) return data;

  // Fallback mock filtering
  return mockHostels.filter(
    (h) =>
      (type === "All" || h.type === type) && h.name.toLowerCase().includes(search.toLowerCase()),
  );
}

export async function apiGetHostelById(id) {
  const data = await request(`/hostels/${id}`);
  if (data) return data;

  const hostel = mockHostels.find((h) => h.id === id);
  const rooms = mockRooms.filter((r) => r.hostelId === id);
  return { hostel, rooms };
}

// ROOMMATES API
export async function apiGetRoommateMatches(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/roommates/matches?${query}`);
  return data || mockMatches;
}

export async function apiSendRoommateRequest(payload) {
  const res = await request("/roommates/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res || { success: true };
}

// COMPLAINTS API
export async function apiGetComplaints(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/complaints?${query}`);
  return data || mockComplaints;
}

export async function apiCreateComplaint(payload) {
  const res = await request("/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res || { ...payload, id: `C${Date.now().toString().slice(-3)}`, status: "Pending" };
}

// PAYMENTS API
export async function apiGetPayments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/payments?${query}`);
  return data || mockPayments;
}

// ATTENDANCE API
export async function apiGetAttendance(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/attendance?${query}`);
  return data || mockAttendance;
}

// NOTIFICATIONS API
export async function apiGetNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/notifications?${query}`);
  return data || mockNotifications;
}

// DASHBOARD STATS API
export async function apiGetStats() {
  const data = await request("/stats");
  if (data) return data;
  return { stats: mockStats, occupancyByHostel: mockOccupancy };
}
