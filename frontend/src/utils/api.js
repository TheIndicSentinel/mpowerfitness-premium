import axios from 'axios';

/* ── Resolve the API base URL ───────────────────────────────────────
   REACT_APP_API_URL is baked in at BUILD time. Priority:
     1. REACT_APP_API_URL env (set on Render via render.yaml / dashboard)
     2. On localhost dev → http://localhost:5000/api
     3. On any deployed host with no env set → same-origin /api
        (works if the API is reverse-proxied under the web origin; if the
        backend is a separate Render service, set REACT_APP_API_URL.)
   A missing env on a deployed build is the #1 cause of "works locally,
   fails when hosted" — we warn loudly so it's easy to diagnose.        */
const resolveApiBase = () => {
  const env = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  if (env) return env.includes('/api') ? env : `${env}/api`;

  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : 'localhost';
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  if (isLocal) return 'http://localhost:5000/api';

  // Deployed but no API URL configured — fall back to same-origin /api and warn.
  if (isBrowser && process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[MPower] REACT_APP_API_URL is not set for this build. Falling back to ' +
      'same-origin "/api". If your backend is a separate service, set ' +
      'REACT_APP_API_URL to its URL and rebuild.'
    );
  }
  return `${isBrowser ? window.location.origin : ''}/api`;
};

const BASE_URL = resolveApiBase();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // generous: Render free-tier cold starts can be slow
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('mpower-auth');
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.accessToken) config.headers['Authorization'] = `Bearer ${state.accessToken}`;
    }
  } catch {}
  return config;
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const code     = error.response?.data?.code;

    // ── 1. Auto-refresh on 401 TOKEN_EXPIRED ──
    if (status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const { default: useAuthStore } = await import('../store/authStore');
        const ok = await useAuthStore.getState().refreshAccessToken();
        if (ok) {
          const raw = localStorage.getItem('mpower-auth');
          if (raw) {
            const { state } = JSON.parse(raw);
            if (state?.accessToken) original.headers['Authorization'] = `Bearer ${state.accessToken}`;
          }
          return api(original);
        }
      } catch {}
    }

    // ── 2. Backend cold start: DB still warming up (503) OR a network/timeout
    //    error reaching a sleeping Render service. Retry a few times with
    //    backoff so the first request after the service wakes still succeeds. ──
    const isWarming   = status === 503 && code === 'DB_WARMING_UP';
    const isColdStart = !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error');
    if ((isWarming || isColdStart) && original && !original._coldStartDone) {
      original._coldRetries = (original._coldRetries || 0) + 1;
      const MAX = 5;
      if (original._coldRetries <= MAX) {
        await sleep(Math.min(1500 * original._coldRetries, 6000)); // 1.5s → 6s
        return api(original);
      }
      original._coldStartDone = true;
    }

    return Promise.reject(error);
  }
);

export default api;
