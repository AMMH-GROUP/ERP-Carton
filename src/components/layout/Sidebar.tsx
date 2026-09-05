'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { usePermissions } from '@/lib/permissions/context';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  Wrench,
  DollarSign,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Box,
  Receipt,
  X,
  PlusCircle,
  Calculator,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    purchasing: true,
    inventory: true,
    manufacturing: true,
    finance: true,
    maintenance: false,
    admin: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const navGroups = [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      href: '/',
      permission: null,
    },
    {
      key: 'sales',
      label: t('nav.sales'),
      icon: ShoppingCart,
      permission: { module: 'sales_orders', action: 'view' },
      items: [
        { label: locale === 'ar' ? '⚡ حاسبة عروض الأسعار' : '⚡ Quotation Calculator', href: '/sales/quotations/create', permission: 'quotations', isHighlight: true },
        { label: t('nav.quotations'), href: '/sales/quotations', permission: 'quotations' },
        { label: t('nav.salesOrders'), href: '/sales/orders', permission: 'sales_orders' },
        { label: t('nav.deliveries'), href: '/sales/deliveries', permission: 'deliveries' },
        { label: t('nav.salesInvoices'), href: '/sales/invoices', permission: 'sales_invoices' },
        { label: t('nav.customers'), href: '/customers', permission: 'customers' },
      ],
    },
    {
      key: 'purchasing',
      label: t('nav.purchasing'),
      icon: Receipt,
      permission: { module: 'purchase_orders', action: 'view' },
      items: [
        { label: t('nav.purchaseRequests'), href: '/purchasing/requests', permission: 'purchase_requests' },
        { label: locale === 'ar' ? 'مقارنة الموردين' : 'Suppliers Compare', href: '/purchasing/suppliers-compare', permission: 'rfqs' },
        { label: t('nav.purchaseOrders'), href: '/purchasing/orders', permission: 'purchase_orders' },
        { label: t('nav.goodsReceipts'), href: '/purchasing/receipts', permission: 'goods_receipts' },
        { label: t('nav.purchaseInvoices'), href: '/purchasing/invoices', permission: 'purchase_invoices' },
        { label: t('nav.suppliers'), href: '/suppliers', permission: 'suppliers' },
      ],
    },
    {
      key: 'inventory',
      label: t('nav.inventory'),
      icon: Package,
      permission: { module: 'inventory', action: 'view' },
      items: [
        { label: t('nav.stockOnHand'), href: '/inventory/stock', permission: 'inventory' },
        { label: t('nav.transfers'), href: '/inventory/transfers', permission: 'warehouse_transfers' },
        { label: t('nav.stockCounts'), href: '/inventory/counts', permission: 'stock_counts' },
        { label: t('nav.warehouses'), href: '/inventory/warehouses', permission: 'warehouses' },
        { label: locale === 'ar' ? 'سجل تتبع الحركات' : 'Movements Ledger', href: '/inventory/transactions', permission: 'inventory' },
      ],
    },
    {
      key: 'manufacturing',
      label: t('nav.manufacturing'),
      icon: Factory,
      permission: { module: 'production_orders', action: 'view' },
      items: [
        { label: t('nav.boms'), href: '/manufacturing/boms', permission: 'bom' },
        { label: t('nav.productionOrders'), href: '/manufacturing/orders', permission: 'production_orders' },
        { label: locale === 'ar' ? 'سجل المشغل اليومي' : 'Operator Daily Log', href: '/manufacturing/operator-log', permission: 'production_logs' },
        { label: t('nav.qcInspections'), href: '/manufacturing/qc', permission: 'qc_inspections' },
      ],
    },
    {
      key: 'finance',
      label: t('nav.finance'),
      icon: DollarSign,
      permission: { module: 'general_ledger', action: 'view' },
      items: [
        { label: t('nav.chartOfAccounts'), href: '/finance/accounts', permission: 'chart_of_accounts' },
        { label: t('nav.journalEntries'), href: '/finance/journal', permission: 'journal_entries' },
        { label: t('nav.cashBank'), href: '/finance/treasury', permission: 'cash_accounts' },
        { label: t('nav.cashClosings'), href: '/finance/cash-closings', permission: 'cash_closings' },
        { label: t('nav.expenses'), href: '/finance/expenses', permission: 'expenses' },
        { label: t('nav.ar'), href: '/finance/ar', permission: 'sales_invoices' },
        { label: t('nav.ap'), href: '/finance/ap', permission: 'purchase_invoices' },
        { label: locale === 'ar' ? 'التقارير المالية وشجرة الحسابات' : 'Financial & GL Reports', href: '/finance/reports', permission: 'chart_of_accounts' },
      ],
    },
    {
      key: 'maintenance',
      label: t('nav.maintenance'),
      icon: Wrench,
      permission: { module: 'maintenance_orders', action: 'view' },
      items: [
        { label: t('nav.machines'), href: '/maintenance/machines', permission: 'machines' },
        { label: locale === 'ar' ? 'أوامر الصيانة' : 'Work Orders', href: '/maintenance/work-orders', permission: 'maintenance_orders' },
        { label: locale === 'ar' ? 'الصيانة الوقائية' : 'PM Schedules', href: '/maintenance/schedules', permission: 'preventive_maintenance' },
      ],
    },
    {
      key: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      href: '/reports/executive',
      permission: { module: 'reports', action: 'view' },
    },
    {
      key: 'admin',
      label: t('nav.admin'),
      icon: ShieldAlert,
      permission: { module: 'system_settings', action: 'view' },
      items: [
        { label: t('nav.users'), href: '/admin/users', permission: 'users' },
        { label: t('nav.roles'), href: '/admin/roles', permission: 'roles' },
        { label: t('nav.approvals'), href: '/approvals', permission: 'approvals' },
        { label: t('nav.auditLogs'), href: '/admin/audit', permission: 'audit_logs' },
        { label: t('nav.systemSettings'), href: '/admin/settings', permission: 'system_settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Independent Fixed Height Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 h-screen max-h-screen z-40 w-64 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md border-r rtl:border-r-0 rtl:border-l border-slate-800/80 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shrink-0 shadow-2xl overflow-hidden ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'
        }`}
      >
        {/* Header Logo & Title (Fixed Top) */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm text-white tracking-wide flex items-center gap-1.5">
                {t('app.shortTitle')}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-slate-400 font-bold">
                {locale === 'ar' ? 'مصنع الكرتون المضلع' : 'Corrugated Carton ERP'}
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Pricing Builder Button (Fixed Top Sub-bar) */}
        <div className="px-3.5 pt-3.5 pb-1 shrink-0">
          <Link
            href="/sales/quotations/create"
            onClick={onClose}
            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{locale === 'ar' ? 'حساب عرض سعر علبة' : 'New Box Pricing'}</span>
          </Link>
        </div>

        {/* Independent Scrolling Navigation Menu Container */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1.5">
          {navGroups.map((group) => {
            if (
              group.permission &&
              !isSuperAdmin &&
              !hasPermission(group.permission.module, group.permission.action)
            ) {
              return null;
            }

            const Icon = group.icon;

            if (group.href) {
              const isActive = pathname === group.href;
              return (
                <Link
                  key={group.key}
                  href={group.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 font-black'
                      : 'hover:bg-slate-800/80 hover:text-white text-slate-400 hover:translate-x-1 rtl:hover:-translate-x-1'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{group.label}</span>
                </Link>
              );
            }

            const isExpanded = openSections[group.key];
            const hasActiveChild = group.items?.some((item) => pathname === item.href);

            return (
              <div key={group.key} className="space-y-1">
                <button
                  onClick={() => toggleSection(group.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    hasActiveChild
                      ? 'bg-slate-800/90 text-white border-l-2 rtl:border-l-0 rtl:border-r-2 border-indigo-500 shadow-xs'
                      : 'hover:bg-slate-800/70 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 transition-transform duration-200" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ltr:pl-6 rtl:pr-6 space-y-1 py-1 transition-all">
                    {group.items?.map((item) => {
                      if (
                        item.permission &&
                        !isSuperAdmin &&
                        !hasPermission(item.permission, 'view')
                      ) {
                        return null;
                      }

                      const isChildActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isChildActive
                              ? 'bg-indigo-600/25 text-indigo-300 font-extrabold border-l-2 rtl:border-l-0 rtl:border-r-2 border-indigo-400 shadow-xs'
                              : item.isHighlight
                              ? 'text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-200'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 hover:translate-x-1 rtl:hover:-translate-x-1'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Info (Fixed Bottom) */}
        <div className="p-3.5 shrink-0 border-t border-slate-800/80 text-[11px] text-slate-500 text-center bg-slate-950/60 backdrop-blur-xs">
          <p className="font-extrabold text-slate-400 tracking-wide">Carton ERP v1.0.0</p>
          <p className="mt-0.5 text-[10px] text-slate-500">© 2026 Corrugated Carton ERP</p>
        </div>
      </aside>
    </>
  );
}
