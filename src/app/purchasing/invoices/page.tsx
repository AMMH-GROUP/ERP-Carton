'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  const mockInvoices = [
    {
      id: '1',
      pinv_number: 'PINV-2026-00014',
      po_number: 'PO-2026-00014',
      supplier: locale === 'ar' ? 'شركة النيل للورق الخام والكرتون' : 'Nile Paper Raw Materials Co.',
      supplier_inv_ref: 'INV-NILE-9941',
      date: '2026-08-31',
      total_amount: 1625000,
      three_way_match: 'matched',
      status: 'posted',
    },
    {
      id: '2',
      pinv_number: 'PINV-2026-00012',
      po_number: 'PO-2026-00010',
      supplier: locale === 'ar' ? 'الشركة العالمية للمواد اللاصقة والنشا' : 'Global Starch Ltd',
      supplier_inv_ref: 'INV-GST-1120',
      date: '2026-08-22',
      total_amount: 95000, // PO total was 90000 -> 5000 variance
      three_way_match: 'variance_detected',
      status: 'draft',
    },
  ];

  return (
    <PermissionGate module="purchase_invoices" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.purchaseInvoices')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'فواتير المشتريات والربط مع أمر الشراء وإذن الاستلام (3-Way Match Verification) (PRD §48-49)'
                  : 'Purchase Invoices management and 3-Way Match verification (PO vs GRN vs Invoice)'}
              </p>
            </div>

            <PermissionGate module="purchase_invoices" action="create">
              <button 
                onClick={() => router.push('/purchasing/invoices/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'فاتورة شراء جديدة' : 'New Purchase Invoice'}</span>
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
                    <th className="p-3.5 text-start">{t('nav.purchaseOrders')}</th>
                    <th className="p-3.5 text-start">{t('nav.suppliers')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'فاتورة المورد' : 'Supplier Inv #'}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الربط الثلاثي (3-Way Match)' : '3-Way Match'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.pinv_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{inv.po_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{inv.supplier}</td>
                      <td className="p-3.5 font-mono text-slate-500">{inv.supplier_inv_ref}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {inv.three_way_match === 'matched' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مطابق 100%' : 'Matched 100%'}
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-600 dark:bg-red-950 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> {locale === 'ar' ? 'تم اكتشاف فروقات (تفاوت)' : 'Variance Detected'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                          {inv.status}
                        </span>
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
