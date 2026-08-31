'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Search, User, LogOut, Shield, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePermissions } from '@/lib/permissions/context';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { t, locale } = useTranslation();
  const { isSuperAdmin, roles } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);

  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Sidebar Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('actions.search') + " (SO-2026-001, Customer, PO...)"}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <NotificationBell />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-start">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isSuperAdmin ? 'Admin' : roles[0] || 'User'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isSuperAdmin ? (locale === 'ar' ? 'مدير النظام' : 'Super Admin') : 'Staff'}
              </p>
            </div>
          </button>

          {userDropdown && (
            <div className="absolute right-0 ltr:right-0 rtl:left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Carton ERP Staff
                </p>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 px-1.5 py-0.5 rounded font-medium mt-1">
                    <Shield className="w-3 h-3" /> Super Admin
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-start px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
