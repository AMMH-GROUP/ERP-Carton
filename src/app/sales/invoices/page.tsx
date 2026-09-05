'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, Eye, Printer, ShieldCheck, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EInvoiceTemplate, EInvoiceData } from '@/components/shared/EInvoiceTemplate';

export default function SalesInvoicesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoiceData | null>(null);

  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-2026-00034',
      so_number: 'SO-2026-00012',
      customer_ar: 'مصنع الشرق للأجهزة الكهربائية',
      customer_en: 'Orient Electronics SAE',
      tax_id: '985-632-114',
      cr_no: 'CR-90821',
      address: 'المنطقة الصناعية - مدينة نصر - القاهرة - مصر',
      date: '2026-08-31',
      due_date: '2026-09-30',
      total_amount: 96900,
      paid_amount: 0,
      status: 'posted',
      items: [
        {
          item_code: 'EG-984512367-CTN-501',
          description_ar: 'كرتونة مضلعة 5 طبقات C-Flute (مطبوع 3 لون) 40x30x25 سم - مقاس قياسي',
          description_en: 'Corrugated Box 5-Ply C-Flute 40x30x25 cm',
          quantity: 5000,
          uom: 'قطعة',
          unit_price: 17.0,
        },
      ],
    },
    {
      id: '2',
      invoice_number: 'INV-2026-00030',
      so_number: 'SO-2026-00005',
      customer_ar: 'شركة أثاث المستقبل ش.م.م',
      customer_en: 'Future Furniture Co. S.A.E',
      tax_id: '412-980-332',
      cr_no: 'CR-45120',
      address: 'المنطقة الصناعية الرابعة - البساتين - القاهرة',
      date: '2026-08-15',
      due_date: '2026-09-15',
      total_amount: 142500,
      paid_amount: 142500,
      status: 'paid',
      items: [
        {
          item_code: 'EG-984512367-CTN-808',
          description_ar: 'كرتونة دبل فلوت BC Kraft للموبيليا والتصدير 80x60x50 سم',
          description_en: 'Heavy Duty BC-Flute Export Box 80x60x50 cm',
          quantity: 2500,
          uom: 'قطعة',
          unit_price: 50.0,
        },
      ],
    },
  ];

  const handleOpenEInvoice = (inv: typeof mockInvoices[0]) => {
    setSelectedInvoice({
      invoice_number: inv.invoice_number,
      issue_date: inv.date,
      due_date: inv.due_date,
      payment_terms: 'آجل 30 يوم',
      issuer_type: 'sales',
      receiver_name_ar: inv.customer_ar,
      receiver_name_en: inv.customer_en,
      receiver_tax_id: inv.tax_id,
      receiver_cr_no: inv.cr_no,
      receiver_address: inv.address,
      items: inv.items,
    });
  };

  return (
    <PermissionGate module="sales_invoices" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.salesInvoices')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'إصدار فواتير المبيعات الضريبية الإلكترونية المعتمدة ومطابقتها مع مصلحة الضرائب المصرية (PRD §53-54)'
                  : 'Manage Official Egyptian ETA E-Invoices, auto accounting integration & collections'}
              </p>
            </div>

            <PermissionGate module="sales_invoices" action="create">
              <button 
                onClick={() => router.push('/sales/invoices/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إصدار فاتورة ضريبية جديدة' : 'Create Sales Invoice'}</span>
              </button>
            </PermissionGate>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 text-start">{t('common.code')}</th>
                    <th className="p-3.5 text-start">{t('nav.salesOrders')}</th>
                    <th className="p-3.5 text-start">{t('nav.customers')}</th>
                    <th className="p-3.5 text-start">{t('common.date')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-center">{locale === 'ar' ? 'الفاتورة الإلكترونية' : 'E-Invoice'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoice_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{inv.so_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? inv.customer_ar : inv.customer_en}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{inv.date}</td>
                      <td className="p-3.5 font-mono text-slate-400">{inv.due_date}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {inv.status === 'paid' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مسددة بالكامل' : 'Paid'}
                          </span>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مرحلة (غير مسددة)' : 'Posted (Unpaid)'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenEInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'معاينة وطباعة الفاتورة' : 'E-Invoice View'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* E-Invoice Modal */}
          {selectedInvoice && (
            <EInvoiceTemplate 
              invoice={selectedInvoice} 
              onClose={() => setSelectedInvoice(null)} 
            />
          )}
        </div>
      </AppShell>
    </PermissionGate>
  );
}

