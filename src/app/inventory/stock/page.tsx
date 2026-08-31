'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Package,
  Search,
  Filter,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function StockOnHandPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  const mockStock = [
    {
      id: '1',
      product_code: 'RM-PAPER-140',
      product_name_ar: 'ورق كرافت خام 140 جرام',
      product_name_en: 'Kraft Paper Roll 140 GSM',
      warehouse_name_ar: 'مخزن المواد الخام الرئيسي',
      warehouse_name_en: 'Main Raw Materials Warehouse',
      on_hand_qty: 45000,
      reserved_qty: 12000,
      available_qty: 33000,
      uom: 'KG',
      unit_cost_wac: 32.50,
      total_value: 1462500,
    },
    {
      id: '2',
      product_code: 'FG-BOX-3020',
      product_name_ar: 'كرتونة مضلعة 30×20×15 سم (3 طبقات)',
      product_name_en: 'Corrugated Box 30x20x15 cm (3-Ply)',
      warehouse_name_ar: 'مخزن المنتج التام',
      warehouse_name_en: 'Finished Goods Warehouse',
      on_hand_qty: 15000,
      reserved_qty: 10000,
      available_qty: 5000,
      uom: 'PCS',
      unit_cost_wac: 8.75,
      total_value: 131250,
    },
    {
      id: '3',
      product_code: 'RM-STARCH-01',
      product_name_ar: 'نشا صناعي لاصق (شكائر)',
      product_name_en: 'Industrial Adhesive Starch (Bags)',
      warehouse_name_ar: 'مخزن المواد الخام الرئيسي',
      warehouse_name_en: 'Main Raw Materials Warehouse',
      on_hand_qty: 8500,
      reserved_qty: 0,
      available_qty: 8500,
      uom: 'KG',
      unit_cost_wac: 18.00,
      total_value: 153000,
    },
    {
      id: '4',
      product_code: 'RM-PAPER-120',
      product_name_ar: 'ورق فلوتنج 120 جرام',
      product_name_en: 'Fluting Paper Roll 120 GSM',
      warehouse_name_ar: 'مخزن تحت التشغيل (WIP)',
      warehouse_name_en: 'WIP Warehouse',
      on_hand_qty: 12000,
      reserved_qty: 5000,
      available_qty: 7000,
      uom: 'KG',
      unit_cost_wac: 28.00,
      total_value: 336000,
    },
  ];

  const filteredStock = mockStock.filter((s) => {
    const matchesSearch =
      s.product_name_ar.includes(searchTerm) ||
      s.product_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalInventoryValue = mockStock.reduce((sum, item) => sum + item.total_value, 0);

  return (
    <PermissionGate module="inventory" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.stockOnHand')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'رصيد المخزون الفعلي، المحجوز، والمتاح للاستخدام مع متوسط التكلفة المرجح (WAC)'
                  : 'Real-time stock on hand, reserved stock, available qty, and Weighted Average Cost'}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2 rounded-xl text-start">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">
                {locale === 'ar' ? 'إجمالي قيمة المخزون' : 'Total Valuation (WAC)'}
              </span>
              <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 font-mono">
                {formatCurrency(totalInventoryValue)}
              </span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search') + " (Item, Code...)"}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{t('nav.warehouses')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الرخص الفعلي' : 'On-Hand Qty'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المحجوز' : 'Reserved Qty'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المتاح للاستخدام' : 'Available Qty'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'متوسط التكلفة (WAC)' : 'WAC / Unit'}</th>
                    <th className="p-3.5 text-end">{locale === 'ar' ? 'إجمالي القيمة' : 'Total Value'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.product_code}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? item.product_name_ar : item.product_name_en}
                      </td>
                      <td className="p-3.5 font-medium">
                        {locale === 'ar' ? item.warehouse_name_ar : item.warehouse_name_en}
                      </td>
                      <td className="p-3.5 font-bold font-mono">
                        {formatNumber(item.on_hand_qty)} {item.uom}
                      </td>
                      <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {formatNumber(item.reserved_qty)} {item.uom}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {formatNumber(item.available_qty)} {item.uom}
                      </td>
                      <td className="p-3.5 font-mono">{formatCurrency(item.unit_cost_wac)}</td>
                      <td className="p-3.5 text-end font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.total_value)}
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
