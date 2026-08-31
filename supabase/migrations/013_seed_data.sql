-- ============================================================
-- 013: SEED DATA FOR ROLES, PERMISSIONS, AND SEQUENCES
-- ============================================================

-- 1. Default Roles
INSERT INTO public.roles (name_en, name_ar, description, is_system) VALUES
('Super Admin', 'مدير النظام', 'Full system access and administration', true),
('Factory Manager', 'مدير المصنع', 'Complete operational management oversight', true),
('Sales', 'المبيعات', 'Quotations, Sales Orders, Customer relations', true),
('Purchasing', 'المشتريات', 'Purchase Requests, RFQs, POs, Supplier management', true),
('Warehouse', 'المخازن', 'Stock management, Material Issues, Goods Receiving', true),
('Production Manager', 'مدير الإنتاج', 'Production planning, MO release, Capacity management', true),
('Production Operator', 'مشغل الإنتاج', 'Production entry, downtime, waste recording', true),
('QC', 'مراقبة الجودة', 'Inspections, Pass/Fail, Rework/Scrap decisions', true),
('Maintenance', 'الصيانة', 'Machine maintenance, PM scheduling, Downtime tracking', true),
('Accountant', 'المحاسبة', 'GL, Invoices, Payments, Cash/Bank, Expenses, Financial Reports', true)
ON CONFLICT DO NOTHING;

-- 2. Generate Permissions Matrix
DO $$
DECLARE
    modules TEXT[] := ARRAY[
        'users', 'roles', 'permissions_admin', 'system_settings', 'audit_logs',
        'approvals', 'notifications', 'customers', 'suppliers', 'products',
        'product_categories', 'uom', 'warehouses', 'machines',
        'quotations', 'pricing', 'sales_orders', 'deliveries',
        'sales_invoices', 'credit_notes', 'customer_payments', 'sales_returns',
        'purchase_requests', 'rfqs', 'purchase_orders', 'goods_receipts',
        'purchase_invoices', 'supplier_payments', 'purchase_returns',
        'bom', 'production_orders', 'material_requests', 'production_logs',
        'qc_inspections', 'rework_orders', 'scrap',
        'chart_of_accounts', 'journal_entries', 'general_ledger',
        'accounting_periods', 'cash_accounts', 'bank_accounts',
        'cash_transactions', 'bank_transactions', 'cash_closings',
        'bank_reconciliations', 'expenses',
        'maintenance_orders', 'preventive_maintenance',
        'inventory', 'stock_counts', 'warehouse_transfers', 'stock_adjustments',
        'reports', 'attachments', 'overhead'
    ];
    actions TEXT[] := ARRAY['view', 'create', 'edit', 'delete', 'approve', 'post', 'cancel', 'export', 'print'];
    m TEXT;
    a TEXT;
BEGIN
    FOREACH m IN ARRAY modules LOOP
        FOREACH a IN ARRAY actions LOOP
            INSERT INTO public.permissions (module, action, description)
            VALUES (m, a, m || ':' || a)
            ON CONFLICT (module, action) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 3. Super Admin Role Permissions (Grant ALL permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r 
CROSS JOIN public.permissions p
WHERE r.name_en = 'Super Admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. Document Sequences Seed
INSERT INTO public.document_sequences (doc_type, prefix, year_format, next_number, pad_length) VALUES
('quotation', 'QT', 'YYYY', 1, 5),
('sales_order', 'SO', 'YYYY', 1, 5),
('purchase_order', 'PO', 'YYYY', 1, 5),
('production_order', 'MO', 'YYYY', 1, 5),
('sales_invoice', 'INV', 'YYYY', 1, 5),
('delivery', 'DN', 'YYYY', 1, 5),
('purchase_request', 'PR', 'YYYY', 1, 5),
('material_request', 'MR', 'YYYY', 1, 5),
('qc_inspection', 'QC', 'YYYY', 1, 5),
('rework_order', 'RW', 'YYYY', 1, 5),
('purchase_invoice', 'PINV', 'YYYY', 1, 5),
('customer_payment', 'PAY', 'YYYY', 1, 5),
('supplier_payment', 'SPAY', 'YYYY', 1, 5),
('credit_note', 'CN', 'YYYY', 1, 5),
('goods_receipt', 'GRN', 'YYYY', 1, 5),
('warehouse_transfer', 'TRF', 'YYYY', 1, 5),
('stock_count', 'SC', 'YYYY', 1, 5),
('expense', 'EXP', 'YYYY', 1, 5),
('maintenance_order', 'MNT', 'YYYY', 1, 5),
('rfq', 'RFQ', 'YYYY', 1, 5),
('sales_return', 'SRT', 'YYYY', 1, 5),
('purchase_return', 'PRT', 'YYYY', 1, 5),
('journal_entry', 'JE', 'YYYY', 1, 5),
('cash_closing', 'CCL', 'YYYY', 1, 5)
ON CONFLICT (doc_type) DO NOTHING;

-- 5. Default System Settings
INSERT INTO public.system_settings (setting_key, setting_value, category, description_en, description_ar) VALUES
('default_currency', '"EGP"', 'general', 'Default system currency code', 'رمز العملة الافتراضية للنظام'),
('default_vat_rate', '14', 'finance', 'Default VAT rate percentage', 'نسبة ضريبة القيمة المضافة الافتراضية'),
('default_language', '"ar"', 'general', 'Default UI language', 'لغة واجهة المستخدم الافتراضية'),
('credit_check_enabled', 'true', 'sales', 'Enable customer credit limit validation', 'تفعيل التحقق من الحد الائتماني للعميل'),
('negative_stock_allowed', 'false', 'inventory', 'Allow negative stock quantities', 'السماح بالكميات السالبة بالمخزون'),
('price_override_threshold_pct', '10', 'sales', 'Price override percentage threshold requiring approval', 'نسبة تعديل السعر التي تتطلب موافقة'),
('expense_approval_threshold_1', '5000', 'finance', 'Expense threshold 1 for manager approval', 'حد المصروفات 1 لموافقة المدير'),
('expense_approval_threshold_2', '50000', 'finance', 'Expense threshold 2 for GM approval', 'حد المصروفات 2 لموافقة المدير العام'),
('material_variance_threshold_pct', '5', 'manufacturing', 'Material consumption variance threshold %', 'نسبة التفاوت المسموح بها في استهلاك المواد'),
('cash_variance_approval_threshold', '500', 'treasury', 'Cash closing variance requiring approval', 'تفاوت إغلاق الصندوق الذي يتطلب موافقة')
ON CONFLICT (setting_key) DO NOTHING;
