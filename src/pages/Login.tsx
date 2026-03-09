import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Building2, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('nitantupasani@gmail.com');
  const [password, setPassword] = useState('admin123');

  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin') navigate('/admin', { replace: true });
    else if (user.role === 'tenant_facility_manager' || user.role === 'building_facility_manager')
      navigate('/fm', { replace: true });
    else navigate('/presence', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center mb-3">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ComfortOS</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Building Platform</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>

        {/* Demo credential helper */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-400 text-center">Demo Accounts</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Admin', email: 'nitantupasani@gmail.com', pw: 'admin123' },
              { label: 'Occupant', email: 'occupant@comfortos.com', pw: 'occupant123' },
              { label: 'Facility Manager', email: 'fm@comfortos.com', pw: 'fm123' },
            ].map((cred) => (
              <button
                key={cred.label}
                type="button"
                onClick={() => { setEmail(cred.email); setPassword(cred.pw); }}
                className="text-xs text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg px-3 py-2 text-left"
              >
                <span className="font-medium">{cred.label}:</span> {cred.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
