'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { CheckCircle2, ShieldCheck, AlertTriangle, RefreshCw, Trash2, ArrowRight, Clock } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function QCInspectionsPage() {
  const { t, locale } = useTranslation();

  const mockQC = [
    {
      id: '1',
      qc_number: 'QC-2026-00019',
      mo_number: 'MO-2026-00019',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم (3 طبقات)' : 'Corrugated Box 30x20x15 cm',
      inspected_qty: 6500,
      passed_qty: 6350,
      rework_qty: 100,
      scrap_qty: 50,
      status: 'completed',
      result: 'passed',
      gated_to_fg_warehouse: true,
    },
    {
      id: '2',
      qc_number: 'QC-2026-00020',
      mo_number: 'MO-2026-00018',
      product_code: 'FG-SHEET-5P',
      product_name: locale === 'ar' ? 'ألوة كرتون 5 طبقات فلوت BC' : 'Corrugated Sheet 5-Ply',
      inspected_qty: 2000,
      passed_qty: 0,
      rework_qty: 0,
      scrap_qty: 0,
      status: 'in_progress',
      result: 'pending',
      gated_to_fg_warehouse: false,
    },
  ];

  return (
    <PermissionGate module="qc_inspections" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.qcInspections')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'بوابة مراقبة الجودة الإلزامية قبل إضافة المنتج التام لمخزن المنتجات النهائية (PRD §33)'
                  : 'Mandatory QC Inspection gate before Finished Goods enter FG warehouse'}
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {mockQC.map((qc) => (
              <div key={qc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {qc.qc_number}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      ({qc.mo_number})
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {qc.product_name}
                    </span>
                  </div>

                  {qc.result === 'passed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> {locale === 'ar' ? 'مطابق للجودة (تم الترحيل للمخزن)' : 'Passed & Gated to FG'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                      <Clock className="w-4 h-4" /> {locale === 'ar' ? 'قيد الفحص المخبري' : 'Inspection Pending'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'الكمية المَفحوصة:' : 'Inspected Qty:'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatNumber(qc.inspected_qty)} PCS</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'الكمية المقبولة (Pass):' : 'Passed Qty:'}</span>
                    <span className="font-mono font-extrabold text-emerald-600">{formatNumber(qc.passed_qty)} PCS</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'إعادة تشغيل (Rework):' : 'Rework Qty:'}</span>
                    <span className="font-mono font-bold text-amber-600">{formatNumber(qc.rework_qty)} PCS</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{locale === 'ar' ? 'خردة (Scrap):' : 'Scrap Qty:'}</span>
                    <span className="font-mono font-bold text-red-500">{formatNumber(qc.scrap_qty)} PCS</span>
                  </div>
                </div>

                {qc.result === 'pending' && (
                  <div className="flex justify-end gap-2 pt-2">
                    <PermissionGate module="qc_inspections" action="edit">
                      <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{locale === 'ar' ? 'اعتماد المطابقة وإضافة لمخزن المنتج التام' : 'Approve & Gate to FG Warehouse'}</span>
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
