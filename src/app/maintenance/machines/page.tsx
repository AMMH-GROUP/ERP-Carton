'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Wrench, Plus, CheckCircle2, AlertTriangle, Clock, Activity, Zap } from 'lucide-react';

export default function MachinesPage() {
  const { t, locale } = useTranslation();

  const mockMachines = [
    {
      id: 'm-1',
      machine_code: 'MAC-CORR-01',
      name_ar: 'خط التضليع الرئيسي (Corrugator Line 5-Ply)',
      name_en: 'Main Corrugator Line (5-Ply)',
      machine_type: 'Corrugator',
      capacity_per_hour: 8000,
      capacity_uom: 'SQM',
      status: 'operational',
      next_maintenance: '2026-09-05',
    },
    {
      id: 'm-2',
      machine_code: 'MAC-PRINT-02',
      name_ar: 'ماكينة الطباعة والقطع (Flexo Folder Gluer)',
      name_en: 'Flexo Folder Gluer (4 Colors)',
      machine_type: 'Printer / Die Cutter',
      capacity_per_hour: 12000,
      capacity_uom: 'PCS',
      status: 'operational',
      next_maintenance: '2026-09-12',
    },
    {
      id: 'm-3',
      machine_code: 'MAC-GLUE-01',
      name_ar: 'ماكينة اللصق والتجميع الأوتوماتيكي',
      name_en: 'Automatic Folder Gluer Machine',
      machine_type: 'Folder Gluer',
      capacity_per_hour: 15000,
      capacity_uom: 'PCS',
      status: 'under_maintenance',
      next_maintenance: '2026-08-31',
    },
  ];

  return (
    <PermissionGate module="machines" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.machines')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'سجل الآلات والمعدات خطوط الإنتاج والإنتاجية بالساعة (PRD §69)'
                  : 'Factory machinery master, production line capacity per hour, and maintenance schedules'}
              </p>
            </div>

            <PermissionGate module="machines" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إضافة ماكينة جديدة' : 'Add Machine'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Grid of Machines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockMachines.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                      {m.machine_code}
                    </span>

                    {m.status === 'operational' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تعمل بكفاءة' : 'Operational'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px] bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تحت الصيانة' : 'Maintenance'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-3">
                    {locale === 'ar' ? m.name_ar : m.name_en}
                  </h3>

                  <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>{locale === 'ar' ? 'الطاقة الإنتاجية:' : 'Hourly Capacity:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {m.capacity_per_hour.toLocaleString()} {m.capacity_uom}/hr
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>
                    <Clock className="w-3.5 h-3.5 inline me-1" />
                    {locale === 'ar' ? 'الصيانة القادمة:' : 'Next PM:'} {m.next_maintenance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
