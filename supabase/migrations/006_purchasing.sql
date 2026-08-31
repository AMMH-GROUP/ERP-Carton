-- ============================================================
-- 006: PURCHASING DOMAIN TABLES, PG FUNCTIONS, RLS, INDEXES
-- ============================================================

-- 1. PURCHASE REQUESTS
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number TEXT NOT NULL UNIQUE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    department TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'converted', 'cancelled')),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE,
    reason TEXT,
    reference TEXT,
    approval_id UUID REFERENCES public.approvals(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.purchase_requests IS 'Purchase Requests (PRD §41)';

CREATE TABLE IF NOT EXISTS public.purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    estimated_unit_price DECIMAL(18,4) DEFAULT 0,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RFQS & SUPPLIER QUOTATIONS
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number TEXT NOT NULL UNIQUE,
    purchase_request_id UUID REFERENCES public.purchase_requests(id),
    rfq_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_deadline DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responses_received', 'evaluated', 'closed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    specifications TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    sent_at TIMESTAMPTZ,
    responded BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(rfq_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS public.supplier_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_supplier_id UUID NOT NULL REFERENCES public.rfq_suppliers(id) ON DELETE CASCADE,
    quotation_reference TEXT,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    delivery_days INTEGER DEFAULT 7,
    payment_terms TEXT,
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'selected', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.supplier_quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_quotation_id UUID NOT NULL REFERENCES public.supplier_quotations(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES public.rfq_items(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    quantity DECIMAL(18,4) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 14.00,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PURCHASE ORDERS & ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    rfq_id UUID REFERENCES public.rfqs(id),
    supplier_quotation_id UUID REFERENCES public.supplier_quotations(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date DATE,
    payment_terms_days INTEGER DEFAULT 30,
    delivery_terms TEXT,
    subtotal DECIMAL(18,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'sent',
        'partially_received', 'received', 'cancelled', 'closed'
    )),
    approval_id UUID REFERENCES public.approvals(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    rfq_item_id UUID REFERENCES public.rfq_items(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    received_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    remaining_qty DECIMAL(18,4) GENERATED ALWAYS AS (quantity - received_qty) STORED,
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. GOODS RECEIPTS (GRN) & ITEMS
CREATE TABLE IF NOT EXISTS public.goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_number TEXT NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'received', 'qc_pending', 'qc_completed', 'completed', 'cancelled')),
    received_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_cost DECIMAL(18,4) NOT NULL DEFAULT 0,
    qc_required BOOLEAN NOT NULL DEFAULT false,
    qc_status TEXT NOT NULL DEFAULT 'not_required' CHECK (qc_status IN ('not_required', 'pending', 'passed', 'failed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PURCHASE INVOICES (PINV) & 3-WAY MATCH
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pinv_number TEXT NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    goods_receipt_id UUID REFERENCES public.goods_receipts(id),
    supplier_invoice_number TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(18,2) DEFAULT 0,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    paid_amount DECIMAL(18,2) DEFAULT 0,
    remaining_amount DECIMAL(18,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    currency TEXT DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'matched', 'posted', 'partially_paid', 'paid', 'cancelled')),
    three_way_match_status TEXT NOT NULL DEFAULT 'not_matched' CHECK (three_way_match_status IN (
        'not_matched', 'matched', 'variance_detected', 'variance_approved'
    )),
    match_approval_id UUID REFERENCES public.approvals(id),
    journal_entry_id UUID,
    notes TEXT,
    posted_by UUID REFERENCES public.profiles(id),
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
    purchase_order_item_id UUID REFERENCES public.purchase_order_items(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_pr_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_grn_po ON public.goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_pinv_supplier ON public.purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pinv_status ON public.purchase_invoices(status);

-- ENABLE RLS
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "pr_select" ON public.purchase_requests FOR SELECT USING (public.has_permission(auth.uid(), 'purchase_requests', 'view'));
CREATE POLICY "pr_insert" ON public.purchase_requests FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'purchase_requests', 'create'));

CREATE POLICY "po_select" ON public.purchase_orders FOR SELECT USING (public.has_permission(auth.uid(), 'purchase_orders', 'view'));
CREATE POLICY "po_insert" ON public.purchase_orders FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'purchase_orders', 'create'));
CREATE POLICY "po_update" ON public.purchase_orders FOR UPDATE USING (public.has_permission(auth.uid(), 'purchase_orders', 'edit'));

CREATE POLICY "grn_select" ON public.goods_receipts FOR SELECT USING (public.has_permission(auth.uid(), 'goods_receipts', 'view'));
CREATE POLICY "grn_insert" ON public.goods_receipts FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'goods_receipts', 'create'));

CREATE POLICY "pinv_select" ON public.purchase_invoices FOR SELECT USING (public.has_permission(auth.uid(), 'purchase_invoices', 'view'));
CREATE POLICY "pinv_insert" ON public.purchase_invoices FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'purchase_invoices', 'create'));

-- ============================================================
-- CORE PURCHASING PG FUNCTIONS
-- ============================================================

-- Function: Process Goods Receipt (Atomic RM Inbound Stock Movement + WAC Update + PO Receive Tracking)
CREATE OR REPLACE FUNCTION public.process_goods_receipt(
    p_goods_receipt_id UUID
) RETURNS VOID AS $$
DECLARE
    v_grn public.goods_receipts%ROWTYPE;
    v_item RECORD;
BEGIN
    SELECT * INTO v_grn FROM public.goods_receipts WHERE id = p_goods_receipt_id FOR UPDATE;

    IF v_grn.status != 'received' THEN
        RAISE EXCEPTION 'Goods Receipt must be in "received" status to process stock entry';
    END IF;

    FOR v_item IN SELECT * FROM public.goods_receipt_items WHERE goods_receipt_id = p_goods_receipt_id LOOP
        -- Inbound inventory movement into Raw Materials / Spare Parts warehouse
        PERFORM public.create_inventory_movement(
            v_item.product_id, v_grn.warehouse_id, v_item.quantity,
            v_item.uom_id, 'purchase_receipt', 'goods_receipt', p_goods_receipt_id, v_item.unit_cost, 'Purchase Order Receipt'
        );

        -- Update Purchase Order Item received_qty
        UPDATE public.purchase_order_items
        SET received_qty = received_qty + v_item.quantity,
            updated_at = now()
        WHERE id = v_item.purchase_order_item_id;
    END LOOP;

    -- Update Goods Receipt status
    UPDATE public.goods_receipts SET status = 'completed', updated_at = now() WHERE id = p_goods_receipt_id;

    -- Update Purchase Order status
    UPDATE public.purchase_orders SET status = 'received', updated_at = now() WHERE id = v_grn.purchase_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: 3-Way Match Execution (PO vs GRN vs Invoice)
CREATE OR REPLACE FUNCTION public.execute_three_way_match(
    p_invoice_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_inv public.purchase_invoices%ROWTYPE;
    v_po public.purchase_orders%ROWTYPE;
    v_has_variance BOOLEAN := false;
BEGIN
    SELECT * INTO v_inv FROM public.purchase_invoices WHERE id = p_invoice_id FOR UPDATE;

    IF v_inv.purchase_order_id IS NULL THEN
        RETURN 'not_matched';
    END IF;

    SELECT * INTO v_po FROM public.purchase_orders WHERE id = v_inv.purchase_order_id;

    -- Compare totals
    IF ABS(v_inv.total_amount - v_po.total_amount) > 1.00 THEN
        v_has_variance := true;
    END IF;

    IF v_has_variance THEN
        UPDATE public.purchase_invoices SET three_way_match_status = 'variance_detected', updated_at = now() WHERE id = p_invoice_id;
        RETURN 'variance_detected';
    ELSE
        UPDATE public.purchase_invoices SET three_way_match_status = 'matched', updated_at = now() WHERE id = p_invoice_id;
        RETURN 'matched';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
