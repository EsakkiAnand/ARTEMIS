import axios from 'axios';

const API_URL = 'http://localhost:8000/simulation';

let authToken = localStorage.getItem('artemis_token');

const getConfig = () => ({
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});

export const api = {
  setToken: (token: string) => { authToken = token; },
  startSimulation: () => axios.post(`${API_URL}/start`, {}, getConfig()),
  stopSimulation: () => axios.post(`${API_URL}/stop`, {}, getConfig()),
  getStatus: () => axios.get(`${API_URL}/status`, getConfig()),
  getReportUrl: () => `${API_URL}/report?token=${authToken}`
};
