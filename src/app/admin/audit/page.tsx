'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ShieldAlert, Search, Filter, Calendar, User, Eye } from 'lucide-react';

export default function AuditLogsPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const mockLogs = [
    {
      id: '1',
      user: 'أحمد محمود (Super Admin)',
      action: 'price_override',
      module: 'quotations',
      record_type: 'quotation_items',
      record_id: 'QT-2026-00042',
      ip: '192.168.1.45',
      time: '2026-08-31 19:10:22',
      details: 'Overrode item price from 15.00 EGP to 13.50 EGP (-10%)',
    },
    {
      id: '2',
      user: 'سارة حسن (Sales)',
      action: 'create',
      module: 'sales_orders',
      record_type: 'sales_orders',
      record_id: 'SO-2026-00018',
      ip: '192.168.1.50',
      time: '2026-08-31 18:45:00',
      details: 'Created sales order for Customer: Arma Food Industries',
    },
    {
      id: '3',
      user: 'محمود القاضي (Production)',
      action: 'material_issue',
      module: 'inventory',
      record_type: 'inventory_transactions',
      record_id: 'IT-2026-00891',
      ip: '192.168.1.88',
      time: '2026-08-31 17:30:15',
      details: 'Issued 5,000 KG Kraft Paper from RM Warehouse to WIP',
    },
    {
      id: '4',
      user: 'إبراهيم السيد (Accountant)',
      action: 'post',
      module: 'sales_invoices',
      record_type: 'sales_invoices',
      record_id: 'INV-2026-00034',
      ip: '192.168.1.12',
      time: '2026-08-31 16:15:40',
      details: 'Posted Sales Invoice INV-2026-00034 (124,500 EGP) -> Created Journal Entry JE-2026-00102',
    },
  ];

  return (
    <PermissionGate module="audit_logs" action="view" fallback={
      <AppShell>
        <div className="p-8 text-center text-red-500 font-bold">
          {locale === 'ar' ? 'غير مصرح لك بعرض هذه الصفحة' : 'Access Denied: You do not have permission to view Audit Logs'}
        </div>
      </AppShell>
    }>
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t('nav.auditLogs')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'ar'
                ? 'سجل تتبع غير قابل للتعديل لكافة العمليات والتغييرات الحساسة بالنظام'
                : 'Centralized immutable audit trail for system operations and sensitive changes'}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search')}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الإجراء' : 'Action'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الوحدة' : 'Module'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المستند / السجل' : 'Record'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'تفاصيل العملية' : 'Details'}</th>
                    <th className="p-3.5 text-start">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="p-3.5 font-bold font-sans text-slate-900 dark:text-slate-100">{log.user}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans font-medium">{log.module}</td>
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{log.record_id}</td>
                      <td className="p-3.5 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.details}</td>
                      <td className="p-3.5 text-slate-400">{log.ip}</td>
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
