'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Landmark, Plus, Folder, FileText, ChevronRight, ChevronDown, Search, Filter, Layers, Eye, RefreshCw, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface AccountNode {
  id: string;
  account_code: string;
  name_ar: string;
  name_en: string;
  account_type_id: string;
  parent_id: string | null;
  level: number;
  is_header: boolean;
  is_active: boolean;
  description?: string;
  account_types?: {
    code: string;
    name_ar: string;
    name_en: string;
    normal_balance: string;
  };
  children?: AccountNode[];
}

export default function ChartOfAccountsPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<AccountNode | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select(`
          *,
          account_types (
            code,
            name_ar,
            name_en,
            normal_balance
          )
        `)
        .order('account_code', { ascending: true });

      if (error) {
        console.error('Error fetching chart of accounts:', error);
      } else if (data) {
        setAccounts(data);
        // Expand top-level nodes by default
        const initExpanded: Record<string, boolean> = {};
        data.forEach((acc) => {
          if (acc.level <= 2 || acc.is_header) {
            initExpanded[acc.id] = true;
          }
        });
        setExpandedNodes(initExpanded);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    accounts.forEach((acc) => (allExp[acc.id] = true));
    setExpandedNodes(allExp);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Build tree from flat accounts array
  const treeData = useMemo(() => {
    const map: Record<string, AccountNode> = {};
    const roots: AccountNode[] = [];

    // Filter accounts if search/type filter is active
    let filtered = [...accounts];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.account_code.toLowerCase().includes(q) ||
          a.name_ar.toLowerCase().includes(q) ||
          a.name_en.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((a) => a.account_types?.code === selectedType);
    }

    // If searching or filtering, return flat list as roots for easy viewing
    if (search.trim() || selectedType !== 'all') {
      return filtered.map((a) => ({ ...a, children: [] }));
    }

    // Otherwise build hierarchical tree
    accounts.forEach((acc) => {
      map[acc.id] = { ...acc, children: [] };
    });

    accounts.forEach((acc) => {
      if (acc.parent_id && map[acc.parent_id]) {
        map[acc.parent_id].children?.push(map[acc.id]);
      } else {
        roots.push(map[acc.id]);
      }
    });

    return roots;
  }, [accounts, search, selectedType]);

  const getTypeBadgeColor = (typeCode?: string) => {
    switch (typeCode) {
      case 'asset':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'liability':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'equity':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'revenue':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'expense':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const renderNode = (node: AccountNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];
    const isArabic = locale === 'ar';

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-xs cursor-pointer ${
            node.is_header
              ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-700'
          }`}
          onClick={() => {
            if (hasChildren) toggleExpand(node.id);
            else setSelectedAccount(node);
          }}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {node.is_header ? (
              <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            )}

            <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm tracking-wide">
              {node.account_code}
            </span>

            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isArabic ? node.name_ar : node.name_en}
            </span>

            {node.is_header && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {isArabic ? 'حساب رئيسي' : 'Header'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getTypeBadgeColor(
                node.account_types?.code
              )}`}
            >
              {isArabic ? node.account_types?.name_ar : node.account_types?.name_en}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAccount(node);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isArabic ? 'عرض كشف الحساب' : 'View Ledger'}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="ps-6 space-y-1 border-s-2 border-slate-200/60 dark:border-slate-800 ms-4 my-1">
            {node.children!.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <PermissionGate module="chart_of_accounts" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.chartOfAccounts')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'دليل الحسابات الشجري الخماسي المستويات (78 حساب مقسمة حسب المعايير المحاسبية)'
                  : 'Complete 5-Level Hierarchical Chart of Accounts structure'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAccounts}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                title={locale === 'ar' ? 'تحديث' : 'Refresh'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <PermissionGate module="chart_of_accounts" action="create">
                <button
                  onClick={() => router.push('/finance/accounts/new')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'حساب جديد' : 'New Account'}</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  locale === 'ar' ? 'بحث برقم الحساب أو الاسم (مثال: 1101 أو الخزينة)...' : 'Search by code or name...'
                }
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl ps-9 pe-4 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{locale === 'ar' ? 'جميع الأنواع' : 'All Account Types'}</option>
                <option value="asset">{locale === 'ar' ? 'الأصول (1)' : 'Assets (1)'}</option>
                <option value="liability">{locale === 'ar' ? 'الالتزامات (2)' : 'Liabilities (2)'}</option>
                <option value="equity">{locale === 'ar' ? 'حقوق الملكية (3)' : 'Equity (3)'}</option>
                <option value="revenue">{locale === 'ar' ? 'الإيرادات (4)' : 'Revenues (4)'}</option>
                <option value="expense">{locale === 'ar' ? 'المصاريف (5)' : 'Expenses (5)'}</option>
              </select>

              {!search && selectedType === 'all' && (
                <div className="flex items-center gap-1 border-s border-slate-200 dark:border-slate-800 ps-2">
                  <button
                    onClick={expandAll}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    {locale === 'ar' ? 'توسيع الكل' : 'Expand All'}
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    {locale === 'ar' ? 'طي الكل' : 'Collapse All'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tree View Container */}
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">
                {locale === 'ar' ? 'جاري تحميل شجرة الحسابات...' : 'Loading Chart of Accounts...'}
              </p>
            </div>
          ) : treeData.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'لا توجد حسابات تطابق البحث' : 'No matching accounts found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar' ? 'تأكد من كتابة اسم أو رمز الحساب بشكل صحيح.' : 'Try adjusting your search filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {treeData.map((node) => renderNode(node))}
            </div>
          )}
        </div>

        {/* Account Detail & Ledger Modal */}
        {selectedAccount && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      {selectedAccount.account_code} - {locale === 'ar' ? selectedAccount.name_ar : selectedAccount.name_en}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {locale === 'ar' ? 'تفاصيل الحساب وحركات دفتر الأستاذ العام' : 'Account Details & General Ledger'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAccount(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {locale === 'ar' ? 'نوع الحساب' : 'Type'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {locale === 'ar' ? selectedAccount.account_types?.name_ar : selectedAccount.account_types?.name_en}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {locale === 'ar' ? 'طبيعة الحساب' : 'Normal Balance'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {selectedAccount.account_types?.normal_balance === 'debit' ? (locale === 'ar' ? 'مدين' : 'Debit') : (locale === 'ar' ? 'دائن' : 'Credit')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {locale === 'ar' ? 'المستوى' : 'Level'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Level {selectedAccount.level}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {locale === 'ar' ? 'الترحيل المباشر' : 'Posting'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {selectedAccount.is_header ? (locale === 'ar' ? 'رئيسي (غير قابل للترحيل)' : 'Header (Non-Postable)') : (locale === 'ar' ? 'فرعي (مسموح بالترحيل)' : 'Postable')}
                    </span>
                  </div>
                </div>

                {selectedAccount.description && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold block mb-1 text-slate-900 dark:text-slate-200">
                      {locale === 'ar' ? 'الوصف والمعيار المحاسبي:' : 'Description & Accounting Rule:'}
                    </span>
                    {selectedAccount.description}
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                  <button
                    onClick={() => {
                      router.push(`/finance/journal?account=${selectedAccount.account_code}`);
                      setSelectedAccount(null);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{locale === 'ar' ? 'عرض القيود الخاصة بهذا الحساب' : 'View Related Journal Entries'}</span>
                    <ArrowUpRight className="w-4 h-4 rtl:rotate-270" />
                  </button>

                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {locale === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </PermissionGate>
  );
}
