import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const SECRET_KEY = import.meta.env.VITE_API_SECRET;

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSevas = () => client.get('', { params: { action: 'getSevas' } });
export const getSevekari = () => client.get('', { params: { action: 'getSevekari' } });
export const getAssignments = () => client.get('', { params: { action: 'getAssignments' } });
export const getSchedule = () => client.get('', { params: { action: 'getSchedule' } });

export const createSeva = (payload) =>
  client.post('?action=createSeva', { ...payload, secretKey: SECRET_KEY });

export const createSevekari = (payload) =>
  client.post('?action=createSevekari', { ...payload, secretKey: SECRET_KEY });

export const assignSeva = (payload) =>
  client.post('?action=assignSeva', { ...payload, secretKey: SECRET_KEY });
