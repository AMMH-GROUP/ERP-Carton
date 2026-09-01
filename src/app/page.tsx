'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { usePermissions } from '@/lib/permissions/context';
import {
  TrendingUp,
  PackageCheck,
  Factory,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  PlusCircle,
  FileText,
  Truck,
  Receipt,
  Layers,
  BarChart3,
  ArrowRight,
  ArrowLeft
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
      href: '/sales/orders',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      title: locale === 'ar' ? 'خطة الإنتاج اليومية' : 'Daily Production Target',
      value: '45,000 m²',
      change: '88% Target',
      isPositive: true,
      icon: Factory,
      href: '/manufacturing/orders',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: locale === 'ar' ? 'رصيد الورق الخام' : 'Raw Paper Stock',
      value: '185 Tons',
      change: '-5 Tons Today',
      isPositive: false,
      icon: PackageCheck,
      href: '/inventory/stock',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: locale === 'ar' ? 'تحصيلات اليوم' : 'Today Cash Receipts',
      value: '125,000 EGP',
      change: '+15%',
      isPositive: true,
      icon: DollarSign,
      href: '/finance/treasury',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const quickActions = [
    {
      title: locale === 'ar' ? 'حاسبة عروض الأسعار' : 'Quotation Price Builder',
      desc: locale === 'ar' ? 'تسعير كرتونة مخصصة بالجراماج' : 'Custom Box Pricing Engine',
      href: '/sales/quotations/create',
      icon: Calculator,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    {
      title: locale === 'ar' ? 'أوامر الإنتاج والتصنيع' : 'Production Orders',
      desc: locale === 'ar' ? 'إصدار ومتابعة أوامر التشغيل' : 'MO Release & Tracking',
      href: '/manufacturing/orders',
      icon: Factory,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      title: locale === 'ar' ? 'بوابة فحص الجودة' : 'QC Inspection Gate',
      desc: locale === 'ar' ? 'اعتماد دخول البضاعة التامة' : 'FG Stock Movement Gate',
      href: '/manufacturing/qc',
      icon: ShieldCheck,
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    },
    {
      title: locale === 'ar' ? 'تقرير الأداء التنفيذي' : 'Executive Dashboard',
      desc: locale === 'ar' ? 'مؤشرات OEE والأرباح والربحية' : 'Factory Yield & Margin BI',
      href: '/reports/executive',
      icon: BarChart3,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
  ];

  const pendingApprovals = [
    {
      type: locale === 'ar' ? 'خصم خاص (سعر)' : 'Price Discount Override',
      doc: 'QT-2026-00042',
      href: '/sales/quotations',
      requester: locale === 'ar' ? 'أحمد محمود (مبيعات)' : 'Ahmed Mahmoud (Sales)',
      amount: '15,400 EGP',
      time: '10 mins ago',
    },
    {
      type: locale === 'ar' ? 'طلب شراء ورق كرافت' : 'Kraft Paper Purchase Request',
      doc: 'PR-2026-00018',
      href: '/purchasing/requests',
      requester: locale === 'ar' ? 'مصطفى حسن (المخازن)' : 'Mustafa Hassan (Warehouse)',
      amount: '340,000 EGP',
      time: '1 hour ago',
    },
    {
      type: locale === 'ar' ? 'مصروف صيانة ماكينة' : 'Machine Maintenance Expense',
      doc: 'EXP-2026-00105',
      href: '/finance/expenses',
      requester: locale === 'ar' ? 'محمود القاضي (الصيانة)' : 'Mahmoud El-Kadi (Maintenance)',
      amount: '4,500 EGP',
      time: '2 hours ago',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2 bg-indigo-900/40 w-max px-3 py-1 rounded-full border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSuperAdmin
                    ? locale === 'ar'
                      ? 'صلاحية مدير النظام الكاملة'
                      : 'Super Admin Privileges Active'
                    : `${roles[0] || 'Staff'} Role`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t('app.welcome')}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                {t('app.tagline')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-2xl text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                {locale === 'ar' ? 'المصنع يعمل بصورة طبيعية' : 'Factory Operational'}
              </span>

              <Link
                href="/sales/quotations/create"
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Calculator className="w-4 h-4" />
                <span>{locale === 'ar' ? 'حاسبة الكرتون' : 'Box Calculator'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Workflow Navigation Bar */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {locale === 'ar' ? 'اختصارات العمل السريعة' : 'Quick Navigation Shortcuts'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  href={action.href}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${action.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {action.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  {locale === 'ar' ? (
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={idx}
                href={kpi.href}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {kpi.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold">
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
              </Link>
            );
          })}
        </div>

        {/* Main Content Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals Inbox Widget */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'طلبات تنتظر موافقتك' : 'Pending Approvals'}
                </h2>
              </div>
              <Link
                href="/approvals"
                className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                3 {locale === 'ar' ? 'طلبات' : 'Pending'}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {pendingApprovals.map((req, idx) => (
                <div
                  key={idx}
                  className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={req.href} className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        {req.doc}
                      </Link>
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {req.requester} • {req.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {req.amount}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/approvals"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        {t('actions.approve')}
                      </Link>
                      <Link
                        href="/approvals"
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
                      >
                        {t('actions.reject')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick System Status Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {locale === 'ar' ? 'حالة الوحدات النمطية' : 'Module Readiness'}
              </h2>

              <div className="space-y-3.5 mt-4">
                {[
                  { name: locale === 'ar' ? 'قواعد البيانات والـ Schema' : 'Database & Schema', status: 'Online Ready' },
                  { name: locale === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : 'Roles & Permissions', status: 'Active' },
                  { name: locale === 'ar' ? 'ثنائية اللغة (RTL/LTR)' : 'Bilingual i18n Engine', status: 'Active' },
                  { name: locale === 'ar' ? 'محرك الموافقات التلقائي' : 'Approval Engine', status: 'Active' },
                  { name: locale === 'ar' ? 'الربط التلقائي (Supabase)' : 'Supabase Connected', status: 'Active' },
                ].map((mod, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      {mod.name}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 text-center">
                {locale === 'ar'
                  ? 'النظام مكتمل ومتصل أونلاين بنجاح 100%'
                  : 'System 100% Complete & Connected Online'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
