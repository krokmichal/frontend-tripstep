// axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "https://backend-tripstep.onrender.com";

import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true, // kluczowe!
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
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

