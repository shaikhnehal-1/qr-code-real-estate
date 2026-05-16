import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-brand-900/5"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-950 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-accent-400" />
          </div>
          <h1 className="text-3xl font-sans font-bold mb-2 text-brand-950 tracking-tight">Admin Portal</h1>
          <p className="text-brand-900/40 text-sm tracking-wide">Enter your credentials to access the console</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-900/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-900/20" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@estatepulse.com"
                className="w-full bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-900/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-900/20" />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-50 border-transparent focus:border-accent-400/50 focus:bg-white focus:ring-4 focus:ring-accent-400/5 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-4 rounded-xl border border-red-100"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] font-bold hover:bg-accent-700 shadow-lg shadow-accent-600/20 transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Sign In To Console'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-brand-900/30 leading-relaxed uppercase tracking-widest">
            Restricted Access Area.<br/>Logins are monitored for security.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
