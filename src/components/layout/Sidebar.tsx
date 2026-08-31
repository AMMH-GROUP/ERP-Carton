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
  CheckCircle,
  Wrench,
  DollarSign,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Box,
  FileText,
  Truck,
  Receipt,
  Users,
  Building2,
  ListOrdered,
  Layers,
  Settings,
  ShieldCheck,
  FileCheck,
  ClipboardList
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
    inventory: true,
    manufacturing: true,
    finance: false,
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
        { label: t('nav.rfqs'), href: '/purchasing/rfqs', permission: 'rfqs' },
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
        { label: t('nav.adjustments'), href: '/inventory/adjustments', permission: 'stock_adjustments' },
        { label: t('nav.stockCounts'), href: '/inventory/counts', permission: 'stock_counts' },
        { label: t('nav.warehouses'), href: '/inventory/warehouses', permission: 'warehouses' },
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
        { label: t('nav.materialRequests'), href: '/manufacturing/material-requests', permission: 'material_requests' },
        { label: t('nav.qcInspections'), href: '/manufacturing/qc', permission: 'qc_inspections' },
        { label: t('nav.rework'), href: '/manufacturing/rework', permission: 'rework_orders' },
        { label: t('nav.scrap'), href: '/manufacturing/scrap', permission: 'scrap' },
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
      ],
    },
    {
      key: 'maintenance',
      label: t('nav.maintenance'),
      icon: Wrench,
      permission: { module: 'maintenance_orders', action: 'view' },
      items: [
        { label: t('nav.machines'), href: '/maintenance/machines', permission: 'machines' },
        { label: t('nav.maintenanceOrders'), href: '/maintenance/orders', permission: 'maintenance_orders' },
        { label: t('nav.preventiveMaintenance'), href: '/maintenance/preventive', permission: 'preventive_maintenance' },
        { label: t('nav.downtime'), href: '/maintenance/downtime', permission: 'maintenance_orders' },
      ],
    },
    {
      key: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      href: '/reports',
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide">
              {t('app.shortTitle')}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {locale === 'ar' ? 'مصنع الكرتون المضلع' : 'Corrugated Carton ERP'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navGroups.map((group) => {
            // Permission filtering
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    hasActiveChild
                      ? 'bg-slate-800/80 text-white font-semibold'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ltr:inline rtl:hidden text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ltr:pl-9 rtl:pr-9 space-y-1 py-1">
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
                          className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isChildActive
                              ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          <p>Carton ERP v1.0.0</p>
          <p className="mt-0.5">© 2026 Corrugated Carton Factory</p>
        </div>
      </aside>
    </>
  );
}
