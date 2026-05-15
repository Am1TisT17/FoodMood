// Drop this file into the frontend at: src/lib/api.ts
//
// It provides a typed thin wrapper around the backend. The interfaces re-use
// the same names already declared in src/app/context/FoodMoodContext.tsx so the
// rest of the app needs zero changes.

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'foodmood_token';

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string | null) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch {}
    throw Object.assign(new Error(body?.error || `HTTP ${res.status}`), { status: res.status, body });
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ───── Types — mirror backend DTOs ─────
export interface UserDTO {
  id: string; name: string; email: string; role: string;
  stats: { foodSavedKg: number; co2Offset: number; moneySaved: number; wasteWarriorLevel: number };
}
export interface FoodItemDTO {
  id: string; name: string; category: string; quantity: number; unit: string;
  price: number; expiryDate: string; addedDate: string; image?: string; status?: string;
}

// ───── Recipe DTOs with ML fields ─────
export interface RecipeIngredientDTO {
  name: string; amount: string; inPantry: boolean;
}

export type RecipeUserPreference = 'liked' | 'disliked';

export interface RecipeDTO {
  id: string;
  name: string;
  matchPercentage: number;
  cookingTime: number;
  servings: number;
  ingredients: RecipeIngredientDTO[];
  instructions: string[];
  image: string;
  /** ML-only: personal relevance score (0-100). Higher = more relevant for this user. */
  personalRank?: number;
  mlInsight?: string;
  /** Saved taste from like / dismiss actions */
  userPreference?: RecipeUserPreference;
}

/** Metadata about how recommendations were generated. */
export interface RecommendMetaDTO {
  /** true if ML personalization was actually applied to this result set */
  personalizationApplied: boolean;
  /** Optional human-readable reason when personalization is off */
  personalizationDisabledReason?: string;
  /** ML model version or backend strategy identifier */
  modelVersion?: string;
  /** Timestamp of generation */
  generatedAt?: string;
  /** Any extra debug/analytics fields */
  [key: string]: any;
}

export interface RecommendRecipesResponseDTO {
  recipes: RecipeDTO[];
  /** Source of recommendations: 'ml' | 'rule' | 'popular' | 'fallback' */
  source: string;
  /** Metadata about generation */
  meta: RecommendMetaDTO;
  /** recipeId -> liked | disliked */
  preferences?: Record<string, RecipeUserPreference>;
}

export interface CommunityListingDTO {
  id: string; itemName: string; quantity: string; userName: string;
  image?: string; lat: number; lng: number; distance?: string; status?: string;
}
export interface ScannedItemDTO {
  name: string; price: string; expiryDate: string; confidence: number;
}

// ───── Extended Notification DTOs for ML responses ─────
export interface NotificationRecipePayloadDTO {
  id: string;
  name: string;
  image: string;
  matchPercentage: number;
  cookingTime: number;
  urgentIngredientsUsed?: string[];
  personalRank?: number;
  mlInsight?: string;
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string;
  payload?: any;
  read: boolean;
  createdAt: string;
  // ── ML-specific fields ──
  /** Canonical name of the expiring item (for expiry alerts from ML) */
  canonicalName?: string;
  /** Days until expiry */
  daysToExpiry?: number;
  /** Suggested recipes when ML sends a smart expiry alert */
  recipes?: NotificationRecipePayloadDTO[];
}

// ───── Feedback DTO for ML learning loop ─────
export type RecipeFeedbackAction =
  | 'view'
  | 'cooked'
  | 'dismissed'
  | 'like'
  | 'liked'
  | 'unliked'
  | 'clear';

export interface RecipeFeedbackDTO {
  recipeId: string;
  action: RecipeFeedbackAction;
  source?: string;
  timestamp?: string;
  scoreShown?: number;
  personalRank?: number;
  matchPercentage?: number;
}

// ───── API surface ─────
export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify(body),
    }).then((r) => { auth.setToken(r.token); return r; }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify(body),
    }).then((r) => { auth.setToken(r.token); return r; }),
  me: () => request<{ user: UserDTO }>('/api/auth/me'),
  logout: () => { auth.setToken(null); },

  // Inventory
  listInventory: () => request<{ items: FoodItemDTO[] }>('/api/inventory'),
  addItem: (item: Omit<FoodItemDTO, 'id'>) =>
    request<{ item: FoodItemDTO }>('/api/inventory', {
      method: 'POST', body: JSON.stringify(item),
    }),
  addItemsBatch: (items: Omit<FoodItemDTO, 'id'>[]) =>
    request<{ items: FoodItemDTO[] }>('/api/inventory/batch', {
      method: 'POST', body: JSON.stringify({ items }),
    }),
  updateItem: (id: string, patch: Partial<FoodItemDTO>) =>
    request<{ item: FoodItemDTO }>(`/api/inventory/${id}`, {
      method: 'PATCH', body: JSON.stringify(patch),
    }),
  removeItem: (id: string) => request<{ ok: true }>(`/api/inventory/${id}`, { method: 'DELETE' }),
  consumeItem: (id: string) =>
    request<{ item: FoodItemDTO; stats: UserDTO['stats'] }>(`/api/inventory/${id}/consume`, { method: 'POST' }),
  discardItem: (id: string) =>
    request<{ item: FoodItemDTO; stats: UserDTO['stats'] }>(`/api/inventory/${id}/discard`, { method: 'POST' }),
  shareItem: (id: string) =>
    request<{ item: FoodItemDTO; stats: UserDTO['stats'] }>(`/api/inventory/${id}/share`, { method: 'POST' }),

  // Recipes
  listRecipes: () => request<{ recipes: RecipeDTO[] }>('/api/recipes'),
  recommendRecipes: (limit = 12) =>
    request<RecommendRecipesResponseDTO>(`/api/recipes/recommend/me?limit=${limit}`),
  useRecipe: (id: string) =>
    request<{ consumed: FoodItemDTO[]; stats: UserDTO['stats'] }>(`/api/recipes/${id}/use`, { method: 'POST' }),

  // ───── ML Feedback loop ─────
  /** Send user interaction with a recipe back to the backend for ML training.
   *  The backend forwards this to /feedback on the ML service. */
  sendRecipeFeedback: (feedback: RecipeFeedbackDTO) =>
    request<{ ok: true; preference: RecipeUserPreference | null }>(
      '/api/recipes/feedback',
      {
        method: 'POST',
        body: JSON.stringify({
          ...feedback,
          timestamp: feedback.timestamp || new Date().toISOString(),
        }),
      }
    ),

  getRecipePreferences: () =>
    request<{ preferences: Record<string, RecipeUserPreference> }>(
      '/api/recipes/preferences'
    ),

  // Scanner
  scanReceipt: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return request<{ items: ScannedItemDTO[]; rawText: string; meanConfidence: number }>('/api/scan', {
      method: 'POST', body: fd,
    });
  },

  // Community
  listCommunity: (opts?: { lat?: number; lng?: number; radius?: number }) => {
    const q = new URLSearchParams();
    if (opts?.lat !== undefined) q.set('lat', String(opts.lat));
    if (opts?.lng !== undefined) q.set('lng', String(opts.lng));
    if (opts?.radius !== undefined) q.set('radius', String(opts.radius));
    const qs = q.toString();
    return request<{ listings: CommunityListingDTO[] }>(`/api/community${qs ? '?' + qs : ''}`);
  },
  shareToCommunity: (body: { itemName: string; quantity: string; image?: string; lat: number; lng: number }) =>
    request<{ listing: CommunityListingDTO }>('/api/community', {
      method: 'POST', body: JSON.stringify(body),
    }),
  claimCommunity: (id: string) =>
    request<{ listing: CommunityListingDTO }>(`/api/community/${id}/claim`, { method: 'POST' }),

  // Stats
  stats: () => request<{ stats: UserDTO['stats'] }>('/api/stats/me'),
  analytics: (weeks = 12) =>
    request<{ stats: UserDTO['stats']; weekly: any[]; categories: any[] }>(`/api/stats/analytics?weeks=${weeks}`),

  // Notifications
  notifications: () => request<{ notifications: NotificationDTO[] }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};