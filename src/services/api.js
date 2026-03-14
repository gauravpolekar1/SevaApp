const API_URL = import.meta.env.VITE_API_URL;
const SECRET_KEY = import.meta.env.VITE_API_SECRET;

// GET via JSONP to avoid CORS (script tag).
const getViaJsonp = (action) =>
  new Promise((resolve, reject) => {
    if (!API_URL) {
      reject(new Error('VITE_API_URL is not configured.'));
      return;
    }

    const callbackName = `gasJsonp_${action}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);

    const script = document.createElement('script');
    const timeoutMs = 15000;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window[callbackName];
    };

    window[callbackName] = (payload) => {
      cleanup();
      resolve({ data: payload });
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`JSONP request failed for action: ${action}`));
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error(`JSONP request timed out for action: ${action}`));
    }, timeoutMs);

    script.src = url.toString();
    document.body.appendChild(script);
  });

export const getSevas = () => getViaJsonp('getSevas');
export const getSevekari = () => getViaJsonp('getSevekari');
export const getAssignments = () => getViaJsonp('getAssignments');
export const getSchedule = () => getViaJsonp('getSchedule');

// POST as simple request (text/plain) to avoid CORS preflight; backend accepts JSON body.
const postSimple = async (action, payload) => {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured.');
  }
  const url = `${API_URL.replace(/\?$/, '')}${API_URL.includes('?') ? '&' : '?'}action=${encodeURIComponent(action)}`;
  const body = JSON.stringify({ ...payload, secretKey: SECRET_KEY, action });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body,
  });

  let parsed;
  const contentType = response.headers.get('Content-Type') || '';
  try {
    if (contentType.includes('application/json')) {
      parsed = await response.json();
    } else {
      const text = await response.text();
      parsed = text ? JSON.parse(text) : {};
    }
  } catch {
    parsed = { success: false, message: 'Invalid response from server' };
  }

  if (!response.ok) {
    const err = new Error(parsed?.message || `Request failed (${response.status})`);
    err.response = { data: parsed, status: response.status };
    throw err;
  }

  return { data: parsed };
};

export const createSeva = (payload) => postSimple('createSeva', payload);
export const createSevekari = (payload) => postSimple('createSevekari', payload);
export const assignSeva = (payload) => postSimple('assignSeva', payload);
