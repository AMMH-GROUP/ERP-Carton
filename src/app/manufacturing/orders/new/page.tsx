'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Factory, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProductionOrderPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [moNumber, setMoNumber] = useState(`MO-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [product, setProduct] = useState('prod-1');
  const [plannedQty, setPlannedQty] = useState('10000');
  const [machine, setMachine] = useState('mch-1');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        router.push('/manufacturing/orders');
      }, 1000);
    }, 600);
  };

  return (
    <PermissionGate module="production_orders" action="create">
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'إصدار أمر إنتاج وتشغيل جديد (MO)' : 'Create Production Order'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'ar' ? 'تحديد كميات تصنيع الكرتون وتكليف الماكينات وجلسة التضليع (PRD §24)' : 'Schedule new corrugation production order'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/manufacturing/orders')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                form="mo-form"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'إصدار امر التشغيل' : 'Release Order')}</span>
              </button>
            </div>
          </div>

          {saved && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{locale === 'ar' ? 'تم إصدار أمر الإنتاج بنجاح وتجهيز خط التضليع!' : 'Production Order released successfully! Redirecting...'}</span>
            </div>
          )}

          <form id="mo-form" onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'رقم أمر التشغيل' : 'MO Number'}
                </label>
                <input
                  type="text"
                  value={moNumber}
                  onChange={(e) => setMoNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'المنتج المطلوب تصنيعه' : 'Finished Good Product'}
                </label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="prod-1">علبة كرتون مضلع 40×30×25 سم (Flute B)</option>
                  <option value="prod-2">صندوق كرتون مضلع 60×40×40 سم (Flute BC)</option>
                  <option value="prod-3">فاصل كرتون مضلع 30×20 سم</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'الكمية المخططة (علبة)' : 'Planned Quantity'}
                </label>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'الماكينة المكلفة بالإنتاج' : 'Assigned Machine'}
                </label>
                <select
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mch-1">خط التضليع الرئيسي (Corrugator Line #1)</option>
                  <option value="mch-2">ماكينة الطباعة والتكسير (Flexo Printer Die-Cutter #2)</option>
                  <option value="mch-3">ماكينة اللصق والتجميع (Folder Gluer Line #3)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {locale === 'ar' ? 'تعليمات الفني والمشغل' : 'Operator Instructions'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={locale === 'ar' ? 'تعليمات السرعة ونوع الغراء المطلوب...' : 'Enter instructions...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
