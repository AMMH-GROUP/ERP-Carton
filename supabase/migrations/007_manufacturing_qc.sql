-- ============================================================
-- 007: MANUFACTURING, QC, AND OVERHEAD TABLES, PG FUNCTIONS, RLS
-- ============================================================

-- 1. BOMS / FORMULAS
CREATE TABLE IF NOT EXISTS public.boms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_code TEXT NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    version INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    description TEXT,
    calculation_type TEXT NOT NULL CHECK (calculation_type IN ('fixed', 'per_unit', 'dimension_based', 'weight_based')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    UNIQUE(product_id, version)
);
COMMENT ON TABLE public.boms IS 'Bill of Materials / Production Formulas (PRD §26)';

CREATE TABLE IF NOT EXISTS public.bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id UUID NOT NULL REFERENCES public.boms(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    description TEXT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    waste_pct DECIMAL(5,2) DEFAULT 0,
    is_optional BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PRODUCTION ORDERS & SPECS
CREATE TABLE IF NOT EXISTS public.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mo_number TEXT NOT NULL UNIQUE,
    sales_order_id UUID REFERENCES public.sales_orders(id),
    sales_order_item_id UUID REFERENCES public.sales_order_items(id),
    customer_id UUID REFERENCES public.customers(id),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    bom_id UUID REFERENCES public.boms(id),
    planned_qty DECIMAL(18,4) NOT NULL CHECK (planned_qty > 0),
    produced_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    scrap_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    rework_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    machine_id UUID REFERENCES public.machines(id),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    planned_start TIMESTAMPTZ,
    planned_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    estimated_cost DECIMAL(18,2) DEFAULT 0,
    actual_cost DECIMAL(18,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'planned', 'released', 'in_progress', 'paused',
        'completed', 'qc_pending', 'approved', 'closed', 'cancelled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.production_orders IS 'Manufacturing Production Orders (PRD §24)';

CREATE TABLE IF NOT EXISTS public.production_order_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE UNIQUE,
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

CREATE TABLE IF NOT EXISTS public.production_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.products(id),
    bom_item_id UUID REFERENCES public.bom_items(id),
    required_qty DECIMAL(18,4) NOT NULL CHECK (required_qty > 0),
    issued_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    consumed_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    returned_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    shortage_qty DECIMAL(18,4) GENERATED ALWAYS AS (GREATEST(required_qty - issued_qty, 0)) STORED,
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    estimated_unit_cost DECIMAL(18,4) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MATERIAL REQUESTS & ISSUES (RM -> WIP)
CREATE TABLE IF NOT EXISTS public.material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mr_number TEXT NOT NULL UNIQUE,
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE RESTRICT,
    warehouse_id UUID REFERENCES public.warehouses(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'partially_issued', 'issued', 'cancelled')),
    requested_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
    production_material_id UUID REFERENCES public.production_materials(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    requested_qty DECIMAL(18,4) NOT NULL CHECK (requested_qty > 0),
    approved_qty DECIMAL(18,4),
    issued_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_number TEXT NOT NULL UNIQUE,
    material_request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE RESTRICT,
    source_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    wip_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'cancelled')),
    issued_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_issue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_issue_id UUID NOT NULL REFERENCES public.material_issues(id) ON DELETE CASCADE,
    material_request_item_id UUID REFERENCES public.material_request_items(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_cost DECIMAL(18,4) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PRODUCTION LOGGING & SCRAP
CREATE TABLE IF NOT EXISTS public.production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.profiles(id),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    machine_id UUID REFERENCES public.machines(id),
    produced_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    scrap_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    waste_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    rework_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    machine_hours DECIMAL(10,2) DEFAULT 0,
    downtime_hours DECIMAL(10,2) DEFAULT 0,
    downtime_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.production_logs IS 'Operator daily production & downtime log (PRD §31)';

CREATE TABLE IF NOT EXISTS public.scrap_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES public.production_orders(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    reason TEXT NOT NULL,
    cost DECIMAL(18,2) DEFAULT 0,
    recorded_by UUID REFERENCES public.profiles(id),
    scrap_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. QUALITY CONTROL & REWORK
CREATE TABLE IF NOT EXISTS public.qc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_number TEXT NOT NULL UNIQUE,
    reference_type TEXT NOT NULL CHECK (reference_type IN ('production_order', 'goods_receipt', 'sales_return')),
    reference_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('full', 'sampling')),
    inspected_qty DECIMAL(18,4) NOT NULL CHECK (inspected_qty > 0),
    passed_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    failed_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    rework_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    scrap_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    result TEXT CHECK (result IN ('pending', 'passed', 'partial', 'failed', 'rework', 'scrap')),
    inspector_id UUID REFERENCES public.profiles(id),
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.qc_inspections IS 'Quality control inspection records (PRD §33)';

CREATE TABLE IF NOT EXISTS public.qc_inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_inspection_id UUID NOT NULL REFERENCES public.qc_inspections(id) ON DELETE CASCADE,
    parameter_name TEXT NOT NULL, -- 'dimensions', 'gsm', 'bursting_strength', 'printing'
    expected_value TEXT,
    actual_value TEXT,
    result TEXT NOT NULL CHECK (result IN ('pass', 'fail', 'acceptable')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rework_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rework_number TEXT NOT NULL UNIQUE,
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE RESTRICT,
    qc_inspection_id UUID REFERENCES public.qc_inspections(id),
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    machine_id UUID REFERENCES public.machines(id),
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    material_cost DECIMAL(18,2) DEFAULT 0,
    labor_cost DECIMAL(18,2) DEFAULT 0,
    total_cost DECIMAL(18,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. OVERHEAD CATEGORIES & ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.overhead_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    allocation_method TEXT NOT NULL CHECK (allocation_method IN ('machine_hours', 'production_quantity', 'material_cost', 'direct_labor', 'manual')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.overhead_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period TEXT NOT NULL, -- '2026-08'
    overhead_category_id UUID NOT NULL REFERENCES public.overhead_categories(id),
    production_order_id UUID REFERENCES public.production_orders(id),
    allocated_amount DECIMAL(18,2) NOT NULL CHECK (allocated_amount >= 0),
    allocation_basis TEXT,
    allocation_value DECIMAL(18,4),
    journal_entry_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_mo_status ON public.production_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_product ON public.production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_mr_mo ON public.material_requests(production_order_id);
CREATE INDEX IF NOT EXISTS idx_qc_ref ON public.qc_inspections(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_qc_result ON public.qc_inspections(result);

-- ENABLE RLS
ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rework_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overhead_categories ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "boms_select" ON public.boms FOR SELECT USING (public.has_permission(auth.uid(), 'bom', 'view'));
CREATE POLICY "boms_all" ON public.boms FOR ALL USING (public.has_permission(auth.uid(), 'bom', 'edit'));

CREATE POLICY "mo_select" ON public.production_orders FOR SELECT USING (public.has_permission(auth.uid(), 'production_orders', 'view'));
CREATE POLICY "mo_insert" ON public.production_orders FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'production_orders', 'create'));
CREATE POLICY "mo_update" ON public.production_orders FOR UPDATE USING (public.has_permission(auth.uid(), 'production_orders', 'edit'));

CREATE POLICY "mr_select" ON public.material_requests FOR SELECT USING (public.has_permission(auth.uid(), 'material_requests', 'view'));
CREATE POLICY "mr_insert" ON public.material_requests FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'material_requests', 'create'));

CREATE POLICY "pl_select" ON public.production_logs FOR SELECT USING (public.has_permission(auth.uid(), 'production_logs', 'view'));
CREATE POLICY "pl_insert" ON public.production_logs FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'production_logs', 'create'));

CREATE POLICY "qc_select" ON public.qc_inspections FOR SELECT USING (public.has_permission(auth.uid(), 'qc_inspections', 'view'));
CREATE POLICY "qc_insert" ON public.qc_inspections FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'qc_inspections', 'create'));

-- ============================================================
-- CORE MANUFACTURING & QC PG FUNCTIONS
-- ============================================================

-- Function: Material Issue execution (RM Warehouse -> WIP Warehouse)
CREATE OR REPLACE FUNCTION public.issue_materials_to_wip(
    p_material_issue_id UUID
) RETURNS VOID AS $$
DECLARE
    v_issue public.material_issues%ROWTYPE;
    v_item RECORD;
BEGIN
    SELECT * INTO v_issue FROM public.material_issues WHERE id = p_material_issue_id FOR UPDATE;

    IF v_issue.status != 'draft' THEN
        RAISE EXCEPTION 'Material Issue is already processed';
    END IF;

    FOR v_item IN SELECT * FROM public.material_issue_items WHERE material_issue_id = p_material_issue_id LOOP
        -- Outbound from RM Warehouse
        PERFORM public.create_inventory_movement(
            v_item.product_id, v_issue.source_warehouse_id, -v_item.quantity,
            v_item.uom_id, 'material_issue', 'material_issue', p_material_issue_id, NULL, 'Material Issue RM Out'
        );

        -- Inbound to WIP Warehouse
        PERFORM public.create_inventory_movement(
            v_item.product_id, v_issue.wip_warehouse_id, v_item.quantity,
            v_item.uom_id, 'material_issue', 'material_issue', p_material_issue_id, v_item.unit_cost, 'Material Issue WIP In'
        );
    END LOOP;

    UPDATE public.material_issues SET status = 'issued', created_at = now() WHERE id = p_material_issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process QC Pass (WIP Warehouse -> Finished Goods Warehouse Hard Gate)
CREATE OR REPLACE FUNCTION public.process_qc_pass(
    p_qc_inspection_id UUID,
    p_fg_warehouse_id UUID
) RETURNS VOID AS $$
DECLARE
    v_qc public.qc_inspections%ROWTYPE;
    v_mo public.production_orders%ROWTYPE;
BEGIN
    SELECT * INTO v_qc FROM public.qc_inspections WHERE id = p_qc_inspection_id FOR UPDATE;

    IF v_qc.result NOT IN ('passed', 'partial') THEN
        RAISE EXCEPTION 'QC Inspection must be passed or partial pass to gate stock into FG warehouse';
    END IF;

    IF v_qc.reference_type = 'production_order' THEN
        SELECT * INTO v_mo FROM public.production_orders WHERE id = v_qc.reference_id;

        -- Inbound to FG Warehouse (FG stock is ONLY created after QC pass)
        PERFORM public.create_inventory_movement(
            v_qc.product_id, p_fg_warehouse_id, v_qc.passed_qty,
            v_mo.product_id, 'production_receipt', 'qc_inspection', p_qc_inspection_id, v_mo.estimated_cost, 'QC Passed FG Receipt'
        );

        -- Update Production Order status
        UPDATE public.production_orders
        SET produced_qty = produced_qty + v_qc.passed_qty,
            status = 'approved',
            updated_at = now()
        WHERE id = v_mo.id;
    END IF;

    UPDATE public.qc_inspections SET status = 'completed', updated_at = now() WHERE id = p_qc_inspection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
