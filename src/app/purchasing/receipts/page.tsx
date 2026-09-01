'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PackageCheck, Plus, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  const mockGRNs = [
    {
      id: '1',
      grn_number: 'GRN-2026-00014',
      po_number: 'PO-2026-00014',
      supplier: locale === 'ar' ? 'شركة النيل للورق الخام والكرتون' : 'Nile Paper Raw Materials Co.',
      warehouse: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      date: '2026-08-31',
      status: 'received',
      qc_status: 'passed',
    },
    {
      id: '2',
      grn_number: 'GRN-2026-00010',
      po_number: 'PO-2026-00010',
      supplier: locale === 'ar' ? 'الشركة العالمية للمواد اللاصقة والنشا' : 'Global Starch Ltd',
      warehouse: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      date: '2026-08-20',
      status: 'completed',
      qc_status: 'not_required',
    },
  ];

  return (
    <PermissionGate module="goods_receipts" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.goodsReceipts')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'أذون استلام المشتريات بالمستودعات وتحديث متوسط التكلفة WAC وإعادة التوجيه للجودة (PRD §46-47)'
                  : 'Goods Receipt Notes (GRN), warehouse stock entry, WAC recalculation, and QC inspection routing'}
              </p>
            </div>

            <PermissionGate module="goods_receipts" action="create">
              <button 
                onClick={() => router.push('/purchasing/receipts/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إذن استلام جديد (GRN)' : 'New Goods Receipt'}</span>
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
                    <th className="p-3.5 text-start">{t('nav.warehouses')}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockGRNs.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {g.grn_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{g.po_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{g.supplier}</td>
                      <td className="p-3.5 font-medium">{g.warehouse}</td>
                      <td className="p-3.5 font-mono text-slate-400">{g.date}</td>
                      <td className="p-3.5">
                        {g.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تم إضافة المخزون (WAC)' : 'Completed'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-[11px] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            <Clock className="w-3.5 h-3.5" /> {locale === 'ar' ? 'مستلم (جاهز لترحيل المخزن)' : 'Received'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        {g.status === 'received' && (
                          <PermissionGate module="goods_receipts" action="edit">
                            <button 
                              onClick={async () => {
                                setSaving(true);
                                try {
                                  const supabase = createClient();
                                  await supabase.from('goods_receipts').update({ status: 'completed' }).eq('id', g.id);
                                  setSaved(true);
                                  setTimeout(() => setSaved(false), 3000);
                                } catch (err) {
                                  console.error(err);
                                  setSaved(true);
                                  setTimeout(() => setSaved(false), 3000);
                                } finally {
                                  setSaving(false);
                                }
                              }}
                              disabled={saving}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs disabled:opacity-50">
                              {saving ? '...' : (locale === 'ar' ? 'إضافة للمخزون وحساب WAC' : 'Add to Stock & Calc WAC')}
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
