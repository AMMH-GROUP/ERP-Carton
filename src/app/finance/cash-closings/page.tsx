'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { CheckCircle2, AlertTriangle, Clock, Wallet, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CashClosingsPage() {
  const { t, locale } = useTranslation();

  const mockClosings = [
    {
      id: '1',
      cash_account_name: locale === 'ar' ? 'الخزينة الرئيسية للمصنع' : 'Main Factory Cashbox',
      closing_date: '2026-08-31',
      system_balance: 485000,
      physical_balance: 485000,
      variance: 0,
      status: 'approved',
      closed_by: 'مصطفى النجار',
    },
    {
      id: '2',
      cash_account_name: locale === 'ar' ? 'خزينة المصروفات النثرية' : 'Petty Cashbox',
      closing_date: '2026-08-30',
      system_balance: 25200,
      physical_balance: 25000,
      variance: -200, // 200 EGP shortage requiring manager approval
      variance_reason: locale === 'ar' ? 'عجز نثري بسيط جارٍ تسويته' : 'Minor petty shortage under review',
      status: 'pending_approval',
      closed_by: 'خالد إبراهيم',
    },
  ];

  return (
    <PermissionGate module="general_ledger" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.cashClosings')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'جلسات الجرد والإغلاق اليومي للتموين الخزني وتدقيق الفروقات الفعلية (PRD §60)'
                  : 'Daily cashbox closing sessions, physical count variance audit, and manager approvals'}
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {mockClosings.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {c.cash_account_name}
                    </span>
                    <span className="font-mono text-xs text-slate-400">({c.closing_date})</span>
                  </div>

                  {c.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> {locale === 'ar' ? 'مطابق ومطفي (مُعتمد)' : 'Approved & Matched'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                      <ShieldAlert className="w-4 h-4" /> {locale === 'ar' ? 'تفاوت (بانتظار موافقة المدير)' : 'Variance Pending Approval'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'رصيد الدفاتر (النظام):' : 'System Balance:'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(c.system_balance)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'العد الفعلي (الخزينة):' : 'Physical Count:'}</span>
                    <span className="font-mono font-extrabold text-indigo-600">{formatCurrency(c.physical_balance)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'فارق الإغلاق (التفاوت):' : 'Variance:'}</span>
                    <span className="font-mono font-extrabold">
                      {c.variance === 0 ? (
                        <span className="text-slate-400">0 EGP</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                          {c.variance} EGP (عجز)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {c.status === 'pending_approval' && (
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <strong>{locale === 'ar' ? 'السبب:' : 'Reason:'}</strong> {c.variance_reason}
                    </p>

                    <PermissionGate module="general_ledger" action="approve">
                      <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs">
                        {locale === 'ar' ? 'اعتماد التفاوت وتسويته' : 'Approve & Settle Variance'}
                      </button>
                    </PermissionGate>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
