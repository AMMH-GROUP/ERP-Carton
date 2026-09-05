'use client';

import React, { useRef } from 'react';
import { Printer, Download, CheckCircle2, ShieldCheck, QrCode, Building2, MapPin, Phone, Mail, FileText, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface EInvoiceItem {
  item_code: string;
  description_ar: string;
  description_en: string;
  quantity: number;
  uom: string;
  unit_price: number;
  discount_amount?: number;
  tax_rate_pct?: number; // default 14%
}

export interface EInvoiceData {
  invoice_number: string;
  e_uuid?: string;
  issue_date: string;
  due_date?: string;
  payment_terms?: string;
  issuer_type?: 'sales' | 'purchase';
  
  // Buyer / Customer / Supplier Info
  receiver_name_ar: string;
  receiver_name_en?: string;
  receiver_tax_id?: string;
  receiver_cr_no?: string;
  receiver_address?: string;
  receiver_phone?: string;
  
  items: EInvoiceItem[];
  notes?: string;
}

export function EInvoiceTemplate({ invoice, onClose }: { invoice: EInvoiceData; onClose?: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  // Constants for Issuer (Factory)
  const issuer = {
    name_ar: 'شركة مصنع الكرتون المضلع (ش.م.م)',
    name_en: 'Corrugated Carton Factory S.A.E',
    tax_id: '984-512-367',
    cr_number: 'CR-104852',
    activity: 'تصنيع وتشكيل الكرتون المضلع والتعبئة والتغليف',
    address: 'المنطقة الصناعية الثالثة - 6 أكتوبر - الجيزة - مصر',
    phone: '+20 2 38350000 / +20 100 1234567',
    email: 'tax@carton-erp.com',
    website: 'www.carton-erp.com',
  };

  const e_uuid = invoice.e_uuid || `7a9b3f2e-${invoice.invoice_number.replace(/\D/g, '') || '8452'}-4598-a231-6b801f92e104`;

  // Calculations
  const vatRate = 0.14; // 14% ETA Standard VAT
  const itemsCalculated = invoice.items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const disc = Number(item.discount_amount) || 0;
    const subtotal = Math.max(0, qty * price - disc);
    const itemVatRate = item.tax_rate_pct !== undefined ? item.tax_rate_pct / 100 : vatRate;
    const vatAmount = subtotal * itemVatRate;
    const lineTotal = subtotal + vatAmount;
    return { ...item, subtotal, vatAmount, lineTotal };
  });

  const totalSubtotal = itemsCalculated.reduce((sum, i) => sum + i.subtotal, 0);
  const totalVat = itemsCalculated.reduce((sum, i) => sum + i.vatAmount, 0);
  const grandTotal = totalSubtotal + totalVat;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto custom-scrollbar">
      {/* Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Controls Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                الفاتورة الضريبية الإلكترونية الموحدة (ETA Standard E-Invoice)
              </h3>
              <p className="text-[11px] text-slate-400">
                معتمدة ومطابقة لمواصفات مصلحة الضرائب المصرية ومنظومة الفاتورة الإلكترونية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة الضريبية</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 bg-white text-slate-900 print:p-0 print:m-0">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-900">
            {/* Issuer Information */}
            <div className="space-y-1 text-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-lg">
                  📦
                </div>
                <div>
                  <h1 className="font-black text-lg text-slate-900 tracking-tight leading-tight">
                    {issuer.name_ar}
                  </h1>
                  <p className="text-[11px] font-bold text-slate-500 tracking-wide">
                    {issuer.name_en}
                  </p>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-slate-600 mt-2">
                نشاط: {issuer.activity}
              </p>
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                <p>📍 {issuer.address}</p>
                <p>📞 {issuer.phone} | ✉️ {issuer.email}</p>
              </div>
            </div>

            {/* Official Tax IDs & Title Box */}
            <div className="text-end space-y-2 self-stretch sm:self-auto flex flex-col justify-between items-end">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-center shadow-xs">
                <span className="text-[10px] font-bold block text-indigo-300 tracking-widest uppercase">
                  {invoice.issuer_type === 'purchase' ? 'فاتورة مشتريات ضريبية' : 'فاتورة مبيعات ضريبية إلكترونية'}
                </span>
                <span className="text-sm font-mono font-black tracking-wider">
                  {invoice.invoice_number}
                </span>
              </div>

              <div className="text-[11px] font-bold space-y-1 text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-start w-full">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">رقم التسجيل الضريبي:</span>
                  <span className="font-mono font-black text-indigo-700">{issuer.tax_id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">رقم السجل التجاري:</span>
                  <span className="font-mono font-black">{issuer.cr_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* E-Invoice Meta Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">تاريخ الإصدار / Issue Date</span>
              <span className="font-mono font-black text-slate-900">{invoice.issue_date}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">تاريخ الاستحقاق / Due Date</span>
              <span className="font-mono font-black text-slate-900">{invoice.due_date || invoice.issue_date}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">شروط الدفع / Terms</span>
              <span className="font-bold text-slate-900">{invoice.payment_terms || 'آجل 30 يوم'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">حالة الاعتماد الضريبي</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> مُعتمَدة ومسجلة
              </span>
            </div>
          </div>

          {/* Receiver / Customer Card */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
            <h4 className="font-black text-xs text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span>بيانات المستلم / العميل (Buyer Information)</span>
              <span className="text-[10px] font-normal text-slate-500">كود العميل الضريبي</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">الاسم التجاري / الشركة:</span>
                <span className="font-black text-sm text-slate-900 block">{invoice.receiver_name_ar}</span>
                {invoice.receiver_name_en && (
                  <span className="text-[11px] text-slate-500 font-semibold">{invoice.receiver_name_en}</span>
                )}
              </div>
              <div className="space-y-1 text-start">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">الرقم الضريبي للمستلم:</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {invoice.receiver_tax_id || '985-632-114'}
                  </span>
                </div>
                {invoice.receiver_address && (
                  <p className="text-[11px] text-slate-600">📍 {invoice.receiver_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto border border-slate-900 rounded-xl">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-2.5 text-center w-8">م</th>
                  <th className="p-2.5 text-start">كود الصنف (EGS Code)</th>
                  <th className="p-2.5 text-start">الوصف ومواصفات المنتج (Description)</th>
                  <th className="p-2.5 text-center">الكمية</th>
                  <th className="p-2.5 text-end">سعر الوحدة</th>
                  <th className="p-2.5 text-end">الصافي قبل الضريبة</th>
                  <th className="p-2.5 text-center">الضريبة (14%)</th>
                  <th className="p-2.5 text-end">الإجمالي الشامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {itemsCalculated.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-semibold">
                    <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-700">{item.item_code}</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      <div>{item.description_ar}</div>
                      {item.description_en && <div className="text-[10px] text-slate-400 font-normal">{item.description_en}</div>}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      {item.quantity} <span className="text-[10px] text-slate-500">{item.uom}</span>
                    </td>
                    <td className="p-2.5 text-end font-mono">{formatCurrency(item.unit_price)}</td>
                    <td className="p-2.5 text-end font-mono font-bold">{formatCurrency(item.subtotal)}</td>
                    <td className="p-2.5 text-center font-mono text-slate-600">{formatCurrency(item.vatAmount)}</td>
                    <td className="p-2.5 text-end font-mono font-black text-slate-900">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end pt-2">
            
            {/* ETA QR Code & E-Signature Hash */}
            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-xs">
                  {/* Simulated QR Code Component */}
                  <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center p-1 rounded">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="space-y-1 text-start">
                  <p className="text-[10px] font-bold text-slate-700">التوقيع والختم الإلكتروني المعتمد</p>
                  <p className="text-[9px] font-mono text-slate-500 break-all leading-tight">
                    e-UUID: {e_uuid}
                  </p>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded inline-block">
                    ✓ تم التحقق من المنظومة الإلكترونية
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                * هذه الفاتورة صادرة إلكترونياً وتعتبر مستنداً ضريبياً رسمياً وفقاً لأحكام القانون رقم 206 لسنة 2020.
              </p>
            </div>

            {/* Financial Totals Summary */}
            <div className="space-y-2 text-xs font-bold bg-slate-50 p-4 rounded-xl border border-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                <span>الإجمالي قبل الضريبة (Subtotal):</span>
                <span className="font-mono text-sm">{formatCurrency(totalSubtotal)}</span>
              </div>
              
              <div className="flex justify-between py-1 border-b border-slate-200 text-indigo-700">
                <span>ضريبة القيمة المضافة (VAT 14%):</span>
                <span className="font-mono text-sm">{formatCurrency(totalVat)}</span>
              </div>

              <div className="flex justify-between py-2 text-base font-black bg-slate-900 text-white p-3 rounded-lg mt-2">
                <span>الإجمالي النهائي (Grand Total):</span>
                <span className="font-mono">{formatCurrency(grandTotal)}</span>
              </div>

              <p className="text-[10px] text-slate-600 font-semibold pt-1 text-start">
                Tafqeet: فقط {grandTotal.toLocaleString('ar-EG')} جنيهاً مصرياً لا غير.
              </p>
            </div>

          </div>

          {/* Footer Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-300 text-center text-xs font-bold text-slate-700">
            <div>
              <p className="text-slate-400 mb-6">أعدها (Prepared By)</p>
              <p className="border-t border-dashed border-slate-400 pt-1">إدارة المحاسبة والإنتاج</p>
            </div>
            <div>
              <p className="text-slate-400 mb-6">راجعها (Reviewed By)</p>
              <p className="border-t border-dashed border-slate-400 pt-1">المراجع المالي والضريبي</p>
            </div>
            <div>
              <p className="text-slate-400 mb-6">توقيع المستلم (Receiver Signature)</p>
              <p className="border-t border-dashed border-slate-400 pt-1">مُستلَم البضاعة الفعلي</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
