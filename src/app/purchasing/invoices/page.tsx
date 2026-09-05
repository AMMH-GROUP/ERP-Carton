'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useTranslation } from '@/lib/i18n/context';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Receipt, Plus, AlertTriangle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { EInvoiceTemplate, EInvoiceData } from '@/components/shared/EInvoiceTemplate';

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoiceData | null>(null);

  const mockInvoices = [
    {
      id: '1',
      pinv_number: 'PINV-2026-00014',
      po_number: 'PO-2026-00014',
      supplier_ar: 'شركة النيل للورق الخام والكرتون',
      supplier_en: 'Nile Paper Raw Materials Co.',
      supplier_tax_id: '849-112-704',
      supplier_cr_no: 'CR-19402',
      address: 'المنطقة الصناعية - السادات - المنوفية',
      supplier_inv_ref: 'INV-NILE-9941',
      date: '2026-08-31',
      due_date: '2026-09-30',
      total_amount: 1624500,
      three_way_match: 'matched',
      status: 'posted',
      items: [
        {
          item_code: 'RAW-PAPER-KRAFT-175',
          description_ar: 'ورق كرافت مستورد زنة 175 جرام/م2 رول عرض 140 سم',
          description_en: 'Imported Kraft Liner Board 175 GSM 140cm Roll',
          quantity: 50,
          uom: 'طن',
          unit_price: 28500.0,
        },
      ],
    },
    {
      id: '2',
      pinv_number: 'PINV-2026-00012',
      po_number: 'PO-2026-00010',
      supplier_ar: 'الشركة العالمية للمواد اللاصقة والنشا',
      supplier_en: 'Global Starch & Adhesives Ltd',
      supplier_tax_id: '501-884-219',
      supplier_cr_no: 'CR-33019',
      address: 'طريق مصر الإسكندرية الصحراوي - الجيزة',
      supplier_inv_ref: 'INV-GST-1120',
      date: '2026-08-22',
      due_date: '2026-09-22',
      total_amount: 95000,
      three_way_match: 'variance_detected',
      status: 'draft',
      items: [
        {
          item_code: 'RAW-ADHESIVE-STARCH',
          description_ar: 'نشا ذرة صناعي عالي الجودة لتصنيع غراء الكرتون المضلع',
          description_en: 'Industrial Maize Starch for Corrugator Glue',
          quantity: 5,
          uom: 'طن',
          unit_price: 16666.67,
        },
      ],
    },
  ];

  const handleOpenEInvoice = (inv: typeof mockInvoices[0]) => {
    setSelectedInvoice({
      invoice_number: inv.supplier_inv_ref,
      issue_date: inv.date,
      due_date: inv.due_date,
      payment_terms: 'آجل 30 يوم (مشتريات)',
      issuer_type: 'purchase',
      receiver_name_ar: inv.supplier_ar,
      receiver_name_en: inv.supplier_en,
      receiver_tax_id: inv.supplier_tax_id,
      receiver_cr_no: inv.supplier_cr_no,
      receiver_address: inv.address,
      items: inv.items,
    });
  };

  return (
    <PermissionGate module="purchase_invoices" action="view">
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {t('nav.purchaseInvoices')}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ar'
                  ? 'فواتير المشتريات الضريبية والربط مع أمر الشراء وإذن الاستلام (3-Way Match Verification) (PRD §48-49)'
                  : 'Purchase Invoices management and 3-Way Match verification (PO vs GRN vs Invoice)'}
              </p>
            </div>

            <PermissionGate module="purchase_invoices" action="create">
              <button 
                onClick={() => router.push('/purchasing/invoices/new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'فاتورة شراء جديدة' : 'New Purchase Invoice'}</span>
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
                    <th className="p-3.5 text-start">{t('nav.purchaseOrders')}</th>
                    <th className="p-3.5 text-start">{t('nav.suppliers')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'فاتورة المورد' : 'Supplier Inv #'}</th>
                    <th className="p-3.5 text-start">{t('common.total')}</th>
                    <th className="p-3.5 text-start">{locale === 'ar' ? 'الربط الثلاثي (3-Way Match)' : '3-Way Match'}</th>
                    <th className="p-3.5 text-start">{t('common.status')}</th>
                    <th className="p-3.5 text-center">{locale === 'ar' ? 'الفاتورة الضريبية' : 'Tax Invoice'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {mockInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.pinv_number}
                      </td>
                      <td className="p-3.5 font-mono font-bold">{inv.po_number}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {locale === 'ar' ? inv.supplier_ar : inv.supplier_en}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{inv.supplier_inv_ref}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-3.5">
                        {inv.three_way_match === 'matched' ? (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold text-[10px]">
                            {locale === 'ar' ? 'مطابق 100%' : 'Matched 100%'}
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-600 dark:bg-red-950 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> {locale === 'ar' ? 'تم اكتشاف فروقات (تفاوت)' : 'Variance Detected'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenEInvoice(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'معاينة وطباعة الفاتورة' : 'View Tax Invoice'}</span>
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

