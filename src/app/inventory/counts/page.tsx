'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ClipboardList, Plus, CheckCircle2, AlertTriangle, Calculator, FileCheck } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

import { useRouter } from 'next/navigation';

export default function StockCountsPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const mockCounts = [
    {
      id: '1',
      count_number: 'SC-2026-00003',
      warehouse_name: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      count_date: '2026-08-30',
      status: 'approved',
      counter: 'مصطفى حسن',
      approver: 'أحمد محمود',
      items: [
        { code: 'RM-PAPER-140', name: 'ورق كرافت 140 جرام', system_qty: 45000, counted_qty: 44850, variance: -150 },
        { code: 'RM-STARCH-01', name: 'نشا صناعي', system_qty: 8500, counted_qty: 8500, variance: 0 },
      ],
    },
  ];

  return (
    <PermissionGate module="stock_counts" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.stockCounts')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'جلسات الجرد الفعلي للمستودعات وحساب التفاوت والتسوية المخزنية'
                  : 'Physical stock count sessions, variance calculation, and inventory adjustment'}
              </p>
            </div>

            <PermissionGate module="stock_counts" action="create">
              <button 
                onClick={() => router.push('/inventory/counts/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'بدء جلسة جرد جديدة' : 'Start New Count Session'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Counts Session Cards */}
          <div className="space-y-4">
            {mockCounts.map((sc) => (
              <div key={sc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                      {sc.count_number}
                    </span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {sc.warehouse_name}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" /> {locale === 'ar' ? 'تم اعتماد التفاوت وتسويته' : 'Approved & Adjusted'}
                  </span>
                </div>

                {/* Items Variance Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5 text-start">{t('common.code')}</th>
                        <th className="p-2.5 text-start">{t('common.name')}</th>
                        <th className="p-2.5 text-start">{locale === 'ar' ? 'رصيد النظام' : 'System Qty'}</th>
                        <th className="p-2.5 text-start">{locale === 'ar' ? 'الرصيد الفعلي (المعدود)' : 'Counted Qty'}</th>
                        <th className="p-2.5 text-start">{locale === 'ar' ? 'فارق الجرد (التفاوت)' : 'Variance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sc.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono font-bold">{item.code}</td>
                          <td className="p-2.5">{item.name}</td>
                          <td className="p-2.5 font-mono">{formatNumber(item.system_qty)}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{formatNumber(item.counted_qty)}</td>
                          <td className="p-2.5 font-mono font-extrabold">
                            {item.variance === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : (
                              <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                {item.variance} (تفاوت)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
