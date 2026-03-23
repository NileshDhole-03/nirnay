import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Lazy store reference — avoids circular dependency.
// Set via setupAxiosInterceptors() called from App.jsx after store is ready.
let _dispatch = null;

export const setAxiosDispatch = (dispatch) => {
    _dispatch = dispatch;
};

// Response interceptor: handle session invalidation from another device
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error.response?.data;
        if (
            error.response?.status === 401 &&
            data?.error === 'SESSION_INVALIDATED' &&
            _dispatch
        ) {
            // Dynamically import to avoid circular dep at load time
            import('../authSlice').then(({ sessionExpired }) => {
                _dispatch(sessionExpired());
            });
        }
        return Promise.reject(error);
    }
);

export default axiosClient;