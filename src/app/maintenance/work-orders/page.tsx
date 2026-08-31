'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, PackageCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function WorkOrdersPage() {
  const { t, locale } = useTranslation();

  const mockWO = [
    {
      id: '1',
      wo_number: 'WO-2026-00012',
      machine_name: locale === 'ar' ? 'خط التضليع الرئيسي (Corrugator 01)' : 'Main Corrugator Line 01',
      type: 'breakdown',
      type_label: locale === 'ar' ? 'عطل طارئ (Breakdown)' : 'Breakdown',
      priority: 'high',
      description: locale === 'ar' ? 'توقف فجائي في رول التضليع وتلف رولمان البلي' : 'Bearing failure in corrugating roll',
      technician: 'أحمد محمود',
      status: 'in_progress',
      spare_parts: [
        { name: 'رولمان بلي SKF 6210', qty: '2 PCS', cost: 3500 },
      ],
    },
    {
      id: '2',
      wo_number: 'WO-2026-00009',
      machine_name: locale === 'ar' ? 'ماكينة الطباعة والقطع (Flexo 02)' : 'Flexo Printer 02',
      type: 'preventive',
      type_label: locale === 'ar' ? 'صيانة وقائية (Preventive)' : 'Preventive',
      priority: 'normal',
      description: locale === 'ar' ? 'صيانة شهرية دورية وتغيير الفلاتر' : 'Monthly routine maintenance & filter change',
      technician: 'سعيد عبد المولى',
      status: 'completed',
      spare_parts: [],
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
                  {t('nav.workOrders')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'أوامر الصيانة الطارئة والوقائية وصرف قطع الغيار من مخزن قطع الغيار (PRD §71)'
                  : 'Manage breakdown & preventive Work Orders and Spare Parts consumption execution'}
              </p>
            </div>

            <PermissionGate module="maintenance" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'أمر صيانة جديد' : 'New Work Order'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {mockWO.map((wo) => (
              <div key={wo.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {wo.wo_number}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {wo.machine_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      wo.type === 'breakdown' ? 'bg-red-50 text-red-600 dark:bg-red-950' : 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                    }`}>
                      {wo.type_label}
                    </span>
                    {wo.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> {locale === 'ar' ? 'مكتمل (الماكينة تعمل)' : 'Completed & Operational'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                        <Clock className="w-4 h-4" /> {locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {wo.description}
                </p>

                {wo.spare_parts.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-slate-400 block">{locale === 'ar' ? 'قطع الغيار المستهلكة من المخزن:' : 'Spare Parts Consumed:'}</span>
                    {wo.spare_parts.map((sp, idx) => (
                      <div key={idx} className="flex justify-between font-mono font-bold">
                        <span>{sp.name} ({sp.qty})</span>
                        <span className="text-slate-900 dark:text-slate-100">{formatCurrency(sp.cost)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {wo.status === 'in_progress' && (
                  <div className="flex justify-end gap-2 pt-2">
                    <PermissionGate module="maintenance" action="edit">
                      <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs">
                        {locale === 'ar' ? 'إغلاق أمر الصيانة وتعديل حالة الماكينة لعمليات التشغيل' : 'Complete & Set Operational'}
                      </button>
                    </PermissionGate>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
