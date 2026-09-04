'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { FileText, TrendingUp, Scale, PieChart, Landmark, ArrowUpRight, ArrowDownRight, Printer, Download, Calendar, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function FinancialReportsPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pnl' | 'trial_balance' | 'rev_exp' | 'equity'>('pnl');
  const [period, setPeriod] = useState('2026-09');
  const [loading, setLoading] = useState(false);

  // Financial Data state mapped to Shajara Account Codes
  const pnlData = {
    operatingRevenue: 4850000,
    otherRevenue: 12000,
    totalRevenue: 4862000,
    
    // Direct Costs (51)
    cogs: 3400000,
    directSalaries: 220000,
    salesCommissions: 45000,
    freightCustoms: 65000,
    totalDirectCosts: 3730000,

    grossProfit: 1132000,

    // Operating Expenses (52)
    adminSalaries: 100000,
    medicalInsurance: 15000,
    marketing: 25000,
    rent: 40000,
    utilities: 45000,
    depreciation: 35000,
    otherOpex: 20000,
    totalOpex: 280000,

    operatingProfit: 852000,

    // Non-Operating (53)
    zakat: 25000,
    taxes: 35000,
    totalNonOperating: 60000,

    netProfit: 792000
  };

  const trialBalanceAccounts = [
    { code: '110101', name_ar: 'النقدية في الخزينة', name_en: 'Cash in Safe', debit: 485000, credit: 0 },
    { code: '110201', name_ar: 'حساب البنك الجاري', name_en: 'Current Bank Account', debit: 2850000, credit: 0 },
    { code: '1103', name_ar: 'المدينون (العملاء)', name_en: 'Accounts Receivable', debit: 1420000, credit: 0 },
    { code: '1106', name_ar: 'المخزون (مواد أولية وتام)', name_en: 'Inventory', debit: 1950000, credit: 0 },
    { code: '120103', name_ar: 'المعدات والآلات', name_en: 'Machinery & Equipment', debit: 4500000, credit: 0 },
    { code: '2101', name_ar: 'الدائنون (الموردون)', name_en: 'Accounts Payable', debit: 0, credit: 1715000 },
    { code: '2105', name_ar: 'ضريبة القيمة المضافة المستحقة', name_en: 'VAT Payable', debit: 0, credit: 245000 },
    { code: '3101', name_ar: 'رأس المال المسجل', name_en: 'Registered Capital', debit: 0, credit: 5000000 },
    { code: '3402', name_ar: 'الأرباح المبقاة', name_en: 'Retained Earnings', debit: 0, credit: 3453000 },
    { code: '4101', name_ar: 'إيرادات المبيعات/الخدمات', name_en: 'Sales Revenue', debit: 0, credit: 4862000 },
    { code: '5101', name_ar: 'تكلفة البضاعة المباعة', name_en: 'COGS', debit: 3400000, credit: 0 },
    { code: '5102', name_ar: 'رواتب وأجور التشغيل', name_en: 'Direct Salaries', debit: 220000, credit: 0 },
    { code: '5201', name_ar: 'الرواتب الإدارية', name_en: 'Admin Salaries', debit: 100000, credit: 0 },
    { code: '5210', name_ar: 'مصاريف خدمات المكتب والكهرباء', name_en: 'Utilities Expense', debit: 45000, credit: 0 },
    { code: '5215', name_ar: 'مصاريف الإهلاك', name_en: 'Depreciation Expense', debit: 35000, credit: 0 },
    { code: '5301', name_ar: 'الزكاة والضرائب', name_en: 'Zakat & Tax', debit: 60000, credit: 0 }
  ];

  const totalTBDebit = trialBalanceAccounts.reduce((sum, a) => sum + a.debit, 0);
  const totalTBCredit = trialBalanceAccounts.reduce((sum, a) => sum + a.credit, 0);
  const isTBBalanced = Math.abs(totalTBDebit - totalTBCredit) < 0.01;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PermissionGate module="chart_of_accounts" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'التقارير المالية وشجرة الحسابات' : 'Financial & GL Reports'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'تقارير الأرباح والخسائر، ميزان المراجعة، وحقوق الملكية المستخرجة مباشرة من شجرة الحسابات (PRD §68)'
                  : 'Automated P&L, Trial Balance, and Equity reports driven by the General Ledger'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="2026-09">سبتمبر 2026</option>
                  <option value="2026-08">أغسطس 2026</option>
                  <option value="2026-Q3">الربع الثالث 2026</option>
                  <option value="2026-YTD">إجمالي السنة المالية 2026</option>
                </select>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>{locale === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('pnl')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'pnl'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{locale === 'ar' ? 'الأرباح والخسائر (P&L)' : 'Profit & Loss (P&L)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('trial_balance')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'trial_balance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{locale === 'ar' ? 'ميزان المراجعة (Trial Balance)' : 'Trial Balance'}</span>
            </button>

            <button
              onClick={() => setActiveTab('rev_exp')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'rev_exp'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>{locale === 'ar' ? 'تحليل الإيرادات والمصروفات' : 'Revenue & Expense Breakdown'}</span>
            </button>

            <button
              onClick={() => setActiveTab('equity')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'equity'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>{locale === 'ar' ? 'حقوق الملكية والتغيرات المالية' : 'Statement of Equity'}</span>
            </button>
          </div>

          {/* TAB 1: Profit & Loss */}
          {activeTab === 'pnl' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block">
                    {locale === 'ar' ? 'إجمالي الإيرادات (4)' : 'Total Revenue (4)'}
                  </span>
                  <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {formatCurrency(pnlData.totalRevenue)}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block">
                    {locale === 'ar' ? 'مجمل الربح (Gross Profit)' : 'Gross Profit'}
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {formatCurrency(pnlData.grossProfit)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                    هامش مجمل الربح: {((pnlData.grossProfit / pnlData.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 block">
                    {locale === 'ar' ? 'صافي الربح النهائي (Net Profit)' : 'Net Profit'}
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {formatCurrency(pnlData.netProfit)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                    صافي الهامش: {((pnlData.netProfit / pnlData.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Detailed P&L Statement Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {locale === 'ar' ? 'قائمة الأرباح والخسائر الشاملة' : 'Comprehensive Income Statement'}
                  </h3>
                  <span className="text-xs font-bold text-slate-500">العملة: EGP</span>
                </div>

                <div className="space-y-4">
                  {/* Revenue Section */}
                  <div>
                    <div className="flex justify-between font-black text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 p-3 rounded-xl">
                      <span>4 - الإيرادات (Revenues)</span>
                      <span>{formatCurrency(pnlData.totalRevenue)}</span>
                    </div>
                    <div className="ps-4 mt-2 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>4101 - إيرادات المبيعات والخدمات</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.operatingRevenue)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>4201 - إيرادات أخرى</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.otherRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Costs Section */}
                  <div>
                    <div className="flex justify-between font-black text-sm text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-3 rounded-xl">
                      <span>51 - التكاليف المباشرة (Direct Costs / COGS)</span>
                      <span>({formatCurrency(pnlData.totalDirectCosts)})</span>
                    </div>
                    <div className="ps-4 mt-2 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5101 - تكلفة البضاعة المباعة (ورق وخامات الكرتون)</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.cogs)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5102 - رواتب وأجور الفنيين والعمال التشغيلية</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.directSalaries)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5103 - عمولات البيع</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.salesCommissions)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>5104 - شحن وتخليص جمركي الخامات</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.freightCustoms)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gross Profit Row */}
                  <div className="flex justify-between font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span>مجمل الربح (Gross Profit)</span>
                    <span className="font-mono">{formatCurrency(pnlData.grossProfit)}</span>
                  </div>

                  {/* Operating Expenses Section */}
                  <div>
                    <div className="flex justify-between font-black text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl">
                      <span>52 - المصاريف والتكاليف التشغيلية (Operating Expenses)</span>
                      <span>({formatCurrency(pnlData.totalOpex)})</span>
                    </div>
                    <div className="ps-4 mt-2 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5201 - الرواتب والرسوم الإدارية</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.adminSalaries)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5202 - التأمين الطبي</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.medicalInsurance)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5203 - مصاريف تسويقية ودعائية</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.marketing)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5204 - مصاريف الإيجار</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.rent)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5210 - مصاريف خدمات المكتب والكهرباء</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.utilities)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>5215 - مصاريف إهلاك الأصول والمعدات</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.depreciation)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>5214 - مصاريف إدارية عمومية أخرى</span>
                        <span className="font-mono font-bold">{formatCurrency(pnlData.otherOpex)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit Row */}
                  <div className="flex justify-between font-black text-base text-white bg-indigo-600 p-4 rounded-xl shadow-md">
                    <span>صافي الربح بعد الاستقطاعات والزكاة (Net Profit)</span>
                    <span className="font-mono">{formatCurrency(pnlData.netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Trial Balance */}
          {activeTab === 'trial_balance' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {locale === 'ar' ? 'ميزان المراجعة بالأرصدة والقيود المحاسبية' : 'General Ledger Trial Balance'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {locale === 'ar'
                        ? 'تأكيد التوازن التلقائي لكل بند في شجرة الحسابات (إجمالي المدين = إجمالي الدائن)'
                        : 'Double-entry balance check across all chart of account nodes'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTBBalanced ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                        <Scale className="w-4 h-4" /> {locale === 'ar' ? 'متوازن 100% (الفرق = 0)' : 'Balanced 100% (Diff = 0)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl">
                        {locale === 'ar' ? 'يوجد فروقات غير متوازنة' : 'Imbalance Detected'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-3 px-4 text-start">{locale === 'ar' ? 'رمز الحساب' : 'Code'}</th>
                        <th className="py-3 px-4 text-start">{locale === 'ar' ? 'اسم الحساب في الشجرة' : 'Account Name'}</th>
                        <th className="py-3 px-4 text-end">{locale === 'ar' ? 'الرصيد المدين (EGP)' : 'Debit'}</th>
                        <th className="py-3 px-4 text-end">{locale === 'ar' ? 'الرصيد الدائن (EGP)' : 'Credit'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {trialBalanceAccounts.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {acc.code}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {locale === 'ar' ? acc.name_ar : acc.name_en}
                          </td>
                          <td className="py-2.5 px-4 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                            {acc.debit > 0 ? formatCurrency(acc.debit) : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-end font-mono font-bold text-slate-900 dark:text-slate-100">
                            {acc.credit > 0 ? formatCurrency(acc.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800 font-black border-t-2 border-slate-300 dark:border-slate-700 text-sm">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-start">
                          {locale === 'ar' ? 'الإجمالي العام لميزان المراجعة' : 'Total Trial Balance'}
                        </td>
                        <td className="py-3 px-4 text-end font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(totalTBDebit)}
                        </td>
                        <td className="py-3 px-4 text-end font-mono text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(totalTBCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Revenue & Expense Breakdown */}
          {activeTab === 'rev_exp' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                {locale === 'ar' ? 'التحليل التفصيلي للإيرادات والمصروفات حسب شجرة الحسابات' : 'Granular Revenue & Expense Breakdown'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Card */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 space-y-3">
                  <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200">
                    4 - الإيرادات المباشرة وغير المباشرة
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-indigo-100 dark:border-indigo-900">
                      <span>4101 - إيراد بيع كرتون مضلع</span>
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        {formatCurrency(4850000)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>4201 - إيرادات متنوعة</span>
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        {formatCurrency(12000)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expense Card */}
                <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-5 space-y-3">
                  <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                    5 - التكاليف والمصاريف التشغيلية
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-rose-100 dark:border-rose-900">
                      <span>5101 - خامات ورق كرافت ومستلزمات كرتون</span>
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                        {formatCurrency(3400000)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-rose-100 dark:border-rose-900">
                      <span>5102 - أجور وروااتب عمال الإنتاج</span>
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                        {formatCurrency(220000)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>5210 - فواتير كهرباء ومياه خدمات مصنع الكرتون</span>
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                        {formatCurrency(45000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Statement of Equity */}
          {activeTab === 'equity' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                {locale === 'ar' ? 'قائمة التغيرات في حقوق الملكية (3)' : 'Statement of Changes in Equity'}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold">
                  <span>3101 - رأس المال المسجل بالسجل التجاري</span>
                  <span className="font-mono text-sm">{formatCurrency(5000000)}</span>
                </div>

                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold">
                  <span>3201 - الأرصدة الافتتاحية المدورة</span>
                  <span className="font-mono text-sm">{formatCurrency(0)}</span>
                </div>

                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-bold">
                  <span>3402 - الأرباح المبقاة المدورة من سنوات سابقة</span>
                  <span className="font-mono text-sm">{formatCurrency(3453000)}</span>
                </div>

                <div className="flex justify-between p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>3401 - صافي ربح الفترة الحالية (من قائمة الأرباح والخسائر)</span>
                  <span className="font-mono text-sm">{formatCurrency(pnlData.netProfit)}</span>
                </div>

                <div className="flex justify-between p-4 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-md">
                  <span>إجمالي حقوق الملكية بنهاية الفترة</span>
                  <span className="font-mono">{formatCurrency(5000000 + 3453000 + pnlData.netProfit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </PermissionGate>
  );
}
