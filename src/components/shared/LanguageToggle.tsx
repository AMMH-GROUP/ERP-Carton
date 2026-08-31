'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
      title={locale === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
    >
      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}
