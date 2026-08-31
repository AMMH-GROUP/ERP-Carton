'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Save, Factory, Clock, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

export default function OperatorLogPage() {
  const { t, locale } = useTranslation();

  const [log, setLog] = useState({
    mo_number: 'MO-2026-00019',
    machine: 'MAC-CORR-01',
    produced_qty: '1500',
    scrap_qty: '25',
    waste_qty: '10',
    machine_hours: '4.5',
    downtime_hours: '0.5',
    downtime_reason: locale === 'ar' ? 'تغيير رول الورق الخام والنظافة' : 'Paper roll changeover & cleaning',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <PermissionGate module="production_logs" action="create">
      <AppShell>
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Factory className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.productionLogs')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'تسجيل الإنتاج اليومي، الهالك والخردة، وساعات توقف الماكينات (PRD §31)'
                  : 'Daily operator production log entry, scrap, waste, and machine downtime tracking'}
              </p>
            </div>

            {submitted && (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                {locale === 'ar' ? 'تم تسجيل بيان الإنتاج بنجاح' : 'Logged successfully'}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">{t('nav.productionOrders')}</label>
                <select
                  value={log.mo_number}
                  onChange={(e) => setLog({ ...log, mo_number: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="MO-2026-00019">MO-2026-00019 (كرتونة مضلعة 30×20×15)</option>
                  <option value="MO-2026-00020">MO-2026-00020 (ألوة كرتون 5 طبقات)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('nav.machines')}</label>
                <input
                  type="text"
                  readOnly
                  value={log.machine}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-emerald-600 dark:text-emerald-400">
                  {locale === 'ar' ? 'الكمية المنتجة (المنتج التام)' : 'Produced Qty'}
                </label>
                <input
                  type="number"
                  required
                  value={log.produced_qty}
                  onChange={(e) => setLog({ ...log, produced_qty: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 text-slate-900 font-extrabold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-amber-600">
                  {locale === 'ar' ? 'كمية الخردة (Scrap)' : 'Scrap Qty'}
                </label>
                <input
                  type="number"
                  value={log.scrap_qty}
                  onChange={(e) => setLog({ ...log, scrap_qty: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-red-500">
                  {locale === 'ar' ? 'الهالك المسموح به' : 'Waste Qty'}
                </label>
                <input
                  type="number"
                  value={log.waste_qty}
                  onChange={(e) => setLog({ ...log, waste_qty: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <label className="block font-semibold mb-1">{locale === 'ar' ? 'ساعات تشغيل الماكينة' : 'Machine Hours'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={log.machine_hours}
                  onChange={(e) => setLog({ ...log, machine_hours: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{locale === 'ar' ? 'ساعات التوقف (Downtime)' : 'Downtime Hours'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={log.downtime_hours}
                  onChange={(e) => setLog({ ...log, downtime_hours: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">{locale === 'ar' ? 'سبب التوقف (إن وجد)' : 'Downtime Reason'}</label>
              <input
                type="text"
                value={log.downtime_reason}
                onChange={(e) => setLog({ ...log, downtime_reason: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{locale === 'ar' ? 'حفظ بيان التشغيل' : 'Submit Operator Log'}</span>
              </button>
            </div>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
