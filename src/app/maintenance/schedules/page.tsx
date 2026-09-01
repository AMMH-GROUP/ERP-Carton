'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Wrench, Plus, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MaintenanceSchedulesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const mockSchedules = [
    {
      id: '1',
      machine_name: locale === 'ar' ? 'خط التضليع الرئيسي (Corrugator 01)' : 'Main Corrugator Line 01',
      title: locale === 'ar' ? 'تشحيم وتزيين التروس الرئيسية وتفقد النشا' : 'Main gear lubrication & starch check',
      frequency: '7 أيام (Weekly)',
      last_performed: '2026-08-25',
      next_due: '2026-09-01',
      status: 'due_soon',
    },
    {
      id: '2',
      machine_name: locale === 'ar' ? 'ماكينة الطباعة والقطع (Flexo 02)' : 'Flexo Printer 02',
      title: locale === 'ar' ? 'تنظيف وضبط أنيلوكس وسكاكين القطع' : 'Anilox roller & die blades calibration',
      frequency: '300 ساعات تشغيل',
      last_performed: '2026-08-10',
      next_due: '2026-09-10',
      status: 'ok',
    },
  ];

  return (
    <PermissionGate module="maintenance" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.maintenanceSchedules')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'جداول الصيانة الوقائية الدورية لماكينات المصنع حسب الساعات والتاريخ (PRD §70)'
                  : 'Preventive maintenance schedules, operating hours, and calendar frequency'}
              </p>
            </div>

            <PermissionGate module="maintenance" action="create">
              <button onClick={() => router.push('/maintenance/schedules/new')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'جدول صيانة جديد' : 'New Maintenance Schedule'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSchedules.map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {s.machine_name}
                    </span>

                    {s.status === 'due_soon' ? (
                      <span className="bg-amber-50 text-amber-700 dark:bg-amber-950 px-2 py-0.5 rounded font-bold text-[10px]">
                        {locale === 'ar' ? 'مستحق قريباً' : 'Due Soon'}
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                        {locale === 'ar' ? 'منتظم' : 'On Track'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {locale === 'ar' ? 'تكرار الصيانة:' : 'Frequency:'} {s.frequency}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">
                    {locale === 'ar' ? 'مستحق في:' : 'Next Due:'} <strong className="text-slate-900 dark:text-slate-100">{s.next_due}</strong>
                  </span>

                  <PermissionGate module="maintenance" action="create">
                    <button onClick={() => router.push('/maintenance/work-orders/new?scheduleId=' + s.id)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs">
                      {locale === 'ar' ? 'إصدار أمر صيانة' : 'Create Work Order'}
                    </button>
                  </PermissionGate>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
