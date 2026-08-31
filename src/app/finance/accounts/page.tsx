'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Landmark, Plus, Folder, FileText, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';

export default function ChartOfAccountsPage() {
  const { t, locale } = useTranslation();

  const mockCOA = [
    {
      code: '1000',
      name_ar: 'الأصول المتداولة',
      name_en: 'Current Assets',
      type: 'Asset (أصول)',
      is_header: true,
      children: [
        { code: '1100', name_ar: 'النقدية بالخزينة والبنوك', name_en: 'Cash & Bank Balances', is_header: true },
        { code: '1101', name_ar: 'الخزينة الرئيسية - جنيه', name_en: 'Main EGP Cashbox', is_header: false, balance: 485000 },
        { code: '1102', name_ar: 'البنك الأهلي المصري - جاري', name_en: 'NBE EGP Current Account', is_header: false, balance: 2850000 },
        { code: '1200', name_ar: 'العملاء والذمم المدينة', name_en: 'Accounts Receivable', is_header: false, balance: 1420000 },
        { code: '1300', name_ar: 'مخزون الورق الخام', name_en: 'Raw Paper Inventory', is_header: false, balance: 1950000 },
      ],
    },
    {
      code: '2000',
      name_ar: 'الخصوم المتداولة',
      name_en: 'Current Liabilities',
      type: 'Liability (خصوم)',
      is_header: true,
      children: [
        { code: '2100', name_ar: 'الموردون والذمم الدائنة', name_en: 'Accounts Payable', is_header: false, balance: 1715000 },
        { code: '2200', name_ar: 'ضريبة القيمة المضافة مستحقة السداد', name_en: 'VAT Payable', is_header: false, balance: 245000 },
      ],
    },
    {
      code: '4000',
      name_ar: 'إيرادات المبيعات',
      name_en: 'Sales Revenue',
      type: 'Revenue (إيرادات)',
      is_header: false,
      balance: 4850000,
      children: [],
    },
  ];

  return (
    <PermissionGate module="chart_of_accounts" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.chartOfAccounts')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'دليل الحسابات الشجري الخماسي المستويات ومتابعة أرصدة الأصول والخصوم (PRD §64)'
                  : 'Hierarchical 5-level double-entry Chart of Accounts tree structure'}
              </p>
            </div>

            <PermissionGate module="chart_of_accounts" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'حساب جديد' : 'New Account'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* COA Tree Cards */}
          <div className="space-y-4">
            {mockCOA.map((parent) => (
              <div key={parent.code} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {parent.code}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {locale === 'ar' ? parent.name_ar : parent.name_en}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                    {parent.type}
                  </span>
                </div>

                {/* Sub Accounts List */}
                <div className="space-y-2 ps-6 border-s-2 border-slate-100 dark:border-slate-800">
                  {parent.children.map((child) => (
                    <div key={child.code} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition-colors">
                      <div className="flex items-center gap-2">
                        {child.is_header ? (
                          <Folder className="w-4 h-4 text-amber-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{child.code}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {locale === 'ar' ? child.name_ar : child.name_en}
                        </span>
                      </div>

                      {!child.is_header && child.balance !== undefined && (
                        <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">
                          {child.balance.toLocaleString()} EGP
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
