'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Factory, Plus, Search, CheckCircle2, Clock, Play, Pause, AlertTriangle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProductionOrdersPage() {
  const { t, locale } = useTranslation();

  const mockMOs = [
    {
      id: '1',
      mo_number: 'MO-2026-00019',
      so_number: 'SO-2026-00018',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم (3 طبقات)' : 'Corrugated Box 30x20x15 cm',
      planned_qty: 10000,
      produced_qty: 6500,
      scrap_qty: 120,
      machine_name: locale === 'ar' ? 'خط التضليع الرئيسي (Corrugator 01)' : 'Main Corrugator Line 01',
      status: 'in_progress',
    },
    {
      id: '2',
      mo_number: 'MO-2026-00020',
      so_number: 'SO-2026-00019',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم (3 طبقات)' : 'Corrugated Box 30x20x15 cm',
      planned_qty: 25000,
      produced_qty: 0,
      scrap_qty: 0,
      machine_name: locale === 'ar' ? 'ماكينة الطباعة والقطع (Flexo 02)' : 'Flexo Printer 02',
      status: 'planned', // Explicit release required before work starts
    },
  ];

  const router = useRouter();
  const [mos, setMos] = useState(mockMOs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRelease = async (id: string) => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('manufacturing_orders').update({ status: 'in_progress' }).eq('id', id);
      setMos(mos.map(mo => mo.id === id ? { ...mo, status: 'in_progress' } : mo));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setMos(mos.map(mo => mo.id === id ? { ...mo, status: 'in_progress' } : mo));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate module="production_orders" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Factory className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.productionOrders')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة خطة الإنتاج، الإفراج الصريح عن الأوامر، وتتبع كميات التشغيل (PRD §24)'
                  : 'Manage production orders, explicit release workflow, and job execution tracking'}
              </p>
            </div>

            <PermissionGate module="production_orders" action="create">
              <button onClick={() => router.push('/manufacturing/orders/new')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'أمر إنتاج جديد' : 'New Production Order'}</span>
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
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('nav.machines')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المخطط' : 'Planned Qty'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المنتج الفعلي' : 'Produced Qty'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mos.map((mo) => {
                    const progress = Math.round((mo.produced_qty / mo.planned_qty) * 100);
                    return (
                      <tr key={mo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {mo.mo_number}
                        </td>
                        <td className="p-3.5 font-mono font-bold">{mo.so_number}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{mo.product_name}</td>
                        <td className="p-3.5 font-medium">{mo.machine_name}</td>
                        <td className="p-3.5 font-mono font-bold">{formatNumber(mo.planned_qty)} PCS</td>
                        <td className="p-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(mo.produced_qty)} PCS ({progress}%)
                        </td>
                        <td className="p-3.5">
                          {mo.status === 'in_progress' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                              <Play className="w-3 h-3" /> {locale === 'ar' ? 'قيد التشغيل' : 'In Progress'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px] bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" /> {locale === 'ar' ? 'مخطط (بانتظار الإفراج)' : 'Planned'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-end">
                          {mo.status === 'planned' && (
                            <PermissionGate module="production_orders" action="edit">
                              <button onClick={() => handleRelease(mo.id)} disabled={saving} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs">
                                {saving ? (locale === 'ar' ? 'جاري...' : 'Releasing...') : (locale === 'ar' ? 'إفراج عن أمر الإنتاج' : 'Release MO')}
                              </button>
                            </PermissionGate>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
