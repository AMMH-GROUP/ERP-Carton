'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, Search, CheckCircle2, Clock, FileText, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PurchaseRequestsPage() {
  const { t, locale } = useTranslation();

  const mockPRs = [
    {
      id: '1',
      pr_number: 'PR-2026-00018',
      requester: locale === 'ar' ? 'مصطفى حسن (المخازن)' : 'Mustafa Hassan (Warehouse)',
      department: locale === 'ar' ? 'المخازن' : 'Warehouse',
      date: '2026-08-31',
      required_date: '2026-09-10',
      reason: locale === 'ar' ? 'شراء 50 طن ورق كرافت 140 جرام لتلبية طلبية أثاث المستقبل' : 'Purchase 50 Tons Kraft Paper 140 GSM',
      status: 'pending_approval',
      estimated_total: 340000,
    },
    {
      id: '2',
      pr_number: 'PR-2026-00015',
      requester: locale === 'ar' ? 'محمود القاضي (الإنتاج)' : 'Mahmoud El-Kadi (Production)',
      department: locale === 'ar' ? 'الإنتاج' : 'Manufacturing',
      date: '2026-08-25',
      required_date: '2026-09-01',
      reason: locale === 'ar' ? 'شراء 5 طن نشا لاصق صناعي' : 'Purchase 5 Tons Industrial Starch',
      status: 'approved',
      estimated_total: 90000,
    },
  ];

  return (
    <PermissionGate module="purchase_requests" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.purchaseRequests')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'طلبات الشراء الداخلية الصادرة من الأقسام ومتابعة اعتمادات المديرين (PRD §41)'
                  : 'Internal Purchase Requests from departments and manager approval workflows'}
              </p>
            </div>

            <PermissionGate module="purchase_requests" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'طلب شراء جديد' : 'New Purchase Request'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('common.createdBy')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'السبب والبيان' : 'Reason / Note'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'التكلفة التقديرية' : 'Est. Total'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockPRs.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {pr.pr_number}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {pr.requester}
                        <span className="block text-[10px] text-slate-400 font-normal">{pr.department}</span>
                      </td>
                      <td className="p-3.5 max-w-xs truncate">{pr.reason}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(pr.estimated_total)}
                      </td>
                      <td className="p-3.5">
                        {pr.status === 'approved' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'معتمد' : 'Approved'}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'بانتظار موافقة المدير' : 'Pending Approval'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        {pr.status === 'pending_approval' && (
                          <PermissionGate module="purchase_requests" action="approve">
                            <div className="flex items-center justify-end gap-1">
                              <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded shadow-xs">
                                {t('actions.approve')}
                              </button>
                              <button className="px-2.5 py-1 bg-red-50 text-red-600 font-bold text-[11px] rounded">
                                {t('actions.reject')}
                              </button>
                            </div>
                          </PermissionGate>
                        )}
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
