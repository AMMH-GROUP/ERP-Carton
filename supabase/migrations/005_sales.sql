-- ============================================================
-- 005: SALES DOMAIN TABLES, PG FUNCTIONS, RLS, INDEXES
-- ============================================================

-- 1. QUOTATIONS & ITEMS & SPECS
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    payment_terms_days INTEGER DEFAULT 30,
    delivery_terms TEXT,
    subtotal DECIMAL(18,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'sent', 'accepted', 'rejected', 'expired', 'cancelled', 'converted')),
    notes TEXT,
    sales_person_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.quotations IS 'Customer quotations (PRD §17)';

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    calculated_price DECIMAL(18,4) DEFAULT 0,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_price_overridden BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotation_item_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_item_id UUID NOT NULL REFERENCES public.quotation_items(id) ON DELETE CASCADE UNIQUE,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    weight DECIMAL(10,3),
    gsm DECIMAL(10,2),
    board_type TEXT,
    flute_type TEXT,
    printing_type TEXT,
    num_colors INTEGER DEFAULT 0,
    die_cut BOOLEAN DEFAULT false,
    folding_type TEXT,
    glue_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('quotation_item', 'sales_order_item')),
    reference_id UUID NOT NULL,
    original_price DECIMAL(18,4) NOT NULL,
    override_price DECIMAL(18,4) NOT NULL,
    difference DECIMAL(18,4) GENERATED ALWAYS AS (override_price - original_price) STORED,
    reason TEXT NOT NULL,
    override_by UUID NOT NULL REFERENCES public.profiles(id),
    override_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approval_id UUID REFERENCES public.approvals(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SALES ORDERS & ITEMS & SPECS
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_id UUID REFERENCES public.quotations(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_delivery_date DATE,
    payment_terms_days INTEGER DEFAULT 30,
    delivery_terms TEXT,
    subtotal DECIMAL(18,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'confirmed', 'reserved',
        'partially_produced', 'ready', 'partially_delivered', 'delivered',
        'cancelled', 'closed'
    )),
    credit_check_status TEXT NOT NULL DEFAULT 'not_checked' CHECK (credit_check_status IN (
        'not_checked', 'passed', 'exceeded_approved', 'exceeded_rejected'
    )),
    credit_approval_id UUID REFERENCES public.approvals(id),
    production_required_qty DECIMAL(18,4) DEFAULT 0,
    sales_person_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quotation_item_id UUID REFERENCES public.quotation_items(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    delivered_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    remaining_qty DECIMAL(18,4) GENERATED ALWAYS AS (quantity - delivered_qty) STORED,
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    calculated_price DECIMAL(18,4) DEFAULT 0,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_price_overridden BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sales_order_item_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_item_id UUID NOT NULL REFERENCES public.sales_order_items(id) ON DELETE CASCADE UNIQUE,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    weight DECIMAL(10,3),
    gsm DECIMAL(10,2),
    board_type TEXT,
    flute_type TEXT,
    printing_type TEXT,
    num_colors INTEGER DEFAULT 0,
    die_cut BOOLEAN DEFAULT false,
    folding_type TEXT,
    glue_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. DELIVERIES & ITEMS
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number TEXT NOT NULL UNIQUE,
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    driver_name TEXT,
    vehicle_number TEXT,
    notes TEXT,
    delivered_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.delivery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    sales_order_item_id UUID NOT NULL REFERENCES public.sales_order_items(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SALES INVOICES & CREDIT NOTES
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    sales_order_id UUID REFERENCES public.sales_orders(id),
    delivery_id UUID REFERENCES public.deliveries(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(18,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    paid_amount DECIMAL(18,2) DEFAULT 0,
    remaining_amount DECIMAL(18,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    currency TEXT DEFAULT 'EGP',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    journal_entry_id UUID,
    notes TEXT,
    posted_by UUID REFERENCES public.profiles(id),
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
    sales_order_item_id UUID REFERENCES public.sales_order_items(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_price DECIMAL(18,4) NOT NULL DEFAULT 0,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_rate_id UUID REFERENCES public.tax_rates(id),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    line_total DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_quotations_cust ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_so_cust ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_so_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_so ON public.deliveries(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_cust ON public.sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.sales_invoices(status);

-- ENABLE RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "quotations_select" ON public.quotations FOR SELECT USING (public.has_permission(auth.uid(), 'quotations', 'view'));
CREATE POLICY "quotations_insert" ON public.quotations FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'quotations', 'create'));
CREATE POLICY "quotations_update" ON public.quotations FOR UPDATE USING (public.has_permission(auth.uid(), 'quotations', 'edit'));

CREATE POLICY "so_select" ON public.sales_orders FOR SELECT USING (public.has_permission(auth.uid(), 'sales_orders', 'view'));
CREATE POLICY "so_insert" ON public.sales_orders FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'sales_orders', 'create'));
CREATE POLICY "so_update" ON public.sales_orders FOR UPDATE USING (public.has_permission(auth.uid(), 'sales_orders', 'edit'));

CREATE POLICY "deliveries_select" ON public.deliveries FOR SELECT USING (public.has_permission(auth.uid(), 'deliveries', 'view'));
CREATE POLICY "deliveries_insert" ON public.deliveries FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'deliveries', 'create'));

CREATE POLICY "invoices_select" ON public.sales_invoices FOR SELECT USING (public.has_permission(auth.uid(), 'sales_invoices', 'view'));
CREATE POLICY "invoices_insert" ON public.sales_invoices FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'sales_invoices', 'create'));

-- ============================================================
-- CORE SALES PG FUNCTIONS
-- ============================================================

-- Function: Convert Quotation to Sales Order
CREATE OR REPLACE FUNCTION public.convert_quotation_to_so(
    p_quotation_id UUID
) RETURNS UUID AS $$
DECLARE
    v_q public.quotations%ROWTYPE;
    v_so_id UUID;
    v_so_number TEXT;
    v_item RECORD;
    v_so_item_id UUID;
BEGIN
    SELECT * INTO v_q FROM public.quotations WHERE id = p_quotation_id FOR UPDATE;

    IF v_q.status != 'accepted' THEN
        RAISE EXCEPTION 'Quotation must be accepted before converting to Sales Order';
    END IF;

    -- Generate SO doc number
    v_so_number := public.generate_doc_number('sales_order');

    -- Insert SO
    INSERT INTO public.sales_orders (
        so_number, customer_id, quotation_id, order_date, payment_terms_days,
        delivery_terms, subtotal, discount_amount, tax_amount, total_amount,
        currency, status, sales_person_id, created_by
    ) VALUES (
        v_so_number, v_q.customer_id, p_quotation_id, CURRENT_DATE, v_q.payment_terms_days,
        v_q.delivery_terms, v_q.subtotal, v_q.discount_amount, v_q.tax_amount, v_q.total_amount,
        v_q.currency, 'draft', v_q.sales_person_id, auth.uid()
    ) RETURNING id INTO v_so_id;

    -- Copy items & specs
    FOR v_item IN SELECT * FROM public.quotation_items WHERE quotation_id = p_quotation_id LOOP
        INSERT INTO public.sales_order_items (
            sales_order_id, product_id, quotation_item_id, description, quantity,
            uom_id, unit_price, calculated_price, discount_pct, discount_amount,
            tax_rate_id, tax_amount, line_total, is_price_overridden, sort_order
        ) VALUES (
            v_so_id, v_item.product_id, v_item.id, v_item.description, v_item.quantity,
            v_item.uom_id, v_item.unit_price, v_item.calculated_price, v_item.discount_pct, v_item.discount_amount,
            v_item.tax_rate_id, v_item.tax_amount, v_item.line_total, v_item.is_price_overridden, v_item.sort_order
        ) RETURNING id INTO v_so_item_id;

        -- Copy custom spec if exists
        INSERT INTO public.sales_order_item_specs (
            sales_order_item_id, length, width, height, weight, gsm,
            board_type, flute_type, printing_type, num_colors, die_cut, folding_type, glue_type, notes
        )
        SELECT v_so_item_id, length, width, height, weight, gsm,
               board_type, flute_type, printing_type, num_colors, die_cut, folding_type, glue_type, notes
        FROM public.quotation_item_specs
        WHERE quotation_item_id = v_item.id;
    END LOOP;

    -- Update Quotation status to converted
    UPDATE public.quotations SET status = 'converted', updated_at = now() WHERE id = p_quotation_id;

    RETURN v_so_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process Delivery (Atomic Stock Issue + Order Status Update)
CREATE OR REPLACE FUNCTION public.process_delivery(
    p_delivery_id UUID
) RETURNS VOID AS $$
DECLARE
    v_del public.deliveries%ROWTYPE;
    v_item RECORD;
BEGIN
    SELECT * INTO v_del FROM public.deliveries WHERE id = p_delivery_id FOR UPDATE;

    IF v_del.status != 'confirmed' THEN
        RAISE EXCEPTION 'Delivery must be confirmed before processing stock issue';
    END IF;

    FOR v_item IN SELECT * FROM public.delivery_items WHERE delivery_id = p_delivery_id LOOP
        -- Outbound inventory movement from FG warehouse
        PERFORM public.create_inventory_movement(
            v_item.product_id, v_del.warehouse_id, -v_item.quantity,
            v_item.uom_id, 'delivery', 'delivery', p_delivery_id, NULL, 'Sales Order Delivery'
        );

        -- Update Sales Order Item delivered_qty
        UPDATE public.sales_order_items
        SET delivered_qty = delivered_qty + v_item.quantity,
            updated_at = now()
        WHERE id = v_item.sales_order_item_id;
    END LOOP;

    -- Update Delivery status
    UPDATE public.deliveries SET status = 'delivered', delivered_by = auth.uid(), updated_at = now() WHERE id = p_delivery_id;

    -- Update Sales Order status
    UPDATE public.sales_orders SET status = 'delivered', updated_at = now() WHERE id = v_del.sales_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
