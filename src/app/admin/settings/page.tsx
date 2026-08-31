'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Settings, Save, CheckCircle2, DollarSign, Percent, ShieldAlert, Package } from 'lucide-react';

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    default_currency: 'EGP',
    default_vat_rate: '14',
    default_language: 'ar',
    credit_check_enabled: true,
    negative_stock_allowed: false,
    price_override_threshold_pct: '10',
    expense_approval_threshold_1: '5000',
    expense_approval_threshold_2: '50000',
    material_variance_threshold_pct: '5',
    cash_variance_approval_threshold: '500',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PermissionGate module="system_settings" action="view" fallback={
      <AppShell>
        <div className="p-8 text-center text-red-500 font-bold">
          {locale === 'ar' ? 'غير مصرح لك بعرض هذه الصفحة' : 'Access Denied'}
        </div>
      </AppShell>
    }>
      <AppShell>
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.systemSettings')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إعدادات النظام العامة، العملات، الضرائب، وحدود الموافقة التلقائية'
                  : 'Global system configuration, currencies, tax rates, and approval thresholds'}
              </p>
            </div>

            {saved && (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                {locale === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* General Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                {locale === 'ar' ? 'الإعدادات العامة والعملة' : 'General & Currency Settings'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'العملة الافتراضية' : 'Default Currency'}
                  </label>
                  <input
                    type="text"
                    value={settings.default_currency}
                    onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'نسبة ضريبة القيمة المضافة (%)' : 'Default VAT Rate (%)'}
                  </label>
                  <input
                    type="number"
                    value={settings.default_vat_rate}
                    onChange={(e) => setSettings({ ...settings, default_vat_rate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Thresholds & Approval Rules */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                {locale === 'ar' ? 'حدود الموافقات والتجاوزات' : 'Approval & Threshold Rules'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'حد تجاوز السعر المسموح (%)' : 'Price Override Threshold (%)'}
                  </label>
                  <input
                    type="number"
                    value={settings.price_override_threshold_pct}
                    onChange={(e) => setSettings({ ...settings, price_override_threshold_pct: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'حد موافقة المصروفات 1 (EGP)' : 'Expense Approval Threshold 1 (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={settings.expense_approval_threshold_1}
                    onChange={(e) => setSettings({ ...settings, expense_approval_threshold_1: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'حد موافقة المصروفات 2 (EGP)' : 'Expense Approval Threshold 2 (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={settings.expense_approval_threshold_2}
                    onChange={(e) => setSettings({ ...settings, expense_approval_threshold_2: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {locale === 'ar' ? 'تفاوت إغلاق الصندوق (EGP)' : 'Cash Closing Variance Threshold (EGP)'}
                  </label>
                  <input
                    type="number"
                    value={settings.cash_variance_approval_threshold}
                    onChange={(e) => setSettings({ ...settings, cash_variance_approval_threshold: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Feature Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                {locale === 'ar' ? 'قواعد العمل والسلامة' : 'Business Integrity Controls'}
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.credit_check_enabled}
                    onChange={(e) => setSettings({ ...settings, credit_check_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/40"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {locale === 'ar' ? 'تفعيل التحقق من الحد الائتماني للعميل' : 'Enable Customer Credit Limit Check'}
                    </span>
                    <p className="text-slate-400">
                      {locale === 'ar'
                        ? 'يمنع تأكيد أوامر البيع التي تتجاوز الحد الائتماني المسموح للعميل إلا بموافقة المدير'
                        : 'Requires Manager approval for sales orders exceeding credit limit'}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.negative_stock_allowed}
                    onChange={(e) => setSettings({ ...settings, negative_stock_allowed: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/40"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {locale === 'ar' ? 'السماح بالكميات السالبة بالمخزون' : 'Allow Negative Stock Quantities'}
                    </span>
                    <p className="text-slate-400">
                      {locale === 'ar'
                        ? 'حالة استثنائية: تسمح بصرف المواد حتى لو كان الرصيد المسجل صفراً'
                        : 'Allow stock issue when system quantity is zero'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <PermissionGate module="system_settings" action="edit">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('actions.save')}</span>
              </button>
            </PermissionGate>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
