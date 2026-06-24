const API_BASE = import.meta.env.VITE_XUANXUE_API_BASE || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.message || "请求失败");
    error.payload = payload;
    throw error;
  }
  return payload;
}

function authHeaders(session) {
  return session?.token ? { authorization: `Bearer ${session.token}` } : {};
}

export async function createReport(values, method, session) {
  return request("/api/reports", {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({ values, method }),
  });
}

export async function listReports(limit = 8, session) {
  return request(`/api/reports?limit=${limit}`, { headers: authHeaders(session) });
}

export async function checkApiHealth() {
  return request("/api/health");
}

export async function registerUser(values) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: values.account, password: values.password, name: values.nickname }),
  });
}

export async function loginUser(values) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: values.account, password: values.password }),
  });
}

export async function loginAdmin(values) {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ account: values.account, password: values.password, code: values.code }),
  });
}

export async function getAccount(session) {
  return request("/api/account", { headers: authHeaders(session) });
}

export async function getReportDetail(reportId, session) {
  return request(`/api/reports/${encodeURIComponent(reportId)}`, { headers: authHeaders(session) });
}

export async function createOrder(planId, session) {
  return request("/api/orders", {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({ planId }),
  });
}

export async function getOrderDetail(orderId, session) {
  return request(`/api/orders/${encodeURIComponent(orderId)}`, { headers: authHeaders(session) });
}
export async function markMockPaid(orderId, session) {
  return request(`/api/orders/${orderId}/mock-pay`, {
    method: "POST",
    headers: authHeaders(session),
  });
}

export async function getAdminOverview(session, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return request(`/api/admin/overview${query ? `?${query}` : ""}`, { headers: authHeaders(session) });
}
export async function updateAdminUser(userId, values, session) {
  return request(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(values),
  });
}

export async function markAdminOrderPaid(orderId, session) {
  return request(`/api/admin/orders/${encodeURIComponent(orderId)}/mark-paid`, {
    method: "POST",
    headers: authHeaders(session),
  });
}

export async function reviewAdminReport(reportId, values, session) {
  return request(`/api/admin/reports/${encodeURIComponent(reportId)}/review`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify(values),
  });
}
