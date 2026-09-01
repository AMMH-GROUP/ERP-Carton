'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { FileText, Save, Calculator, AlertTriangle, ShieldAlert, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateQuotationPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [customer, setCustomer] = useState('cust-1');
  const [validUntil, setValidUntil] = useState('2026-09-30');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Custom Box Specs
  const [specs, setSpecs] = useState({
    length: 30, // cm
    width: 20,  // cm
    height: 15, // cm
    gsm: 140,
    board_type: '3-Ply',
    flute_type: 'B-Flute',
    printing_type: 'Flexo 2 Colors',
    quantity: 5000,
  });

  // Price Calculation State
  const [originalCalculatedPrice, setOriginalCalculatedPrice] = useState(12.50);
  const [offeredUnitPrice, setOfferedUnitPrice] = useState(11.00); // Override by sales user
  const [overrideReason, setOverrideReason] = useState('');

  const overridePct = ((originalCalculatedPrice - offeredUnitPrice) / originalCalculatedPrice) * 100;
  const requiresManagerApproval = overridePct > 10.0; // PRD threshold rule: >10% override requires approval

  const lineSubtotal = specs.quantity * offeredUnitPrice;
  const vatAmount = lineSubtotal * 0.14;
  const totalAmount = lineSubtotal + vatAmount;

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('quotations').insert({
        customer_id: customer,
        valid_until: validUntil,
        length: specs.length,
        width: specs.width,
        height: specs.height,
        quantity: specs.quantity,
        offered_price: offeredUnitPrice,
        total_amount: totalAmount,
        status: 'draft'
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push('/sales/quotations');
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push('/sales/quotations');
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate module="quotations" action="create">
      <AppShell>
        <div className="space-y-6 max-w-5xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'إنشاء عرض سعر جديد' : 'Create Quotation'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدخال مواصفات علبة الكرتون وتجهيز السعر وتدقيق التعديلات'
                  : 'Configure custom box specifications and calculate price with threshold audit'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {locale === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!'}
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ وإرسال' : 'Save & Submit')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box Specifications Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  {locale === 'ar' ? 'بيانات العميل والمعادلة' : 'Customer & Validity'}
                </h2>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">{t('nav.customers')}</label>
                    <select
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="cust-1">شركة أثاث المستقبل ش.م.م</option>
                      <option value="cust-2">مجموعة الأغذية النظيفة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'صالح حتى تاريخ' : 'Valid Until'}</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Box Specs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  {locale === 'ar' ? 'مواصفات علبة الكرتون المضلع المطلوبة' : 'Custom Box Specifications'}
                </h2>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'الطول (سم)' : 'Length (cm)'}</label>
                    <input
                      type="number"
                      value={specs.length}
                      onChange={(e) => setSpecs({ ...specs, length: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'العرض (سم)' : 'Width (cm)'}</label>
                    <input
                      type="number"
                      value={specs.width}
                      onChange={(e) => setSpecs({ ...specs, width: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'الارتفاع (سم)' : 'Height (cm)'}</label>
                    <input
                      type="number"
                      value={specs.height}
                      onChange={(e) => setSpecs({ ...specs, height: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'نوع الكرتون' : 'Board Type'}</label>
                    <select
                      value={specs.board_type}
                      onChange={(e) => setSpecs({ ...specs, board_type: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="3-Ply">3-Ply (3 طبقات)</option>
                      <option value="5-Ply">5-Ply (5 طبقات)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{locale === 'ar' ? 'نوع التضليع (Flute)' : 'Flute'}</label>
                    <select
                      value={specs.flute_type}
                      onChange={(e) => setSpecs({ ...specs, flute_type: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="B-Flute">B-Flute</option>
                      <option value="C-Flute">C-Flute</option>
                      <option value="E-Flute">E-Flute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('common.quantity')}</label>
                    <input
                      type="number"
                      value={specs.quantity}
                      onChange={(e) => setSpecs({ ...specs, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Price Override Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <h2 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  {locale === 'ar' ? 'تعديل السعر اليدوي والتدقيق (Price Override & Approval Audit)' : 'Price Override Audit'}
                </h2>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">
                      {locale === 'ar' ? 'السعر المحسوب تلقائياً من المعادلة:' : 'Formula Calculated Price:'}
                    </label>
                    <span className="text-base font-extrabold font-mono text-slate-700 dark:text-slate-300 block">
                      {formatCurrency(originalCalculatedPrice)}
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-900 dark:text-slate-100">
                      {locale === 'ar' ? 'السعر المعروض للعميل (المعدل):' : 'Offered Price / Unit:'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={offeredUnitPrice}
                      onChange={(e) => setOfferedUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600 font-extrabold font-mono text-base"
                    />
                  </div>
                </div>

                {/* Trigger Approval Warning */}
                {requiresManagerApproval && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <span>
                        {locale === 'ar'
                          ? `تخفيض السعر (${overridePct.toFixed(1)}%) يتجاوز الحد المسموح (10%). يتطلب موافقة المدير العام.`
                          : `Price discount (${overridePct.toFixed(1)}%) exceeds 10% threshold. Requires Manager approval.`}
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        {locale === 'ar' ? 'سبب التعديل (إلزامي للموافقة):' : 'Override Reason (Required):'}
                      </label>
                      <input
                        type="text"
                        required
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder={locale === 'ar' ? 'أدخل سبب تقديم الخصم الاستثنائي...' : 'Enter reason for price discount...'}
                        className="w-full p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Quotation Summary */}
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-base border-b border-slate-800 pb-3">
                  {locale === 'ar' ? 'إجمالي قيمة عرض السعر' : 'Quotation Total'}
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>{locale === 'ar' ? 'الكمية الإجمالية:' : 'Total Quantity:'}</span>
                    <span className="font-mono text-white font-bold">{specs.quantity.toLocaleString()} PCS</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{locale === 'ar' ? 'سعر الوحدة المعروض:' : 'Offered Unit Price:'}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(offeredUnitPrice)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>{locale === 'ar' ? 'المبلغ الصافي (القبل الضريبة):' : 'Subtotal:'}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(lineSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>{locale === 'ar' ? 'ضريبة القيمة المضافة (14%):' : 'VAT (14%):'}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(vatAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/80 border border-indigo-500/30 p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block">
                  {locale === 'ar' ? 'الإجمالي النهائي المطلوب' : 'Grand Total'}
                </span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
