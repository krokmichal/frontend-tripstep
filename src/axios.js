// axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "http://localhost:8000";

import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://backend-tripstep.onrender.com/api',
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  console.log('Żądanie Axios:', config);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    console.log('Odpowiedź Axios:', response);
    return response;
  },
  (error) => {
    console.error('Błąd Axios:', error.response || error);
    return Promise.reject(error);
  }
);

export default instance;

