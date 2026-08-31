'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Truck, Plus, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function DeliveriesPage() {
  const { t, locale } = useTranslation();

  const mockDeliveries = [
    {
      id: '1',
      delivery_number: 'DN-2026-00012',
      so_number: 'SO-2026-00018',
      customer: locale === 'ar' ? 'شركة أثاث المستقبل ش.م.م' : 'Future Furniture Co.',
      warehouse: locale === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse',
      driver: 'سعيد عبد المولى',
      vehicle: 'أ ج د 4598',
      date: '2026-08-31',
      status: 'confirmed',
    },
    {
      id: '2',
      delivery_number: 'DN-2026-00011',
      so_number: 'SO-2026-00012',
      customer: locale === 'ar' ? 'مصنع الشرق للأجهزة الكهربائية' : 'Orient Electronics',
      warehouse: locale === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse',
      driver: 'جمال حسنين',
      vehicle: 'ط س ر 1234',
      date: '2026-08-30',
      status: 'delivered',
    },
  ];

  return (
    <PermissionGate module="deliveries" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.deliveries')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إصدار أذون التسليم، تتبع الشحن، وصرف المخزون التام فور التسليم (PRD §51-52)'
                  : 'Issue Delivery Notes, shipping details, and automatic inventory stock deduction'}
              </p>
            </div>

            <PermissionGate module="deliveries" action="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إذن تسليم جديد' : 'New Delivery Note'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Deliveries Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('nav.salesOrders')}</th>
                    <th className="p-3.5 text-start">{t('nav.customers')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'السائق والسيارة' : 'Driver & Vehicle'}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockDeliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {d.delivery_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{d.so_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{d.customer}</td>
                      <td className="p-3.5 font-medium">{d.driver} ({d.vehicle})</td>
                      <td className="p-3.5 font-mono text-slate-400">{d.date}</td>
                      <td className="p-3.5">
                        {d.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'تم التسليم والصرف' : 'Delivered & Deducted'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-[11px] bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            <Clock className="w-3.5 h-3.5" /> {locale === 'ar' ? 'جاهز للتسليم' : 'Confirmed'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        {d.status === 'confirmed' && (
                          <PermissionGate module="deliveries" action="edit">
                            <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-xs">
                              {locale === 'ar' ? 'تأكيد التسليم وصرف المخزون' : 'Confirm & Issue Stock'}
                            </button>
                          </PermissionGate>
                        )}
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
