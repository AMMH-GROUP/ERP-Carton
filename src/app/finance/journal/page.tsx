'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { BookOpen, Plus, Search, CheckCircle2, Clock, Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function JournalEntriesPage() {
  const { t, locale } = useTranslation();

  const mockJEs = [
    {
      id: '1',
      entry_number: 'JE-2026-00045',
      date: '2026-08-31',
      period: '2026-08',
      description: locale === 'ar' ? 'ترحيل قيد استلام مشتريات ورق كرافت (GRN-2026-00014)' : 'Post Goods Receipt Paper Inbound',
      total_debit: 1625000,
      total_credit: 1625000,
      is_posted: true,
      lines: [
        { code: '1300', name: 'مخزون الورق الخام', debit: 1625000, credit: 0 },
        { code: '2100', name: 'شركة النيل للورق (موردون)', debit: 0, credit: 1625000 },
      ],
    },
    {
      id: '2',
      entry_number: 'JE-2026-00042',
      date: '2026-08-30',
      period: '2026-08',
      description: locale === 'ar' ? 'ترحيل فاتورة مبيعات أثاث المستقبل (INV-2026-00030)' : 'Post Sales Invoice Future Furniture',
      total_debit: 1425000,
      total_credit: 1425000,
      is_posted: true,
      lines: [
        { code: '1200', name: 'شركة أثاث المستقبل (عملاء)', debit: 1425000, credit: 0 },
        { code: '4000', name: 'إيرادات المبيعات', debit: 0, credit: 1425000 },
      ],
    },
  ];

  return (
    <PermissionGate module="journal_entries" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.journalEntries')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'سجل القيود المحاسبية المزدوجة والتأكد الذاتي من توازن المدين والدائن (PRD §65)'
                  : 'Double-entry General Ledger journal entries with strict debit = credit balance verification'}
              </p>
            </div>

            <PermissionGate module="journal_entries" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'قيد محاسبي يدوي' : 'Manual Journal Entry'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Journal Entries List */}
          <div className="space-y-4">
            {mockJEs.map((je) => (
              <div key={je.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {je.entry_number}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{je.date}</span>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{je.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      <Scale className="w-3.5 h-3.5" /> {locale === 'ar' ? 'متوازن 100%' : 'Balanced'}
                    </span>
                    <span className="bg-indigo-50 text-indigo-600 font-bold text-[10px] px-2 py-0.5 rounded">
                      {locale === 'ar' ? 'مُرحل' : 'Posted'}
                    </span>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5 text-start">{t('common.code')}</th>
                        <th className="p-2.5 text-start">{t('nav.chartOfAccounts')}</th>
                        <th className="p-2.5 text-end">{locale === 'ar' ? 'مدين (Debit)' : 'Debit'}</th>
                        <th className="p-2.5 text-end">{locale === 'ar' ? 'دائن (Credit)' : 'Credit'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {je.lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono font-bold text-indigo-600">{l.code}</td>
                          <td className="p-2.5 font-bold">{l.name}</td>
                          <td className="p-2.5 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                            {l.debit > 0 ? formatCurrency(l.debit) : '-'}
                          </td>
                          <td className="p-2.5 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                            {l.credit > 0 ? formatCurrency(l.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
