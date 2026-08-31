'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Building2, CheckCircle2, Award, ArrowRight, DollarSign, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SupplierComparisonPage() {
  const { t, locale } = useTranslation();

  const rfq = {
    rfq_number: 'RFQ-2026-00005',
    item_name_ar: 'ورق كرافت خام 140 جرام (50 طن)',
    item_name_en: 'Kraft Paper Roll 140 GSM (50 Tons)',
  };

  const supplierQuotes = [
    {
      supplier_name_ar: 'شركة النيل للورق الخام والكرتون',
      supplier_name_en: 'Nile Paper Raw Materials Co.',
      unit_price: 32.50,
      total_price: 1625000,
      lead_time_days: 5,
      payment_terms: '45 آجل',
      is_best_price: true,
      is_best_delivery: true,
      selected: true,
    },
    {
      supplier_name_ar: 'الشركة المصرية الدولية للورق',
      supplier_name_en: 'Egyptian International Paper',
      unit_price: 34.00,
      total_price: 1700000,
      lead_time_days: 7,
      payment_terms: '30 آجل',
      is_best_price: false,
      is_best_delivery: false,
      selected: false,
    },
    {
      supplier_name_ar: 'المجموعة الحديثة لاستيراد الورق',
      supplier_name_en: 'Modern Paper Importers',
      unit_price: 33.20,
      total_price: 1660000,
      lead_time_days: 10,
      payment_terms: 'نقداً عند التسليم',
      is_best_price: false,
      is_best_delivery: false,
      selected: false,
    },
  ];

  return (
    <PermissionGate module="rfqs" action="view">
      <AppShell>
        <div className="space-y-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-2 py-0.5 rounded">
                  {rfq.rfq_number}
                </span>
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'مقارنة عروض أسعار الموردين' : 'Supplier Quotation Comparison'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar' ? rfq.item_name_ar : rfq.item_name_en}
              </p>
            </div>

            <PermissionGate module="purchase_orders" action="create">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{locale === 'ar' ? 'اصدار أمر شراء للمورد الفائز' : 'Issue PO to Best Supplier'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supplierQuotes.map((sq, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                  sq.selected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {sq.is_best_price && (
                  <span className="absolute -top-3 right-4 ltr:left-4 ltr:right-auto bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Award className="w-3 h-3" /> {locale === 'ar' ? 'أفضل سعر' : 'Best Price'}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="pt-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {locale === 'ar' ? sq.supplier_name_ar : sq.supplier_name_en}
                    </h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{locale === 'ar' ? 'سعر الطن:' : 'Unit Price / Ton:'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(sq.unit_price)}</span>
                    </div>

                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                      <span className="text-slate-400">{locale === 'ar' ? 'الإجمالي (50 طن):' : 'Total Price:'}</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(sq.total_price)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span><Clock className="w-3.5 h-3.5 inline me-1" />{locale === 'ar' ? 'مدة التوريد:' : 'Lead Time:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{sq.lead_time_days} {locale === 'ar' ? 'أيام' : 'Days'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span><CreditCard className="w-3.5 h-3.5 inline me-1" />{locale === 'ar' ? 'شروط الدفع:' : 'Payment:'}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{sq.payment_terms}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      sq.selected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sq.selected ? (locale === 'ar' ? 'المورد المختار' : 'Selected Supplier') : (locale === 'ar' ? 'اختيار المورد' : 'Select')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
