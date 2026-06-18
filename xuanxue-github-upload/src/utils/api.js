const API_BASE = import.meta.env.VITE_XUANXUE_API_BASE || "http://127.0.0.1:8787";

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

export async function createReport(values, method) {
  return request("/api/reports", {
    method: "POST",
    body: JSON.stringify({ values, method }),
  });
}

export async function listReports(limit = 8) {
  return request(`/api/reports?limit=${limit}`);
}

export async function checkApiHealth() {
  return request("/api/health");
}
