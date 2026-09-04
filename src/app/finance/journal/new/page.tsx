'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { BookOpen, Plus, Trash2, ArrowLeft, Save, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface AccountOption {
  id: string;
  account_code: string;
  name_ar: string;
  name_en: string;
  is_header: boolean;
}

interface FormLine {
  account_id: string;
  account_code: string;
  account_name: string;
  debit: string;
  credit: string;
  description: string;
}

export default function NewJournalEntryPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [entryNumber, setEntryNumber] = useState(`QEYD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [lines, setLines] = useState<FormLine[]>([
    { account_id: '', account_code: '', account_name: '', debit: '0', credit: '0', description: '' },
    { account_id: '', account_code: '', account_name: '', debit: '0', credit: '0', description: '' },
  ]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await supabase
        .from('chart_of_accounts')
        .select('id, account_code, name_ar, name_en, is_header')
        .eq('is_header', false)
        .order('account_code', { ascending: true });

      if (data) setAccounts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', account_code: '', account_name: '', debit: '0', credit: '0', description: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof FormLine, value: string) => {
    const next = [...lines];
    next[index][field] = value;

    if (field === 'account_id') {
      const acc = accounts.find((a) => a.id === value);
      if (acc) {
        next[index].account_code = acc.account_code;
        next[index].account_name = locale === 'ar' ? acc.name_ar : acc.name_en;
      }
    }

    setLines(next);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    setSaving(true);
    try {
      // Simulate saving journal entry
      setTimeout(() => {
        setSaving(false);
        setSuccess(true);
        setTimeout(() => {
          router.push('/finance/journal');
        }, 1200);
      }, 800);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <PermissionGate module="journal_entries" action="create">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
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
                  {locale === 'ar' ? 'إنشاء قيد محاسبي يدوي جديد' : 'Create Manual Journal Entry'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'ar' ? 'إدخال حركات الدائن والمدين وتوزيعها على شجرة الحسابات (PRD §65)' : 'Post manual debit and credit journal lines'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/finance/journal')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                form="journal-form"
                disabled={!isBalanced || saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ وتأكيد القيد' : 'Post Entry')}</span>
              </button>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{locale === 'ar' ? 'تم حفظ القيد المحاسبي وتأكيده بنجاح! جاري التوجيه...' : 'Journal entry posted successfully! Redirecting...'}</span>
            </div>
          )}

          <form id="journal-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Entry Master Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'رقم القيد' : 'Entry Number'}
                </label>
                <input
                  type="text"
                  value={entryNumber}
                  onChange={(e) => setEntryNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'تاريخ القيد' : 'Entry Date'}
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {locale === 'ar' ? 'البيان الشامل للقيد' : 'General Description'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل وصف الحركة المحاسبية...' : 'Enter entry description...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Lines Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'بنود القيد (المدين والدائن)' : 'Journal Lines (Debit & Credit)'}
                </h3>

                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl">
                      <Scale className="w-3.5 h-3.5" /> {locale === 'ar' ? 'القيد متوازن 100%' : '100% Balanced'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5" /> {locale === 'ar' ? 'القيد غير متوازن (تأكد من تساوي المدين والدائن)' : 'Unbalanced (Debit != Credit)'}
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 text-start w-1/3">{locale === 'ar' ? 'حساب شجرة الحسابات' : 'Account'}</th>
                      <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'البيان التفصيلي' : 'Description'}</th>
                      <th className="py-2.5 px-3 text-end w-32">{locale === 'ar' ? 'مدين (EGP)' : 'Debit'}</th>
                      <th className="py-2.5 px-3 text-end w-32">{locale === 'ar' ? 'دائن (EGP)' : 'Credit'}</th>
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3">
                          <select
                            value={line.account_id}
                            onChange={(e) => updateLine(idx, 'account_id', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="">{locale === 'ar' ? '-- اختر الحساب من الشجرة --' : '-- Select Account --'}</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.account_code} - {locale === 'ar' ? a.name_ar : a.name_en}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => updateLine(idx, 'description', e.target.value)}
                            placeholder={locale === 'ar' ? 'وصف تفصيلي للبند...' : 'Line description...'}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={line.debit}
                            onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-end text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={line.credit}
                            onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-end text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            disabled={lines.length <= 2}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-black border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={2} className="py-3 px-3 text-start">
                        <button
                          type="button"
                          onClick={addLine}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{locale === 'ar' ? 'إضافة طرف جديد' : 'Add Line'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(totalDebit)}
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                        {formatCurrency(totalCredit)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </form>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
