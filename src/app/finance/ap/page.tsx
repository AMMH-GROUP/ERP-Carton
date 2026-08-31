'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { CreditCard, Search, ArrowDownRight, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AccountsPayablePage() {
  const { t, locale } = useTranslation();

  const mockAP = [
    {
      supplier_code: 'SUPP-001',
      supplier_name_ar: 'شركة النيل للورق الخام والكرتون',
      supplier_name_en: 'Nile Paper Raw Materials Co.',
      total_due: 1625000,
      current: 1625000,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
    },
    {
      supplier_code: 'SUPP-002',
      supplier_name_ar: 'الشركة العالمية للمواد اللاصقة والنشا',
      supplier_name_en: 'Global Starch Ltd',
      total_due: 90000,
      current: 0,
      days_1_30: 90000,
      days_31_60: 0,
      days_61_90: 0,
    },
  ];

  const grandTotalAP = mockAP.reduce((s, c) => s + c.total_due, 0);

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
                  {locale === 'ar' ? 'أعمار ديون الموردين (Accounts Payable Aging)' : 'Accounts Payable Aging'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'جدول مستحقات الموردين ومواعيد الاستحقاق وجدولة السداد (PRD §48-49)'
                  : 'Supplier accounts payable aging buckets and payment scheduling'}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2 rounded-xl text-start">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">
                {locale === 'ar' ? 'إجمالي مستحقات الموردين' : 'Total Outstanding AP'}
              </span>
              <span className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 font-mono">
                {formatCurrency(grandTotalAP)}
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
                    <th className="p-3.5 text-start">{t('nav.suppliers')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'حالي (Current)' : 'Current'}</th>
                    <th className="p-3.5 text-start">1-30 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-start">31-60 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-start">61-90 {locale === 'ar' ? 'يوم' : 'Days'}</th>
                    <th className="p-3.5 text-end">{t('common.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockAP.map((s) => (
                    <tr key={s.supplier_code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {s.supplier_code}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? s.supplier_name_ar : s.supplier_name_en}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600">{formatCurrency(s.current)}</td>
                      <td className="p-3.5 font-mono text-amber-600 font-bold">{formatCurrency(s.days_1_30)}</td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(s.days_31_60)}</td>
                      <td className="p-3.5 font-mono text-red-500 font-bold">{formatCurrency(s.days_61_90)}</td>
                      <td className="p-3.5 text-end font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(s.total_due)}
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
