'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
  const { t, locale } = useTranslation();

  const mockExpenses = [
    {
      id: '1',
      expense_number: 'EXP-2026-00028',
      employee: locale === 'ar' ? 'أحمد محمود (الصيانة)' : 'Ahmed Mahmoud (Maintenance)',
      category: locale === 'ar' ? 'قطع غيار وصيانة طارئة' : 'Emergency Spare Parts',
      total_amount: 18500, // > 10,000 threshold requires General Manager approval
      date: '2026-08-31',
      status: 'pending_approval',
      description: locale === 'ar' ? 'شراء رولمان بلي استثنائي لخط التضليع رقم 1' : 'Bearings for Corrugator Line 01',
    },
    {
      id: '2',
      expense_number: 'EXP-2026-00024',
      employee: locale === 'ar' ? 'مصطفى النجار (المبيعات)' : 'Mustafa El-Naggar (Sales)',
      category: locale === 'ar' ? 'انتقالات وضيافة عملاء' : 'Client Hospitality & Travel',
      total_amount: 2400,
      date: '2026-08-28',
      status: 'approved',
      description: locale === 'ar' ? 'انتقالات زيارة موقع عميل أثاث المستقبل' : 'Travel to Future Furniture site',
    },
  ];

  return (
    <PermissionGate module="expenses" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.expenses')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'مطالبات المصروفات التشغيلية والتدقيق المالي القائم على الشريحة المالية (PRD §62-63)'
                  : 'Manage operational expense claims with threshold-based manager approval routing'}
              </p>
            </div>

            <PermissionGate module="expenses" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'طلب مصروف جديد' : 'New Expense Claim'}</span>
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
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {exp.expense_number}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{exp.employee}</td>
                      <td className="p-3.5">
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">{exp.category}</span>
                        <span className="text-[10px] text-slate-400 max-w-xs truncate block">{exp.description}</span>
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(exp.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {exp.status === 'approved' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'معتمد ومُسدد' : 'Approved & Paid'}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'بانتظار اعتماد المدير العام' : 'Pending GM Approval'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        {exp.status === 'pending_approval' && (
                          <PermissionGate module="expenses" action="approve">
                            <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs">
                              {t('actions.approve')}
                            </button>
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
