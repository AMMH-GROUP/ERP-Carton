'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  Building,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const { t, locale } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_code: 'CUST-2026-005',
    name_ar: '',
    name_en: '',
    phone: '',
    email: '',
    address: '',
    tax_number: '',
    payment_terms_days: '30',
    credit_limit: '100000',
    status: 'active',
  });

  const mockCustomers = [
    {
      id: 'cust-1',
      customer_code: 'CUST-2026-001',
      name_ar: 'شركة أثاث المستقبل ش.م.م',
      name_en: 'Future Furniture Co. S.A.E',
      phone: '+20 100 555 1234',
      email: 'orders@futurefurniture.com',
      tax_number: '123-456-789',
      credit_limit: 250000,
      current_balance: 185000,
      status: 'active',
      orders_count: 14,
    },
    {
      id: 'cust-2',
      customer_code: 'CUST-2026-002',
      name_ar: 'مجموعة الأغذية النظيفة',
      name_en: 'Clean Food Group',
      phone: '+20 111 888 4433',
      email: 'supply@cleanfood.eg',
      tax_number: '987-654-321',
      credit_limit: 500000,
      current_balance: 512000, // Exceeded credit limit
      status: 'active',
      orders_count: 32,
    },
    {
      id: 'cust-3',
      customer_code: 'CUST-2026-003',
      name_ar: 'مصنع الشرق للأجهزة الكهربائية',
      name_en: 'Orient Electronics Factory',
      phone: '+20 122 777 9900',
      email: 'purchasing@orientelec.com',
      tax_number: '456-123-789',
      credit_limit: 150000,
      current_balance: 45000,
      status: 'active',
      orders_count: 8,
    },
    {
      id: 'cust-4',
      customer_code: 'CUST-2026-004',
      name_ar: 'الشركة العربية للتصدير',
      name_en: 'Arab Exporting Company',
      phone: '+20 106 444 3322',
      email: 'export@arabexport.com',
      tax_number: '321-987-654',
      credit_limit: 300000,
      current_balance: 0,
      status: 'suspended',
      orders_count: 3,
    },
  ];

  const filteredCustomers = mockCustomers.filter((c) => {
    const matchesSearch =
      c.name_ar.includes(searchTerm) ||
      c.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
  };

  return (
    <PermissionGate module="customers" action="view" fallback={
      <AppShell>
        <div className="p-8 text-center text-red-500 font-bold">
          {locale === 'ar' ? 'غير مصرح لك بعرض صفحة العملاء' : 'Access Denied: Customers view permission required'}
        </div>
      </AppShell>
    }>
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.customers')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إدارة سجلات العملاء، الحدود الائتمانية، وأرصدة الديون الحالية'
                  : 'Manage customer master records, credit limits, and outstanding balances'}
              </p>
            </div>

            <PermissionGate module="customers" action="create">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer'}</span>
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
                placeholder={t('actions.search') + " (Code, Name...)"}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">{t('common.status')}:</span>
              {['all', 'active', 'suspended', 'inactive'].map((st) => (
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

          {/* Customers Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('common.name')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الحد الائتماني' : 'Credit Limit'}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الرصيد المستحق' : 'Outstanding Balance'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredCustomers.map((c) => {
                    const isOverCredit = c.current_balance > c.credit_limit;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          <Link href={`/customers/${c.id}`} className="hover:underline">
                            {c.customer_code}
                          </Link>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {locale === 'ar' ? c.name_ar : c.name_en}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span><Phone className="w-3 h-3 inline me-1" />{c.phone}</span>
                            <span>•</span>
                            <span><Mail className="w-3 h-3 inline me-1" />{c.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{c.tax_number}</td>
                        <td className="p-3.5 font-bold">{formatCurrency(c.credit_limit)}</td>
                        <td className="p-3.5">
                          <div className={`font-extrabold ${isOverCredit ? 'text-red-600 dark:text-red-400 flex items-center gap-1' : 'text-slate-900 dark:text-slate-100'}`}>
                            {formatCurrency(c.current_balance)}
                            {isOverCredit && (
                              <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                {locale === 'ar' ? 'تجاوز الحد' : 'Over Limit'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {c.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {t('status.active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" /> {c.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/customers/${c.id}`} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <PermissionGate module="customers" action="edit">
                              <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Customer Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {locale === 'ar' ? 'إضافة عميل جديد' : 'Create New Customer'}
                  </h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'رمز العميل' : 'Customer Code'}</label>
                      <input
                        type="text"
                        required
                        value={formData.customer_code}
                        onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'الاسم العربي' : 'Arabic Name'}</label>
                      <input
                        type="text"
                        required
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'الاسم الإنجليزي' : 'English Name'}</label>
                      <input
                        type="text"
                        required
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">{locale === 'ar' ? 'الحد الائتماني (EGP)' : 'Credit Limit (EGP)'}</label>
                      <input
                        type="number"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg"
                    >
                      {t('actions.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      {t('actions.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </PermissionGate>
  );
}
