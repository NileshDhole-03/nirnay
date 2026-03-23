import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin, devLogin, clearAuthError } from '../authSlice';
import { Code2 } from 'lucide-react';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/Homepage');
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(clearAuthError());
      dispatch(googleLogin(credentialResponse.credential));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative Elements - Left */}
      <div className="absolute bottom-0 left-0 w-80 h-80 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="20" y="100" width="40" height="80" fill="#fed7aa" rx="4" />
          <rect x="70" y="80" width="40" height="100" fill="#fbbf24" rx="4" />
          <rect x="120" y="120" width="40" height="60" fill="#fed7aa" rx="4" />
          <circle cx="170" cy="90" r="25" fill="none" stroke="#d1d5db" strokeWidth="2" />
          <path d="M160 70 Q180 50 190 70" stroke="#d1d5db" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Decorative Elements - Right */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="40" y="80" width="50" height="100" fill="#fde68a" rx="4" />
          <rect x="100" y="100" width="50" height="80" fill="#fed7aa" rx="4" />
          <circle cx="60" cy="50" r="20" fill="none" stroke="#d1d5db" strokeWidth="2" />
          <path d="M80 30 Q100 10 120 30" stroke="#d1d5db" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Illustration - Person on laptop */}
      <div className="absolute bottom-10 left-10 w-48 h-48 opacity-30 hidden lg:block">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="40" y="120" width="60" height="50" fill="#9ca3af" rx="4" />
          <ellipse cx="70" cy="100" rx="20" ry="25" fill="#374151" />
          <circle cx="70" cy="70" r="15" fill="#fcd34d" />
          <path d="M55 65 Q70 50 85 65" fill="#1f2937" />
          <rect x="85" y="105" width="35" height="25" fill="#4b5563" rx="2" />
          <rect x="80" y="130" width="45" height="5" fill="#6b7280" rx="1" />
          <path d="M55 95 Q45 110 60 115" stroke="#374151" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M85 95 Q95 100 90 110" stroke="#374151" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="relative bg-white rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md p-8 sm:p-10">

        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
              <Code2 className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">NIRNAY</span>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" /></svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h1>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Back!</h1>
          <p className="text-gray-400 text-sm">Sign in with Google to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
            {typeof error === 'string' ? error : 'Sign in failed. Please try again.'}
          </div>
        )}

        {/* Google Login */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-full h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => dispatch(clearAuthError())}
              theme="outline"
              size="large"
              type="standard"
              shape="rectangular"
              text="continue_with"
              width="100%"
            />
          )}
        </div>

        {/* Development Only Login Bypass */}
        {import.meta.env.DEV && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <button
              onClick={() => dispatch(devLogin())}
              disabled={loading}
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl flex items-center justify-center transition-colors"
            >
              1-Click Dev Login (Localhost only)
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">Visible only in development mode to bypass Google Auth</p>
          </div>
        )}

        {/* Bottom note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          New users get <span className="text-orange-500 font-semibold">50 free credits</span> on signup
        </p>
      </div>
    </div>
  );
}

export default Login;