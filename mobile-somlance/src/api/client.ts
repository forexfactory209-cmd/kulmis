import axios from 'axios';
import Constants from 'expo-constants';

let LOCAL_IP = '192.168.1.102'; // Fallback

// Dynamically resolve the IP from Expo's development bundler
const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  LOCAL_IP = hostUri.split(':')[0];
}

const API_BASE_URL = `http://${LOCAL_IP}:5000/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use dynamic require to avoid circular dependency
      const { useAuthStore } = require('../store/authStore');
      const logout = useAuthStore.getState().logout;
      if (logout) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
