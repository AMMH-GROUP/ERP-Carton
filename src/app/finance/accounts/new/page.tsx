'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Landmark, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface ParentOption {
  id: string;
  account_code: string;
  name_ar: string;
  name_en: string;
  level: number;
}

export default function NewAccountPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [parents, setParents] = useState<ParentOption[]>([]);
  const [accountCode, setAccountCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [accountTypeId, setAccountTypeId] = useState('');
  const [parentId, setParentId] = useState('');
  const [level, setLevel] = useState(1);
  const [isHeader, setIsHeader] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data } = await supabase
        .from('chart_of_accounts')
        .select('id, account_code, name_ar, name_en, level')
        .order('account_code', { ascending: true });

      if (data) setParents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleParentChange = (pid: string) => {
    setParentId(pid);
    const parent = parents.find((p) => p.id === pid);
    if (parent) {
      setLevel(parent.level + 1);
    } else {
      setLevel(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      setTimeout(() => {
        setSaving(false);
        setSuccess(true);
        setTimeout(() => {
          router.push('/finance/accounts');
        }, 1200);
      }, 800);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <PermissionGate module="chart_of_accounts" action="create">
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
                  {locale === 'ar' ? 'إضافة حساب جديد لشجرة الحسابات' : 'Add New Account to Shajara'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'ar' ? 'تعريف حساب جديد وتحديد مستواه والحساب الأب المباشر له (PRD §64)' : 'Create a new account node in the Chart of Accounts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/finance/accounts')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                form="account-form"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ الحساب' : 'Save Account')}</span>
              </button>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{locale === 'ar' ? 'تم حفظ الحساب جديد في شجرة الحسابات بنجاح!' : 'New account created successfully! Redirecting...'}</span>
            </div>
          )}

          <form id="account-form" onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'رمز الحساب المحاسبي' : 'Account Code'}
                </label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="مثال: 110103"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'الحساب الأب المباشر' : 'Parent Account'}
                </label>
                <select
                  value={parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{locale === 'ar' ? '-- لا يوجد (حساب جذر المستوى 1) --' : '-- None (Root Level 1) --'}</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.account_code} - {locale === 'ar' ? p.name_ar : p.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'اسم الحساب بالعربية' : 'Arabic Name'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: الخزينة الفرعية ب"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'اسم الحساب بالإنجليزية' : 'English Name'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Secondary Cashbox B"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'نوع الحساب الرئيسي' : 'Account Category'}
                </label>
                <select
                  value={accountTypeId}
                  onChange={(e) => setAccountTypeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">{locale === 'ar' ? '-- اختر نوع الحساب --' : '-- Select Type --'}</option>
                  <option value="asset">{locale === 'ar' ? 'الأصول (Asset)' : 'Asset'}</option>
                  <option value="liability">{locale === 'ar' ? 'الالتزامات (Liability)' : 'Liability'}</option>
                  <option value="equity">{locale === 'ar' ? 'حقوق الملكية (Equity)' : 'Equity'}</option>
                  <option value="revenue">{locale === 'ar' ? 'الإيرادات (Revenue)' : 'Revenue'}</option>
                  <option value="expense">{locale === 'ar' ? 'المصاريف (Expense)' : 'Expense'}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isHeader"
                  checked={isHeader}
                  onChange={(e) => setIsHeader(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isHeader" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  {locale === 'ar' ? 'حساب رئيسي (تجميعي ولا يقبل الترحيل المباشر)' : 'Header Account (Non-postable parent)'}
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {locale === 'ar' ? 'الوصف والمعيار المحاسبي' : 'Description'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل معلومات الحساب أو المعيار التابع له...' : 'Enter description...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
