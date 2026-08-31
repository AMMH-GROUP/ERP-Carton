'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { CreditCard, Search, ArrowUpRight, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AccountsReceivablePage() {
  const { t, locale } = useTranslation();

  const mockAR = [
    {
      customer_code: 'CUST-001',
      customer_name_ar: 'شركة أثاث المستقبل ش.م.م',
      customer_name_en: 'Future Furniture Co.',
      total_due: 1420000,
      current: 850000,
      days_1_30: 420000,
      days_31_60: 150000,
      days_61_90: 0,
      over_90: 0,
    },
    {
      customer_code: 'CUST-003',
      customer_name_ar: 'مصنع الشرق للأجهزة الكهربائية',
      customer_name_en: 'Orient Electronics',
      total_due: 96900,
      current: 96900,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      over_90: 0,
    },
  ];

  const grandTotalAR = mockAR.reduce((s, c) => s + c.total_due, 0);

  return (
    <PermissionGate module="general_ledger" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'أعمار ديون العملاء (Accounts Receivable Aging)' : 'Accounts Receivable Aging'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'جدول أعمار ديون العملاء المستحقة، كشوف الحسابات والتأخيرات (PRD §55)'
                  : 'Customer accounts aging buckets (Current, 1-30, 31-60, 61-90, 90+ days)'}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2 rounded-xl text-start">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">
                {locale === 'ar' ? 'إجمالي ديون العملاء المستحقة' : 'Total Outstanding AR'}
              </span>
              <span className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 font-mono">
                {formatCurrency(grandTotalAR)}
              </span>
            </div>
          </div>

          {/* Aging Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('nav.customers')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'حالي (Current)' : 'Current'}</th>
                    <th className="p-3.5 text-start">1-30 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-start">31-60 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-start">61-90 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-end">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockAR.map((c) => (
                    <tr key={c.customer_code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {c.customer_code}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? c.customer_name_ar : c.customer_name_en}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600">{formatCurrency(c.current)}</td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(c.days_1_30)}</td>
                      <td className="p-3.5 font-mono text-amber-600 font-bold">{formatCurrency(c.days_31_60)}</td>
                      <td className="p-3.5 font-mono text-red-500 font-bold">{formatCurrency(c.days_61_90)}</td>
                      <td className="p-3.5 text-end font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(c.total_due)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
