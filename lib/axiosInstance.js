// lib/axiosInstance.js
import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000, // 10s timeout
});

// Optional retry helper
const retryRequest = async (error, retries = 1) => {
  if (retries > 0) {
    await new Promise((res) => setTimeout(res, 1500));
    return axiosInstance.request(error.config);
  }
  return Promise.reject(error);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const suppressToast = config.suppressToast;

    // Mark request as retry attempted
    if (!config.__isRetry) config.__isRetry = true;

    // Offline or no response
    if (!error.response) {
      if (!suppressToast) {
        if (!navigator.onLine) {
          toast.error("You're offline. Please check your internet connection.");
        } else {
          // toast.error("Network error. Retrying...");
        }
      }

      try {
        return await retryRequest(error);
      } catch (err) {
        if (!suppressToast) toast.error("Still not working. Please try again later.");
        return Promise.reject(err);
      }
    }

    // Handle known HTTP status codes
    const { status, data } = error.response;

    if (!suppressToast) {
      if (status === 404) {
        toast.warning(data?.message || "Data not found (404).");
      } else if (status === 500) {
        // toast.error("Server error (500). Please try again later.");
      } else if (status === 408 || status === 429) {
        toast.error("Request timeout or too many requests. Retrying...");
        try {
          return await retryRequest(error);
        } catch (err) {
          toast.error("Request still failed. Please refresh.");
        }
      } else {
        toast.error(`Error ${status}: ${data?.message || error.message}`);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
