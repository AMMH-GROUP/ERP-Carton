'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ShoppingBag, Plus, Search, CheckCircle2, Clock, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PurchaseOrdersPage() {
  const { t, locale } = useTranslation();

  const mockPOs = [
    {
      id: '1',
      po_number: 'PO-2026-00014',
      supplier_name_ar: 'شركة النيل للورق الخام والكرتون',
      supplier_name_en: 'Nile Paper Raw Materials Co.',
      date: '2026-08-31',
      expected_date: '2026-09-05',
      total_amount: 1625000,
      received_pct: '0%',
      status: 'approved',
    },
    {
      id: '2',
      po_number: 'PO-2026-00010',
      supplier_name_ar: 'الشركة العالمية للمواد اللاصقة والنشا',
      supplier_name_en: 'Global Starch & Adhesives Ltd',
      date: '2026-08-20',
      expected_date: '2026-08-27',
      total_amount: 90000,
      received_pct: '100%',
      status: 'received',
    },
  ];

  return (
    <PermissionGate module="purchase_orders" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.purchaseOrders')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة أوامر الشراء الصادرة للموردين المعتمدين وتتبع نسبة الاستلام (PRD §45)'
                  : 'Manage issued Purchase Orders to approved suppliers and receiving tracking'}
              </p>
            </div>

            <PermissionGate module="purchase_orders" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'أمر شراء جديد' : 'New Purchase Order'}</span>
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
                    <th className="p-3.5 text-start">{t('nav.suppliers')}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'التوريد المتوقع' : 'Expected Date'}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {po.po_number}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? po.supplier_name_ar : po.supplier_name_en}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{po.date}</td>
                      <td className="p-3.5 font-mono text-slate-400">{po.expected_date}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(po.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {po.status === 'received' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'تم الاستلام بالكامل' : 'Fully Received'}
                          </span>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'معتمد (بانتظار التوريد)' : 'Approved (Pending Delivery)'}
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
