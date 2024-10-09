import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const baseURL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5001'  // לאמולטור אנדרואיד
  : 'http://localhost:5001'; // לאמולטור iOS או מכשיר אמיתי

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
