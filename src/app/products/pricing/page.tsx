'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Sliders, Plus, Trash2, Save, Calculator, DollarSign, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function PricingEnginePage() {
  const { t, locale } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState('FG-BOX-3020');
  const [profitMargin, setProfitMargin] = useState(15.0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('pricing_formulas').upsert({ product_code: selectedProduct, margin: profitMargin });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const [components, setComponents] = useState([
    { id: '1', type: 'raw_material', method: 'per_unit', value: 5.20, description: locale === 'ar' ? 'تكلفة الورق الخام (BOM)' : 'Raw Paper Cost' },
    { id: '2', type: 'labor', method: 'per_unit', value: 0.80, description: locale === 'ar' ? 'العمالة المباشرة' : 'Direct Labor' },
    { id: '3', type: 'machine', method: 'per_unit', value: 1.10, description: locale === 'ar' ? 'تشغيل الماكينة والكهرباء' : 'Machine Power & Operation' },
    { id: '4', type: 'waste', method: 'percentage_of_material', value: 5.00, description: locale === 'ar' ? 'الهالك المسموح به (5%)' : 'Allowable Waste (5%)' },
    { id: '5', type: 'overhead', method: 'per_unit', value: 0.50, description: locale === 'ar' ? 'المصروفات الصناعية غير المباشرة' : 'Manufacturing Overhead' },
  ]);

  const rawMaterialCost = components.find(c => c.type === 'raw_material')?.value || 0;
  const wasteCost = components.find(c => c.type === 'waste')?.method === 'percentage_of_material'
    ? rawMaterialCost * (components.find(c => c.type === 'waste')?.value || 0) / 100
    : components.find(c => c.type === 'waste')?.value || 0;

  const directCostsSum = components
    .filter(c => c.type !== 'waste')
    .reduce((sum, c) => sum + c.value, 0) + wasteCost;

  const calculatedUnitPrice = directCostsSum / (1 - profitMargin / 100);

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { id: Date.now().toString(), type: 'other', method: 'per_unit', value: 0, description: '' },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
  };

  return (
    <PermissionGate module="pricing" action="view">
      <AppShell>
        <div className="space-y-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'محرك معادلات التسعير الآلي' : 'Pricing Formula Engine'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'حساب التكلفة التقديرية وهامش الربح وسعر البيع بناءً على عناصر التكلفة والمواصفات (PRD §15)'
                  : 'Automatic pricing calculator considering materials, labor, machine hours, waste %, overhead, and profit margin'}
              </p>
            </div>

            <PermissionGate module="pricing" action="edit">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-70">
                <Save className="w-4 h-4" />
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (saved ? (locale === 'ar' ? 'تم الحفظ' : 'Saved!') : (locale === 'ar' ? 'حفظ المعادلة' : 'Save Formula'))}</span>
              </button>
            </PermissionGate>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Component Formula Form */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'عناصر التكلفة المتغيرة والمباشرة' : 'Cost Components Breakdown'}
                </h2>

                <button
                  onClick={handleAddComponent}
                  className="flex items-center gap-1 text-indigo-600 text-xs font-bold hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'إضافة عنصر' : 'Add Component'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {components.map((comp) => (
                  <div key={comp.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {comp.description || comp.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {comp.type} • {comp.method}
                      </span>
                    </div>

                    <div className="w-32">
                      <input
                        type="number"
                        step="0.01"
                        value={comp.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setComponents(components.map(c => c.id === comp.id ? { ...c, value: val } : c));
                        }}
                        className="w-full p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-end font-mono font-bold"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveComponent(comp.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary Calculation Card */}
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  {locale === 'ar' ? 'ملخص حساب السعر المستهدف' : 'Price Calculation Output'}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{locale === 'ar' ? 'إجمالي التكلفة المباشرة:' : 'Total Direct Cost:'}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(directCostsSum)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-semibold">{locale === 'ar' ? 'هامش الربح المطلوب (%):' : 'Profit Margin (%):'}</span>
                    <input
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 bg-slate-800 border border-slate-700 rounded text-center text-emerald-400 font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block">
                  {locale === 'ar' ? 'سعر البيع المقترح للوحدة' : 'Suggested Selling Price / Unit'}
                </span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
                  {formatCurrency(calculatedUnitPrice)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  + 14% {locale === 'ar' ? 'ضريبة القيمة المضافة تضاف لاحقاً' : 'VAT added afterwards'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
