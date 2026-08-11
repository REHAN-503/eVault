import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Card header */}
        <div className="flex flex-col items-center mb-9">
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: '#edf1f7', border: '1px solid #dde3ec' }}
          >
            <Shield size={26} strokeWidth={1.5} className="text-[#0b1a33]" />
          </div>
          <h1 className="font-serif text-[28px] md:text-[32px] font-bold text-[#0b1a33] leading-tight tracking-tight mb-2">
            Secure Sign In
          </h1>
          <p className="text-[#6b7a8d] text-[14px]">Access the legal records portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">
              Email / User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={17} strokeWidth={1.8} className="text-[#9ca3af]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white pl-11 pr-4 py-3.5 text-[14px] text-[#0b1a33] placeholder-[#b0b8c4] outline-none transition-all"
                style={{ border: '1px solid #dde3ec' }}
                onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                placeholder="user@registry.gov.in"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={17} strokeWidth={1.8} className="text-[#9ca3af]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white pl-11 pr-12 py-3.5 text-[14px] text-[#0b1a33] placeholder-[#b0b8c4] outline-none transition-all"
                style={{ border: '1px solid #dde3ec' }}
                onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9ca3af] hover:text-[#6b7a8d] transition-colors"
              >
                {showPassword
                  ? <EyeOff size={17} strokeWidth={1.8} />
                  : <Eye size={17} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[15px] h-[15px] rounded border-gray-300 text-[#0b1a33] focus:ring-[#0b1a33] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[13px] text-[#5e6b7a] group-hover:text-[#0b1a33] transition-colors">Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => toast.info('Password recovery is disabled in this mock environment')}
              className="text-[13px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg text-[13px] font-medium text-[#b91c1c]"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl text-white py-4 text-[14px] font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 group mt-2"
            style={{
              backgroundColor: '#0b1a33',
              boxShadow: '0 2px 12px rgba(11,26,51,0.15)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#142544'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0b1a33'; }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock size={15} strokeWidth={2} className="opacity-60" />
                <span>Sign In</span>
                <ArrowRight size={15} strokeWidth={2} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
          <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em]">OR</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Request Access */}
        <p className="text-center text-[14px] text-[#5e6b7a]">
          Don't have an account?{' '}
          <Link
            to="/request-access"
            className="font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors inline-flex items-center gap-1"
          >
            Request Access
            <ArrowRight size={14} strokeWidth={2.5} className="inline" />
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
