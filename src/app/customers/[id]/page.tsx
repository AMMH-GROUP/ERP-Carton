'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Users,
  Building,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ShoppingBag,
  Receipt,
  DollarSign,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'orders' | 'invoices' | 'payments' | 'statement'>('info');

  const customer = {
    id: params.id,
    customer_code: 'CUST-2026-001',
    name_ar: 'شركة أثاث المستقبل ش.م.م',
    name_en: 'Future Furniture Co. S.A.E',
    phone: '+20 100 555 1234',
    email: 'orders@futurefurniture.com',
    address: 'المنطقة الصناعية الثالثة، مدينة 6 أكتوبر، الجيزة',
    tax_number: '123-456-789',
    payment_terms_days: 30,
    credit_limit: 250000,
    current_balance: 185000,
    status: 'active',
  };

  const contacts = [
    { name: 'المهندس طارق السعيد', phone: '+20 100 111 2233', email: 'tarek@futurefurniture.com', position: 'مدير المشتريات', is_primary: true },
    { name: 'أستاذ حاتم عبد العزيز', phone: '+20 111 444 5566', email: 'hatem@futurefurniture.com', position: 'المحاسب الرئيسي', is_primary: false },
  ];

  const orders = [
    { id: '1', so_number: 'SO-2026-00012', date: '2026-08-20', total: 125000, status: 'confirmed' },
    { id: '2', so_number: 'SO-2026-00008', date: '2026-08-10', total: 60000, status: 'delivered' },
  ];

  return (
    <PermissionGate module="customers" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {locale === 'ar' ? customer.name_ar : customer.name_en}
                  </h1>
                  <span className="font-mono text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-2 py-0.5 rounded font-bold">
                    {customer.customer_code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  <Phone className="w-3 h-3 inline me-1" />{customer.phone} • <Mail className="w-3 h-3 inline me-1" />{customer.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{locale === 'ar' ? 'الرصيد المستحق' : 'Outstanding'}</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {formatCurrency(customer.current_balance)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{locale === 'ar' ? 'الحد الائتماني' : 'Credit Limit'}</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {formatCurrency(customer.credit_limit)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto custom-scrollbar pb-1">
            {[
              { key: 'info', label: locale === 'ar' ? 'البيانات الأساسية' : 'Basic Info', icon: Building },
              { key: 'contacts', label: locale === 'ar' ? 'مسؤولو التواصل' : 'Contacts', icon: Users },
              { key: 'orders', label: locale === 'ar' ? 'أوامر البيع' : 'Sales Orders', icon: ShoppingBag },
              { key: 'invoices', label: locale === 'ar' ? 'الفواتير' : 'Invoices', icon: Receipt },
              { key: 'payments', label: locale === 'ar' ? 'المدفوعات' : 'Payments', icon: DollarSign },
              { key: 'statement', label: locale === 'ar' ? 'كشف الحساب' : 'Account Statement', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-2.5 px-4 flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 block font-semibold">{locale === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{customer.name_ar}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{locale === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{customer.name_en}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{locale === 'ar' ? 'العنوان' : 'Address'}</span>
                    <span className="text-slate-800 dark:text-slate-200">{customer.address}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 block font-semibold">{locale === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{customer.tax_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">{locale === 'ar' ? 'شروط الدفع (أيام)' : 'Payment Terms'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{customer.payment_terms_days} {locale === 'ar' ? 'يوماً' : 'Days'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                        {c.is_primary && (
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {locale === 'ar' ? 'جهة تواصل رئيسية' : 'Primary'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 mt-1">{c.position}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-mono">{c.phone}</p>
                      <p className="text-slate-400">{c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-2 text-xs">
                {orders.map((o) => (
                  <div key={o.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold font-mono text-indigo-600">{o.so_number}</span>
                      <p className="text-slate-400 mt-0.5">{o.date}</p>
                    </div>
                    <div className="text-end">
                      <span className="font-extrabold">{formatCurrency(o.total)}</span>
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'statement' && (
              <div className="p-6 text-center text-slate-400 text-xs">
                {locale === 'ar' ? 'كشف الحساب التفصيلي للعميل متوفر للتحميل والطباعة' : 'Detailed customer statement available for export and print'}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </PermissionGate>
  );
}
