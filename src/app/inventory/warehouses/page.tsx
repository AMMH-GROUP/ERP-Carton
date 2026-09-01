'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Warehouse, Plus, Search, CheckCircle2, MapPin, Package } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function WarehousesPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const mockWarehouses = [
    {
      id: 'wh-1',
      warehouse_code: 'WH-RM-01',
      name_ar: 'مخزن المواد الخام الرئيسي',
      name_en: 'Main Raw Materials Warehouse',
      type_name: locale === 'ar' ? 'مواد خام' : 'Raw Materials',
      location: 'مبنى أ - العنبر الرئيسي',
      is_active: true,
      items_count: 45,
    },
    {
      id: 'wh-2',
      warehouse_code: 'WH-WIP-01',
      name_ar: 'مخزن تحت التشغيل (WIP)',
      name_en: 'Work In Progress Warehouse',
      type_name: locale === 'ar' ? 'تحت التشغيل' : 'WIP',
      location: 'صالة الإنتاج - خط الكرجيتور',
      is_active: true,
      items_count: 12,
    },
    {
      id: 'wh-3',
      warehouse_code: 'WH-FG-01',
      name_ar: 'مخزن المنتج التام',
      name_en: 'Finished Goods Warehouse',
      type_name: locale === 'ar' ? 'منتج تام' : 'Finished Goods',
      location: 'مبنى ب - رصيف الشحن والتسليم',
      is_active: true,
      items_count: 88,
    },
    {
      id: 'wh-4',
      warehouse_code: 'WH-SPARE-01',
      name_ar: 'مخزن قطع غيار الماكينات',
      name_en: 'Spare Parts Warehouse',
      type_name: locale === 'ar' ? 'قطع غيار' : 'Spare Parts',
      location: 'ورشة الصيانة الرئيسية',
      is_active: true,
      items_count: 120,
    },
  ];

  return (
    <PermissionGate module="warehouses" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Warehouse className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.warehouses')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة مستودعات المصنع الفعلية (خام، تحت التشغيل WIP، منتج تام، قطع غيار)'
                  : 'Manage factory physical warehouses (Raw materials, WIP, Finished goods, Spare parts)'}
              </p>
            </div>

            <PermissionGate module="warehouses" action="create">
              <button 
                onClick={() => router.push('/inventory/warehouses/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إضافة مستودع جديد' : 'Add Warehouse'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Grid of Warehouses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockWarehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                        {wh.warehouse_code}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                        {wh.type_name}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('status.active')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-3">
                    {locale === 'ar' ? wh.name_ar : wh.name_en}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.location}</span>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    <Package className="w-3.5 h-3.5 inline me-1" />
                    {wh.items_count} {locale === 'ar' ? 'صنف مسجل' : 'Items Stored'}
                  </span>

                  <button 
                    onClick={() => router.push(`/inventory/stock?warehouse=${wh.id}`)}
                    className="text-indigo-600 hover:underline font-bold">
                    {locale === 'ar' ? 'عرض المخزون' : 'View Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
