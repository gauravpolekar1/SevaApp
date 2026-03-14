import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const SECRET_KEY = import.meta.env.VITE_API_SECRET;

// Use form-urlencoded for POST to avoid CORS preflight (Google Apps Script
// does not handle OPTIONS; only simple requests reach doPost with CORS headers).
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

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

const postForm = (action, payload) => {
  const body = new URLSearchParams();
  body.set('payload', JSON.stringify({ ...payload, secretKey: SECRET_KEY }));
  return client.post(`?action=${action}`, body.toString());
};

export const createSeva = (payload) => postForm('createSeva', payload);
export const createSevekari = (payload) => postForm('createSevekari', payload);
export const assignSeva = (payload) => postForm('assignSeva', payload);
