'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, CheckCircle2, Clock, DollarSign, FileCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SalesInvoicesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-2026-00034',
      so_number: 'SO-2026-00012',
      customer: locale === 'ar' ? 'مصنع الشرق للأجهزة الكهربائية' : 'Orient Electronics',
      date: '2026-08-31',
      due_date: '2026-09-30',
      total_amount: 96900,
      paid_amount: 0,
      status: 'posted',
    },
    {
      id: '2',
      invoice_number: 'INV-2026-00030',
      so_number: 'SO-2026-00005',
      customer: locale === 'ar' ? 'شركة أثاث المستقبل ش.م.م' : 'Future Furniture Co.',
      date: '2026-08-15',
      due_date: '2026-09-15',
      total_amount: 142500,
      paid_amount: 142500,
      status: 'paid',
    },
  ];

  return (
    <PermissionGate module="sales_invoices" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.salesInvoices')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إصدار فواتير المبيعات، الترحيل الآلي للحسابات، وتتبع المحصلات (PRD §53-54)'
                  : 'Manage Sales Invoices, automated journal entry posting, and payments tracking'}
              </p>
            </div>

            <PermissionGate module="sales_invoices" action="create">
              <button 
                onClick={() => router.push('/sales/invoices/create')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إصدار فاتورة جديدة' : 'Create Sales Invoice'}</span>
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
                    <th className="p-3.5 text-start">{t('nav.salesOrders')}</th>
                    <th className="p-3.5 text-start">{t('nav.customers')}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoice_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{inv.so_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{inv.customer}</td>
                      <td className="p-3.5 font-mono text-slate-400">{inv.date}</td>
                      <td className="p-3.5 font-mono text-slate-400">{inv.due_date}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {inv.status === 'paid' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مسددة بالكامل' : 'Paid'}
                          </span>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مرحلة (غير مسددة)' : 'Posted (Unpaid)'}
                          </span>
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
