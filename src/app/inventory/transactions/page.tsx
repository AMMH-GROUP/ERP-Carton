'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { History, Search, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function InventoryTransactionsPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const mockTxns = [
    {
      id: '1',
      date: '2026-08-31 16:45',
      product_code: 'RM-PAPER-140',
      product_name: locale === 'ar' ? 'ورق كرافت خام 140 جرام' : 'Kraft Paper Roll 140 GSM',
      warehouse_name: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      type: 'purchase_receipt',
      type_label: locale === 'ar' ? 'استلام مشتريات' : 'Purchase Receipt',
      quantity: 10000,
      uom: 'KG',
      unit_cost: 32.50,
      ref_doc: 'GRN-2026-00014',
      user: 'مصطفى حسن (المخازن)',
    },
    {
      id: '2',
      date: '2026-08-31 14:20',
      product_code: 'RM-PAPER-140',
      product_name: locale === 'ar' ? 'ورق كرافت خام 140 جرام' : 'Kraft Paper Roll 140 GSM',
      warehouse_name: locale === 'ar' ? 'مخزن المواد الخام الرئيسي' : 'Main RM Warehouse',
      type: 'material_issue',
      type_label: locale === 'ar' ? 'صرف مواد للإنتاج' : 'Material Issue to WIP',
      quantity: -5000,
      uom: 'KG',
      unit_cost: 32.50,
      ref_doc: 'MR-2026-00028',
      user: 'مصطفى حسن (المخازن)',
    },
    {
      id: '3',
      date: '2026-08-31 11:10',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم' : 'Corrugated Box 30x20x15 cm',
      warehouse_name: locale === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse',
      type: 'production_receipt',
      type_label: locale === 'ar' ? 'استلام إنتاج تام' : 'Production Receipt',
      quantity: 5000,
      uom: 'PCS',
      unit_cost: 8.75,
      ref_doc: 'MO-2026-00019',
      user: 'محمود القاضي (الإنتاج)',
    },
    {
      id: '4',
      date: '2026-08-30 09:30',
      product_code: 'FG-BOX-3020',
      product_name: locale === 'ar' ? 'كرتونة مضلعة 30×20×15 سم' : 'Corrugated Box 30x20x15 cm',
      warehouse_name: locale === 'ar' ? 'مخزن المنتج التام' : 'Finished Goods Warehouse',
      type: 'delivery',
      type_label: locale === 'ar' ? 'تسليم مبيعات للعميل' : 'Sales Delivery',
      quantity: -4000,
      uom: 'PCS',
      unit_cost: 8.75,
      ref_doc: 'DN-2026-00012',
      user: 'أحمد محمود (المبيعات)',
    },
  ];

  return (
    <PermissionGate module="inventory" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {t('nav.stockMovements')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {locale === 'ar'
                ? 'سجل حركات المخزون التاريخية غير القابلة للتعديل (Immutable Inventory Ledger)'
                : 'Immutable append-only inventory transaction ledger'}
            </p>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search') + " (Item, Ref Doc, Type...)"}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'نوع الحركة' : 'Txn Type'}</th>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('nav.warehouses')}</th>
                    <th className="p-3.5 text-start">{t('common.quantity')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'تكلفة الحركة' : 'Cost / Unit'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المستند المرجعي' : 'Ref Document'}</th>
                    <th className="p-3.5 text-end">{t('common.createdBy')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockTxns.map((t) => {
                    const isInbound = t.quantity > 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{t.date}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                            isInbound ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-amber-50 text-amber-600 dark:bg-amber-950'
                          }`}>
                            {isInbound ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {t.type_label}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{t.product_code}</td>
                        <td className="p-3.5 font-bold">{t.product_name}</td>
                        <td className="p-3.5 font-medium">{t.warehouse_name}</td>
                        <td className="p-3.5 font-mono font-extrabold">
                          <span className={isInbound ? 'text-emerald-600' : 'text-amber-600'}>
                            {isInbound ? '+' : ''}{formatNumber(t.quantity)} {t.uom}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">{formatCurrency(t.unit_cost)}</td>
                        <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.ref_doc}</td>
                        <td className="p-3.5 text-end text-slate-500 font-medium">{t.user}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
