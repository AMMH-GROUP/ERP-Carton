'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  Ruler,
  Eye,
  Edit,
  Sliders,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const router = useRouter();

  const mockProducts = [
    {
      id: 'prod-1',
      product_code: 'RM-PAPER-140',
      name_ar: 'ورق كرافت خام 140 جرام',
      name_en: 'Kraft Paper Roll 140 GSM',
      product_type: 'raw_material',
      category_name: 'Raw Paper Rolls',
      primary_uom: 'KG',
      standard_cost: 32.50,
      qc_required: true,
      spec_summary: '140 GSM • Kraft',
    },
    {
      id: 'prod-2',
      product_code: 'FG-BOX-3020',
      name_ar: 'كرتونة مضلعة 30×20×15 سم (3 طبقات)',
      name_en: 'Corrugated Box 30x20x15 cm (3-Ply)',
      product_type: 'finished_good',
      category_name: 'Corrugated Boxes',
      primary_uom: 'PCS',
      standard_cost: 8.75,
      qc_required: true,
      spec_summary: '30x20x15 cm • Flute B • 3-Ply',
    },
    {
      id: 'prod-3',
      product_code: 'RM-STARCH-01',
      name_ar: 'نشا صناعي لاصق (شكائر)',
      name_en: 'Industrial Adhesive Starch (Bags)',
      product_type: 'raw_material',
      category_name: 'Starch & Adhesives',
      primary_uom: 'KG',
      standard_cost: 18.00,
      qc_required: false,
      spec_summary: 'Industrial Grade Starch',
    },
    {
      id: 'prod-4',
      product_code: 'SPARE-BELT-02',
      name_ar: 'سير ناقل حركة للكرجيتور',
      name_en: 'Corrugator Transmission Belt',
      product_type: 'spare_part',
      category_name: 'Machine Spare Parts',
      primary_uom: 'PCS',
      standard_cost: 4500.00,
      qc_required: false,
      spec_summary: 'Heavy Duty Belt',
    },
  ];

  const filteredProducts = mockProducts.filter((p) => {
    const matchesSearch =
      p.name_ar.includes(searchTerm) ||
      p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || p.product_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <PermissionGate module="products" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'دليل المنتجات والخامات' : 'Product Master Catalog'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة المنتجات التامة، المواد الخام، قطع الغيار، والمواصفات الفنية القياسية'
                  : 'Master catalog for finished goods, raw materials, spare parts, and specs'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/products/pricing"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>{locale === 'ar' ? 'محرك التسعير' : 'Pricing Engine'}</span>
              </Link>

              <PermissionGate module="products" action="create">
                <button onClick={() => router.push('/products/new')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search') + " (Code, Product Name...)"}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 text-xs overflow-x-auto">
              <span className="text-slate-500 font-medium">{locale === 'ar' ? 'النوع:' : 'Type:'}</span>
              {['all', 'finished_good', 'raw_material', 'spare_part'].map((pt) => (
                <button
                  key={pt}
                  onClick={() => setTypeFilter(pt)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors whitespace-nowrap ${
                    typeFilter === pt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {pt === 'all'
                    ? locale === 'ar' ? 'الكل' : 'All'
                    : pt === 'finished_good'
                    ? locale === 'ar' ? 'منتج تام' : 'Finished Good'
                    : pt === 'raw_material'
                    ? locale === 'ar' ? 'مادة خام' : 'Raw Material'
                    : locale === 'ar' ? 'قطع غيار' : 'Spare Part'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الفئة' : 'Category'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'وحدة القياس' : 'UOM'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'المواصفة القياسية' : 'Standard Spec'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'فحص الجودة' : 'QC Check'}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        <Link href={`/products/${p.id}`} className="hover:underline">
                          {p.product_code}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {locale === 'ar' ? p.name_ar : p.name_en}
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                          {p.product_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{p.category_name}</td>
                      <td className="p-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">{p.primary_uom}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">{p.spec_summary}</td>
                      <td className="p-3.5">
                        {p.qc_required ? (
                          <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'إلزامي' : 'QC Required'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            {locale === 'ar' ? 'غير إلزامي' : 'Optional'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/products/${p.id}`} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <PermissionGate module="products" action="edit">
                            <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </PermissionGate>
                        </div>
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
