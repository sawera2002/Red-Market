import React, { useState } from 'react';
import { Lock, Mail, Key, Eye, EyeOff, ShieldCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      const adminUser: AdminUser = {
        email: data.admin.email,
        name: data.admin.name,
        role: data.admin.role,
        token: data.token
      };

      // Save to localStorage for seamless session retention
      localStorage.setItem('rm_admin_token', data.token);
      localStorage.setItem('rm_admin_email', data.admin.email);
      localStorage.setItem('rm_admin_user', JSON.stringify(adminUser));

      onLoginSuccess(adminUser);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@redmarket.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="p-6 pb-4 border-b border-white/6 bg-gradient-to-b from-red-600/15 via-red-600/5 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Admin Authentication</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted area. Please sign in with administrator credentials to manage products, pricing, and customer orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@redmarket.com"
              className="w-full px-3.5 py-2.5 bg-[#171924] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 bg-[#171924] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials helper */}
          <div className="p-3 rounded-xl bg-[#171924] border border-white/8 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Default Admin Credentials:
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="text-[11px] font-mono text-zinc-300 bg-[#0d0e14] p-2 rounded-lg border border-white/5 flex flex-col gap-0.5">
              <span>Mail: <strong className="text-white">admin@redmarket.com</strong></span>
              <span>Pass: <strong className="text-white">admin123</strong></span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#171924] hover:bg-[#202331] text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
