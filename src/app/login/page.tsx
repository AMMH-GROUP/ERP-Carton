'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/context';
import { Box, Lock, Mail, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

export default function LoginPage() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t('auth.invalidCredentials'));
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Control */}
      <div className="flex justify-between items-center z-10 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white">
              {t('app.shortTitle')}
            </h1>
            <p className="text-[10px] text-slate-400">
              {locale === 'ar' ? 'مصنع الكرتون المضلع' : 'Corrugated Carton Factory'}
            </p>
          </div>
        </div>

        <LanguageToggle />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto z-10 my-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white">
              {t('auth.login')}
            </h2>
            <p className="text-slate-400 text-xs mt-2">
              {locale === 'ar'
                ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم'
                : 'Enter your credentials to access the ERP dashboard'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/40"
                />
                <span>{t('auth.rememberMe')}</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>{t('common.loading')}</span>
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  {locale === 'ar' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 z-10">
        <p>© 2026 Corrugated Carton Factory ERP. All rights reserved.</p>
      </div>
    </div>
  );
}
