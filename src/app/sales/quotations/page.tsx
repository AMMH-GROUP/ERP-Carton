'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Eye,
  Edit,
  Send,
  Check,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function QuotationsPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockQuotations = [
    {
      id: '1',
      quotation_number: 'QT-2026-00042',
      customer_name_ar: 'شركة أثاث المستقبل ش.م.م',
      customer_name_en: 'Future Furniture Co. S.A.E',
      date: '2026-08-31',
      total_amount: 154000,
      status: 'accepted',
      has_override: true,
    },
    {
      id: '2',
      quotation_number: 'QT-2026-00043',
      customer_name_ar: 'مجموعة الأغذية النظيفة',
      customer_name_en: 'Clean Food Group',
      date: '2026-08-31',
      total_amount: 320000,
      status: 'sent',
      has_override: false,
    },
    {
      id: '3',
      quotation_number: 'QT-2026-00040',
      customer_name_ar: 'مصنع الشرق للأجهزة الكهربائية',
      customer_name_en: 'Orient Electronics Factory',
      date: '2026-08-28',
      total_amount: 85000,
      status: 'converted',
      has_override: false,
    },
  ];

  return (
    <PermissionGate module="quotations" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.quotations')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة عروض الأسعار، حساب التكلفة والأسعار للمواصفات الخاصة، والتحويل لأوامر بيع'
                  : 'Manage quotations, custom box specifications, price overrides, and conversion to Sales Orders'}
              </p>
            </div>

            <PermissionGate module="quotations" action="create">
              <Link
                href="/sales/quotations/create"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'عرض سعر جديد' : 'New Quotation'}</span>
              </Link>
            </PermissionGate>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('nav.customers')}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {q.quotation_number}
                        {q.has_override && (
                          <span className="ms-2 text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 px-1.5 py-0.5 rounded font-bold">
                            {locale === 'ar' ? 'تعديل سعر' : 'Price Override'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? q.customer_name_ar : q.customer_name_en}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{q.date}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(q.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {q.status === 'accepted' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مقبول من العميل' : 'Accepted'}
                          </span>
                        ) : q.status === 'converted' ? (
                          <span className="bg-purple-50 text-purple-600 dark:bg-purple-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'محول لأمر بيع' : 'Converted to SO'}
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-600 dark:bg-blue-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مرسل للعميل' : 'Sent'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {q.status === 'accepted' && (
                            <PermissionGate module="sales_orders" action="create">
                              <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1">
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                <span>{locale === 'ar' ? 'تحويل لأمر بيع' : 'Convert to SO'}</span>
                              </button>
                            </PermissionGate>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
