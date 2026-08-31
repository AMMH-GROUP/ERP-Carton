'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Eye,
  Edit,
  X
} from 'lucide-react';

export default function SuppliersPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockSuppliers = [
    {
      id: 'sup-1',
      supplier_code: 'SUP-2026-001',
      name_ar: 'شركة النيل للورق الخام والكرتون',
      name_en: 'Nile Paper & Packaging Raw Materials Co.',
      phone: '+20 100 999 1122',
      email: 'sales@nilepaper.com',
      tax_number: '555-444-333',
      payment_terms_days: 45,
      status: 'approved',
      products_count: 12,
    },
    {
      id: 'sup-2',
      supplier_code: 'SUP-2026-002',
      name_ar: 'الشركة العالمية للمواد اللاصقة والنشا',
      name_en: 'Global Starch & Adhesives Ltd',
      phone: '+20 111 222 3344',
      email: 'orders@globalstarch.eg',
      tax_number: '777-888-999',
      payment_terms_days: 30,
      status: 'approved',
      products_count: 5,
    },
    {
      id: 'sup-3',
      supplier_code: 'SUP-2026-003',
      name_ar: 'مؤسسة الأمل لقطع الغيار الصناعية',
      name_en: 'El-Amal Industrial Spare Parts',
      phone: '+20 122 444 5566',
      email: 'info@alamalspares.com',
      tax_number: '111-222-333',
      payment_terms_days: 15,
      status: 'pending',
      products_count: 0,
    },
  ];

  const filteredSuppliers = mockSuppliers.filter((s) => {
    const matchesSearch =
      s.name_ar.includes(searchTerm) ||
      s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplier_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PermissionGate module="suppliers" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.suppliers')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة سجلات الموردين المعتمدين والمواد الخام الموردة (Approved Suppliers Master)'
                  : 'Approved suppliers master list and product mappings'}
              </p>
            </div>

            <PermissionGate module="suppliers" action="create">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إضافة مورد جديد' : 'Add New Supplier'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Search & Status Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('actions.search') + " (Code, Supplier...)"}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">{t('common.status')}:</span>
              {['all', 'approved', 'pending', 'suspended'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? (locale === 'ar' ? 'الكل' : 'All') : st}
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
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'اعتماد المورد' : 'Supplier Status'}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        <Link href={`/suppliers/${s.id}`} className="hover:underline">
                          {s.supplier_code}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {locale === 'ar' ? s.name_ar : s.name_en}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span><Phone className="w-3 h-3 inline me-1" />{s.phone}</span>
                          <span>•</span>
                          <span><Mail className="w-3 h-3 inline me-1" />{s.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono">{s.tax_number}</td>
                      <td className="p-3.5 font-bold">{s.payment_terms_days} {locale === 'ar' ? 'يوماً' : 'Days'}</td>
                      <td className="p-3.5">
                        {s.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {locale === 'ar' ? 'مورد معتمد' : 'Approved'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            <Clock className="w-3.5 h-3.5" /> {locale === 'ar' ? 'قيد المراجعة' : 'Pending Approval'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/suppliers/${s.id}`} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <PermissionGate module="suppliers" action="edit">
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
