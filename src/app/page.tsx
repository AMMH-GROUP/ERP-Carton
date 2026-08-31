'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { usePermissions } from '@/lib/permissions/context';
import {
  TrendingUp,
  PackageCheck,
  Factory,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const { roles, isSuperAdmin } = usePermissions();

  const kpis = [
    {
      title: locale === 'ar' ? 'أوامر البيع النشطة' : 'Active Sales Orders',
      value: '24',
      change: '+12%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: locale === 'ar' ? 'خطة الإنتاج اليومية' : 'Daily Production Target',
      value: '45,000 m²',
      change: '88% Target',
      isPositive: true,
      icon: Factory,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: locale === 'ar' ? 'رصيد الورق الخام' : 'Raw Paper Stock',
      value: '185 Tons',
      change: '-5 Tons Today',
      isPositive: false,
      icon: PackageCheck,
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: locale === 'ar' ? 'تحصيلات اليوم' : 'Today Cash Receipts',
      value: '125,000 EGP',
      change: '+15%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const pendingApprovals = [
    {
      type: locale === 'ar' ? 'خصم خاص (سعر)' : 'Price Discount Override',
      doc: 'QT-2026-00042',
      requester: locale === 'ar' ? 'أحمد محمود (مبيعات)' : 'Ahmed Mahmoud (Sales)',
      amount: '15,400 EGP',
      time: '10 mins ago',
    },
    {
      type: locale === 'ar' ? 'طلب شراء ورق كرافت' : 'Kraft Paper Purchase Request',
      doc: 'PR-2026-00018',
      requester: locale === 'ar' ? 'مصطفى حسن (المخازن)' : 'Mustafa Hassan (Warehouse)',
      amount: '340,000 EGP',
      time: '1 hour ago',
    },
    {
      type: locale === 'ar' ? 'مصروف صيانة ماكينة' : 'Machine Maintenance Expense',
      doc: 'EXP-2026-00105',
      requester: locale === 'ar' ? 'محمود القاضي (الصيانة)' : 'Mahmoud El-Kadi (Maintenance)',
      amount: '4,500 EGP',
      time: '2 hours ago',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSuperAdmin
                  ? locale === 'ar'
                    ? 'صلاحية مدير النظام الكاملة'
                    : 'Super Admin Privileges Active'
                  : `${roles[0] || 'Staff'} Role`}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('app.welcome')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('app.tagline')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {locale === 'ar' ? 'المصنع يعمل بصورة طبيعية' : 'Factory Operational'}
            </span>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {kpi.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                    {kpi.isPositive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5" /> {kpi.change}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center">
                        <ArrowDownRight className="w-3.5 h-3.5" /> {kpi.change}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals Inbox Widget */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'طلبات تنتظر موافقتك' : 'Pending Approvals'}
                </h2>
              </div>
              <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full">
                3 {locale === 'ar' ? 'طلبات' : 'Pending'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {pendingApprovals.map((req, idx) => (
                <div
                  key={idx}
                  className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {req.doc}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {req.requester} • {req.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {req.amount}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs">
                        {t('actions.approve')}
                      </button>
                      <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-lg text-xs font-semibold transition-colors">
                        {t('actions.reject')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick System Status Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {locale === 'ar' ? 'حالة الوحدات النمطية' : 'Module Readiness'}
              </h2>

              <div className="space-y-3 mt-4">
                {[
                  { name: locale === 'ar' ? 'قواعد البيانات والـ Schema' : 'Database & Schema', status: 'Phase 1 Ready' },
                  { name: locale === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : 'Roles & Permissions', status: 'Active' },
                  { name: locale === 'ar' ? 'ثنائية اللغة (RTL/LTR)' : 'Bilingual i18n Engine', status: 'Active' },
                  { name: locale === 'ar' ? 'محرك الموافقات التلقائي' : 'Approval Engine', status: 'Active' },
                  { name: locale === 'ar' ? 'التحديث الفوري (Realtime)' : 'Supabase Realtime', status: 'Active' },
                ].map((mod, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {mod.name}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                {locale === 'ar'
                  ? 'المرحلة 1 (التأسيس) مكتملة بنجاح 100%'
                  : 'Phase 1 (Foundation) 100% Complete'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
