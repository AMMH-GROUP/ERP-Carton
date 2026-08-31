'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Factory, Plus, Layers, Search, CheckCircle2, Sliders, Edit, Eye } from 'lucide-react';

export default function BOMsPage() {
  const { t, locale } = useTranslation();

  const mockBOMs = [
    {
      id: '1',
      bom_code: 'BOM-BOX-3020-V1',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم (3 طبقات)' : 'Corrugated Box 30x20x15 cm',
      version: 1,
      calculation_type: 'dimension_based',
      calc_label: locale === 'ar' ? 'حسب الأبعاد والمساحة (Dimension Based)' : 'Dimension Based',
      is_active: true,
      materials_count: 4,
    },
    {
      id: '2',
      bom_code: 'BOM-SHEET-5P-V2',
      product_code: 'FG-SHEET-5P',
      product_name: locale === 'ar' ? 'ألوة كرتون 5 طبقات فلوت BC' : 'Corrugated Sheet 5-Ply Flute BC',
      version: 2,
      calculation_type: 'weight_based',
      calc_label: locale === 'ar' ? 'حسب الوزن والجراماج (Weight Based)' : 'Weight Based',
      is_active: true,
      materials_count: 5,
    },
  ];

  return (
    <PermissionGate module="bom" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.boms')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة معادلات التصنيع وتحديد نسب استهلاك الورق والنشا والهالك (PRD §26)'
                  : 'Bill of Materials / Production formulas with dimension, weight, per unit, or fixed calculation rules'}
              </p>
            </div>

            <PermissionGate module="bom" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'معادلة تصنيع جديدة (BOM)' : 'New BOM Formula'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* BOMs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockBOMs.map((b) => (
              <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                        {b.bom_code}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                        v{b.version}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'نشطة' : 'Active'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-3">
                    {b.product_name}
                  </h3>

                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                    {b.calc_label}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    {b.materials_count} {locale === 'ar' ? 'خامات محددة بالمعادلة' : 'Materials Configured'}
                  </span>

                  <PermissionGate module="bom" action="edit">
                    <button className="text-indigo-600 hover:underline font-bold">
                      {locale === 'ar' ? 'تعديل المعادلة' : 'Edit BOM'}
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
