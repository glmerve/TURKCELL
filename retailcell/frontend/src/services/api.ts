/**
 * RetailCell Frontend API Service Client
 * Connects Frontend pages and modals directly to Microservice Endpoints
 * (Identity: 8001, Inventory: 8002, AI: 8003, Gamification: 8004 or Gateway: 8080)
 */

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
const IDENTITY_URL = process.env.NEXT_PUBLIC_IDENTITY_URL || "http://localhost:8001";
const INVENTORY_URL = process.env.NEXT_PUBLIC_INVENTORY_URL || "http://localhost:8002";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8003";
const GAMIFICATION_URL = process.env.NEXT_PUBLIC_GAMIFICATION_URL || "http://localhost:8004";

// Helper fetch wrapper
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`API call failed for ${url}, using fallback mode.`, err);
    return null;
  }
}

// ----------------------------------------------------
// 🔐 1. IDENTITY SERVICE ENDPOINTS
// ----------------------------------------------------
export const identityApi = {
  // POST /api/v1/auth/login
  login: (email: string, password: string) =>
    apiRequest(`${IDENTITY_URL}/api/v1/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // GET /api/v1/users/
  getUsers: (page = 1, pageSize = 20) =>
    apiRequest(`${IDENTITY_URL}/api/v1/users/?page=${page}&page_size=${pageSize}`),

  // GET /api/v1/audit-logs/
  getAuditLogs: (page = 1, pageSize = 20) =>
    apiRequest(`${IDENTITY_URL}/api/v1/audit-logs/?page=${page}&page_size=${pageSize}`),
};

// ----------------------------------------------------
// 📦 2. INVENTORY SERVICE ENDPOINTS
// ----------------------------------------------------
export const inventoryApi = {
  // GET /api/v1/products/
  getProducts: (category?: string, status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return apiRequest(`${INVENTORY_URL}/api/v1/products/?${params.toString()}`);
  },

  // POST /api/v1/products/
  createProduct: (productData: any) =>
    apiRequest(`${INVENTORY_URL}/api/v1/products/`, {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  // GET /api/v1/supply-requests/
  getSupplyRequests: (status?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    return apiRequest(`${INVENTORY_URL}/api/v1/supply-requests/?${params.toString()}`);
  },

  // POST /api/v1/supply-requests/
  createSupplyRequest: (requestData: any, requesterId = "usr-admin-001") =>
    apiRequest(`${INVENTORY_URL}/api/v1/supply-requests/?requester_id=${requesterId}`, {
      method: "POST",
      body: JSON.stringify(requestData),
    }),

  // GET /api/v1/dashboard/stats
  getDashboardStats: () =>
    apiRequest(`${INVENTORY_URL}/api/v1/dashboard/stats`),

  // GET /api/v1/dashboard/risk-distribution
  getRiskDistribution: () =>
    apiRequest(`${INVENTORY_URL}/api/v1/dashboard/risk-distribution`),

  // GET /api/v1/dashboard/priority-distribution
  getPriorityDistribution: () =>
    apiRequest(`${INVENTORY_URL}/api/v1/dashboard/priority-distribution`),
};

// ----------------------------------------------------
// 🤖 3. AI SERVICE ENDPOINTS
// ----------------------------------------------------
export const aiApi = {
  // POST /api/v1/ai/forecast
  forecastDemand: (params: any) =>
    apiRequest(`${AI_URL}/api/v1/ai/forecast`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // POST /api/v1/ai/risk
  classifyRisk: (params: any) =>
    apiRequest(`${AI_URL}/api/v1/ai/risk`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // GET /api/v1/ai/accuracy
  getAccuracyMetrics: () =>
    apiRequest(`${AI_URL}/api/v1/ai/accuracy`),

  // POST /api/v1/ai/retrain
  retrainModel: () =>
    apiRequest(`${AI_URL}/api/v1/ai/retrain`, {
      method: "POST",
    }),
};

// ----------------------------------------------------
// 🏆 4. GAMIFICATION SERVICE ENDPOINTS
// ----------------------------------------------------
export const gamificationApi = {
  // GET /api/v1/gamification/leaderboard
  getLeaderboard: (limit = 20, region?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (region) params.append("region", region);
    return apiRequest(`${GAMIFICATION_URL}/api/v1/gamification/leaderboard?${params.toString()}`);
  },

  // GET /api/v1/gamification/badges/catalog
  getBadgeCatalog: () =>
    apiRequest(`${GAMIFICATION_URL}/api/v1/gamification/badges/catalog`),

  // GET /api/v1/gamification/profiles/{user_id}
  getUserProfile: (userId: string) =>
    apiRequest(`${GAMIFICATION_URL}/api/v1/gamification/profiles/${userId}`),
};
