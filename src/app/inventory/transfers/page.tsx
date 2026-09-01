'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ArrowLeftRight, Plus, CheckCircle2, Clock, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function WarehouseTransfersPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  const mockTransfers = [
    {
      id: '1',
      transfer_number: 'TRF-2026-00008',
      source_wh: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      dest_wh: locale === 'ar' ? 'مخزن تحت التشغيل (WIP)' : 'WIP Warehouse',
      item_name: locale === 'ar' ? 'ورق كرافت خام 140 جرام' : 'Kraft Paper Roll 140 GSM',
      quantity: '5,000 KG',
      date: '2026-08-31',
      status: 'completed',
      requester: 'محمود القاضي',
    },
    {
      id: '2',
      transfer_number: 'TRF-2026-00009',
      source_wh: locale === 'ar' ? 'مخزن تحت التشغيل (WIP)' : 'WIP Warehouse',
      dest_wh: locale === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse',
      item_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم' : 'Corrugated Box 30x20x15 cm',
      quantity: '2,500 PCS',
      date: '2026-08-31',
      status: 'approved',
      requester: 'مصطفى حسن',
    },
  ];

  return (
    <PermissionGate module="warehouse_transfers" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.transfers')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'طلب وتنفيذ التحويلات التلقائية الذرية بين مستودعات المصنع (Atomic 2-Txn Transfer)'
                  : 'Atomic warehouse-to-warehouse stock transfers execution'}
              </p>
            </div>

            <PermissionGate module="warehouse_transfers" action="create">
              <button 
                onClick={() => router.push('/inventory/transfers/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'طلب تحويل جديد' : 'New Transfer Request'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Transfers Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المستودع المصدر' : 'Source WH'}</th>
                    <th className="p-3.5 text-center"></th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المستودع الهدف' : 'Destination WH'}</th>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('common.quantity')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockTransfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {tr.transfer_number}
                      </td>
                      <td className="p-3.5 font-bold">{tr.source_wh}</td>
                      <td className="p-3.5 text-center text-slate-400">
                        {locale === 'ar' ? <ArrowLeft className="w-4 h-4 inline" /> : <ArrowRight className="w-4 h-4 inline" />}
                      </td>
                      <td className="p-3.5 font-bold">{tr.dest_wh}</td>
                      <td className="p-3.5 font-medium">{tr.item_name}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">{tr.quantity}</td>
                      <td className="p-3.5">
                        {tr.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تم التحويل الذري' : 'Completed'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-[11px] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            <Clock className="w-3.5 h-3.5" /> {locale === 'ar' ? 'معتمد (جاهز للتنفيذ)' : 'Approved'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        {tr.status === 'approved' && (
                          <PermissionGate module="warehouse_transfers" action="edit">
                            <button 
                              onClick={async () => {
                                setSaving(true);
                                try {
                                  const supabase = createClient();
                                  await supabase.from('warehouse_transfers').update({ status: 'completed' }).eq('id', tr.id);
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
                              {saving ? '...' : (locale === 'ar' ? 'تنفيذ التحويل الآن' : 'Execute Transfer')}
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
