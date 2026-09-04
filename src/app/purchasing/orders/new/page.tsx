'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ShoppingCart, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPurchaseOrderPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [supplier, setSupplier] = useState('sup-1');
  const [expectedDate, setExpectedDate] = useState('2026-09-25');
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
        router.push('/purchasing/orders');
      }, 1000);
    }, 600);
  };

  return (
    <PermissionGate module="purchase_orders" action="create">
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
                  {locale === 'ar' ? 'إنشاء أمر شراء للمورد (PO)' : 'Create New Purchase Order'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'ar' ? 'طلب توريد ورق خام وخامات مضلع من المورد المعتمد (PRD §45)' : 'Create purchase order for paper raw materials'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/purchasing/orders')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                form="po-form"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ أمر الشراء' : 'Save PO')}</span>
              </button>
            </div>
          </div>

          {saved && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{locale === 'ar' ? 'تم إنشاء أمر الشراء بنجاح!' : 'Purchase order created successfully! Redirecting...'}</span>
            </div>
          )}

          <form id="po-form" onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'اسم المورد المعتمد' : 'Supplier'}
                </label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="sup-1">شركة الفتوح لصناعة الورق الكرافت</option>
                  <option value="sup-2">شركة النيل للورق والتعبئة</option>
                  <option value="sup-3">المصرية الدولية لاستيراد الورق</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'تاريخ التوريد المتوقع بالمصنع' : 'Expected Receipt Date'}
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {locale === 'ar' ? 'ملاحظات المواصفات الفنية للورق' : 'Paper Specifications & Notes'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={locale === 'ar' ? 'ملاحظات وزن الجراماش GSM وعرض الرول...' : 'Enter specifications...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
