'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Wallet, Landmark, ArrowUpRight, ArrowDownRight, RefreshCcw, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TreasuryPage() {
  const { t, locale } = useTranslation();

  const cashboxes = [
    {
      code: 'CASH-MAIN',
      name_ar: 'الخزينة الرئيسية للمصنع',
      name_en: 'Main Factory Cashbox',
      balance: 485000,
      currency: 'EGP',
    },
    {
      code: 'CASH-PETTY',
      name_ar: 'خزينة المصروفات النثرية',
      name_en: 'Petty Cashbox',
      balance: 25000,
      currency: 'EGP',
    },
  ];

  const bankAccounts = [
    {
      code: 'BANK-NBE-EGP',
      bank_name: 'البنك الأهلي المصري',
      account_number: '10049928172001',
      balance: 2850000,
      currency: 'EGP',
    },
    {
      code: 'BANK-CIB-EGP',
      bank_name: 'البنك التجاري الدولي CIB',
      account_number: '10009938210982',
      balance: 1420000,
      currency: 'EGP',
    },
  ];

  const totalLiquidity = cashboxes.reduce((s, c) => s + c.balance, 0) + bankAccounts.reduce((s, b) => s + b.balance, 0);

  return (
    <PermissionGate module="general_ledger" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.treasury')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة النقدية بالخزائن الحسابية والبنوك وتتبع السيولة المالية الفورية (PRD §60-61)'
                  : 'Manage cashboxes, bank accounts, and real-time treasury liquidity'}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2 rounded-xl text-start">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">
                {locale === 'ar' ? 'إجمالي السيولة النقدية الفورية' : 'Total Cash & Bank Liquidity'}
              </span>
              <span className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 font-mono">
                {formatCurrency(totalLiquidity)}
              </span>
            </div>
          </div>

          {/* Cashboxes Grid */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              {locale === 'ar' ? 'خزائن النقدية (Cashboxes)' : 'Cashboxes'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cashboxes.map((cb) => (
                <div key={cb.code} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {cb.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                      {locale === 'ar' ? cb.name_ar : cb.name_en}
                    </h3>
                  </div>

                  <div className="text-end">
                    <span className="text-xs text-slate-400 block">{locale === 'ar' ? 'الرصيد الفعلي' : 'Current Balance'}</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      {formatCurrency(cb.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Accounts Grid */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600" />
              {locale === 'ar' ? 'الحسابات البنكية (Bank Accounts)' : 'Bank Accounts'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map((b) => (
                <div key={b.code} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                      {b.bank_name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 block mt-0.5">Acc: {b.account_number}</span>
                  </div>

                  <div className="text-end">
                    <span className="text-xs text-slate-400 block">{locale === 'ar' ? 'الرصيد البنكي' : 'Bank Balance'}</span>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {formatCurrency(b.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
