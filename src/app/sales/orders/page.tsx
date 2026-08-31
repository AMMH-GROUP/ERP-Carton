'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { ShoppingBag, Search, CheckCircle2, AlertTriangle, ShieldCheck, Truck, Factory, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SalesOrdersPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const mockOrders = [
    {
      id: '1',
      so_number: 'SO-2026-00018',
      customer_name_ar: 'شركة أثاث المستقبل ش.م.م',
      customer_name_en: 'Future Furniture Co.',
      date: '2026-08-31',
      total_amount: 154000,
      status: 'confirmed',
      credit_check: 'passed',
      reserved_stock: true,
      delivered_pct: '0%',
    },
    {
      id: '2',
      so_number: 'SO-2026-00019',
      customer_name_ar: 'مجموعة الأغذية النظيفة',
      customer_name_en: 'Clean Food Group',
      date: '2026-08-31',
      total_amount: 364800,
      status: 'pending_approval',
      credit_check: 'exceeded_approved',
      reserved_stock: false,
      delivered_pct: '0%',
    },
    {
      id: '3',
      so_number: 'SO-2026-00012',
      customer_name_ar: 'مصنع الشرق للأجهزة الكهربائية',
      customer_name_en: 'Orient Electronics',
      date: '2026-08-20',
      total_amount: 96900,
      status: 'partially_delivered',
      credit_check: 'passed',
      reserved_stock: true,
      delivered_pct: '60%',
    },
  ];

  return (
    <PermissionGate module="sales_orders" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.salesOrders')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة أوامر البيع المؤكدة، التحقق من الحد الائتماني، وحجز المخزون الفعلي (PRD §18)'
                  : 'Manage confirmed Sales Orders, credit limit validation, and inventory stock reservations'}
              </p>
            </div>
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
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الحد الائتماني' : 'Credit Check'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'حجز المخزون' : 'Stock Reserved'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {so.so_number}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? so.customer_name_ar : so.customer_name_en}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{so.date}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(so.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {so.credit_check === 'passed' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'اجتاز الائتمان' : 'Passed Credit'}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'موافقة تجاوز ائتمان' : 'Approved Exceeded'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {so.reserved_stock ? (
                          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تم الحجز' : 'Reserved'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            {locale === 'ar' ? 'غير محجوز' : 'Not Reserved'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                          {so.status}
                        </span>
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
