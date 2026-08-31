'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { Clock, CheckCircle2, XCircle, AlertCircle, Eye, Check, X } from 'lucide-react';

export default function ApprovalsPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingApprovals = [
    {
      id: '1',
      approval_type: 'discount_override',
      type_label: locale === 'ar' ? 'تجاوز خصم السعر' : 'Price Discount Override',
      doc_number: 'QT-2026-00042',
      requester: locale === 'ar' ? 'أحمد محمود (مبيعات)' : 'Ahmed Mahmoud (Sales)',
      date: '2026-08-31 18:30',
      reason: locale === 'ar' ? 'خصم خاص لكمية كبيرة لعميل رئيسي' : 'Special discount for large volume customer',
      amount: '15,400 EGP',
    },
    {
      id: '2',
      approval_type: 'purchase_request',
      type_label: locale === 'ar' ? 'طلب شراء خامات' : 'Material Purchase Request',
      doc_number: 'PR-2026-00018',
      requester: locale === 'ar' ? 'مصطفى حسن (المخازن)' : 'Mustafa Hassan (Warehouse)',
      date: '2026-08-31 17:15',
      reason: locale === 'ar' ? 'شراء 50 طن ورق كرافت 140 جرام' : 'Purchase 50 Tons Kraft Paper 140 GSM',
      amount: '340,000 EGP',
    },
    {
      id: '3',
      approval_type: 'expense',
      type_label: locale === 'ar' ? 'مصروف صيانة' : 'Maintenance Expense',
      doc_number: 'EXP-2026-00105',
      requester: locale === 'ar' ? 'محمود القاضي (الصيانة)' : 'Mahmoud El-Kadi (Maintenance)',
      date: '2026-08-31 15:40',
      reason: locale === 'ar' ? 'قطع غيار طارئة لماكينة التضليع' : 'Emergency spare parts for Corrugator machine',
      amount: '4,500 EGP',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t('nav.approvals')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'ar'
                ? 'مركز الموافقات المركزي للطلبات المالية والإدارية والاستثناءات'
                : 'Centralized approval inbox for financial, administrative, and operational requests'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 transition-colors border-b-2 ${
              activeTab === 'pending'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {locale === 'ar' ? 'معلقة (بانتظار موافقتك)' : 'Pending Approvals'} (3)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {locale === 'ar' ? 'سجل الموافقات السابقة' : 'Approval History'}
          </button>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {req.doc_number}
                  </span>
                  <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded">
                    {req.type_label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{locale === 'ar' ? 'المقدم:' : 'Requester:'}</span> {req.requester} • {req.date}
                </p>
                <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic">
                  "{req.reason}"
                </p>
              </div>

              <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0 gap-3">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {req.amount}
                </span>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{t('actions.approve')}</span>
                  </button>
                  <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                    <X className="w-4 h-4" />
                    <span>{t('actions.reject')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
