import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { register } from '../api/auth';
import { User, Lock, Shield, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function RequestAccess() {
  const [view, setView] = useState('register'); // 'register' | 'success'

  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...regForm, role: 'CLIENT', status: 'pending' });
      setView('success');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl bg-white px-4 py-3 text-[14px] text-[#0b1a33] placeholder-[#b0b8c4] outline-none transition-all";
  const inputStyle = { border: '1px solid #dde3ec' };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {view === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: '#edf1f7', border: '1px solid #dde3ec' }}
              >
                <User size={26} strokeWidth={1.5} className="text-[#0b1a33]" />
              </div>
              <h1 className="font-serif text-[28px] md:text-[32px] font-bold text-[#0b1a33] leading-tight tracking-tight mb-2">
                Request Access
              </h1>
              <p className="text-[#6b7a8d] text-[14px]">Client onboarding for shared records</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">Full Name</label>
                <input type="text" required value={regForm.fullName} onChange={(e) => setRegForm({...regForm, fullName: e.target.value})} className={inputClass} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">Email</label>
                <input type="email" required value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} className={inputClass} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">Phone Number (Optional)</label>
                <input type="tel" value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} className={inputClass} style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">Password</label>
                  <input type="password" required value={regForm.password} onChange={(e) => setRegForm({...regForm, password: e.target.value})} className={inputClass} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6b7a8d] mb-2 uppercase tracking-[0.12em]">Confirm</label>
                  <input type="password" required value={regForm.confirm} onChange={(e) => setRegForm({...regForm, confirm: e.target.value})} className={inputClass} style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#0b1a33'; e.target.style.boxShadow = '0 0 0 2px rgba(11,26,51,0.06)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#dde3ec'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg text-[13px] font-medium text-[#b91c1c]"
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-4">
                <Link
                  to="/login"
                  className="px-5 py-3.5 text-[13px] font-semibold text-[#6b7a8d] hover:text-[#0b1a33] rounded-xl transition-colors flex items-center gap-1.5 hover:bg-[#f0ede8]"
                >
                  <ArrowLeft size={14} strokeWidth={2} />
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl text-white py-3.5 text-[14px] font-semibold transition-all disabled:opacity-60 flex justify-center items-center gap-2"
                  style={{ backgroundColor: '#0b1a33', boxShadow: '0 2px 12px rgba(11,26,51,0.15)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#142544'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0b1a33'; }}
                >
                  {loading ? 'Submitting...' : (
                    <>Submit Request <Lock size={14} strokeWidth={2} className="opacity-60" /></>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#ecfdf5', border: '2px solid #a7f3d0' }}
            >
              <Shield size={36} strokeWidth={1.5} className="text-[#059669]" />
            </div>
            <h2 className="font-serif text-[24px] font-bold mb-3 text-[#0b1a33]">Registration Submitted</h2>
            <p className="text-[#6b7a8d] text-[14px] mb-10 leading-relaxed max-w-sm mx-auto">
              Your request has been submitted for administrative review. Your account will become available after a registry administrator approves it.
            </p>
            <Link
              to="/login"
              className="block w-full text-center rounded-xl px-8 py-3.5 text-[14px] font-semibold text-[#0b1a33] transition-all hover:bg-[#f0ede8]"
              style={{ border: '2px solid #dde3ec' }}
            >
              Return to Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
