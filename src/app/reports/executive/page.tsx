'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  TrendingUp,
  DollarSign,
  Factory,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function ExecutiveDashboardPage() {
  const { t, locale } = useTranslation();

  const kpis = [
    {
      title: locale === 'ar' ? 'إجمالي مبيعات الشهر' : 'Monthly Sales Revenue',
      value: formatCurrency(4850000),
      trend: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'indigo',
    },
    {
      title: locale === 'ar' ? 'هامش الربح الإجمالي' : 'Gross Profit Margin',
      value: '28.4%',
      trend: '+2.1%',
      isPositive: true,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: locale === 'ar' ? 'إنتاجية المصنع (الإنتاج التام)' : 'Factory Production Yield',
      value: '385,000 PCS',
      trend: '+8.4%',
      isPositive: true,
      icon: Factory,
      color: 'blue',
    },
    {
      title: locale === 'ar' ? 'نسبة الهالك والخردة (Scrap Rate)' : 'Scrap Rate %',
      value: '2.8%',
      trend: '-0.4%', // Lower scrap rate is positive
      isPositive: true,
      icon: AlertTriangle,
      color: 'amber',
    },
  ];

  return (
    <PermissionGate module="audit_logs" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.executiveBi')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'مؤشرات الأداء الرئيسية الشاملة لمصنع الكرتون المضلع (Executive Business Intelligence)'
                  : 'Executive BI performance metrics, profitability, yield, scrap rates, and liquidity'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                {locale === 'ar' ? 'الفترة: أغسطس 2026' : 'Period: August 2026'}
              </span>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">{kpi.title}</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono block">{kpi.value}</span>
                    <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">{kpi.trend} vs الشهر السابق</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operational Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OEE Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  {locale === 'ar' ? 'كفاءة الماكينات الإجمالية (OEE)' : 'Overall Equipment Effectiveness (OEE)'}
                </h3>
                <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">84.2%</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{locale === 'ar' ? 'الجاهزية والتوفر (Availability):' : 'Availability:'}</span>
                    <span className="font-mono font-bold">92.0%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{locale === 'ar' ? 'معدل الأداء والسرعة (Performance):' : 'Performance:'}</span>
                    <span className="font-mono font-bold">94.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '94.5%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{locale === 'ar' ? 'معدل الجودة والمطابقة (Quality):' : 'Quality Rate:'}</span>
                    <span className="font-mono font-bold">96.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '96.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  {locale === 'ar' ? 'توزيع التكلفة الإجمالية للمنتج' : 'Cost Distribution'}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold">{locale === 'ar' ? 'المواد الخام (الورق والنشا والإنك):' : 'Raw Materials (Paper & Starch):'}</span>
                  <span className="font-mono font-extrabold text-indigo-600 text-sm">68.5%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold">{locale === 'ar' ? 'العمالة المباشرة والتشغيل:' : 'Direct Labor:'}</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm">14.2%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold">{locale === 'ar' ? 'صيانة الماكينات والطاقة:' : 'Machine & Energy:'}</span>
                  <span className="font-mono font-extrabold text-amber-600 text-sm">11.3%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold">{locale === 'ar' ? 'المصروفات غير المباشرة (Overhead):' : 'Manufacturing Overhead:'}</span>
                  <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300 text-sm">6.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
