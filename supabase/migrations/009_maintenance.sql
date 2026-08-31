-- ============================================================
-- 009: MAINTENANCE & ASSETS TABLES, PG FUNCTIONS, RLS
-- ============================================================

-- 1. MAINTENANCE SCHEDULES & WORK ORDERS
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('days', 'hours')),
    frequency_value DECIMAL(10,2) NOT NULL CHECK (frequency_value > 0),
    last_performed_date DATE,
    next_due_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.maintenance_schedules IS 'Preventive Maintenance Schedules (PRD §70)';

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_number TEXT NOT NULL UNIQUE,
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('preventive', 'breakdown', 'calibration')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_technician_id UUID REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    downtime_hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(18,2) DEFAULT 0,
    spare_parts_cost DECIMAL(18,2) DEFAULT 0,
    total_cost DECIMAL(18,2) GENERATED ALWAYS AS (labor_cost + spare_parts_cost) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.work_orders IS 'Maintenance Work Orders (PRD §71)';

CREATE TABLE IF NOT EXISTS public.work_order_spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    spare_part_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_cost DECIMAL(18,4) DEFAULT 0,
    total_cost DECIMAL(18,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DOWNTIME LOGS
CREATE TABLE IF NOT EXISTS public.downtime_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE RESTRICT,
    work_order_id UUID REFERENCES public.work_orders(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_hours DECIMAL(10,2),
    reason_category TEXT NOT NULL, -- 'electrical', 'mechanical', 'operator_error', 'raw_material_delay'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 3. FIXED ASSETS & DEPRECIATION
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL, -- 'machinery', 'vehicles', 'buildings', 'it_equipment'
    purchase_date DATE NOT NULL,
    purchase_value DECIMAL(18,2) NOT NULL CHECK (purchase_value > 0),
    salvage_value DECIMAL(18,2) DEFAULT 0,
    useful_life_years INTEGER NOT NULL CHECK (useful_life_years > 0),
    depreciation_method TEXT NOT NULL DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line', 'declining_balance')),
    current_value DECIMAL(18,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.asset_depreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- '2026-08'
    depreciation_amount DECIMAL(18,2) NOT NULL CHECK (depreciation_amount > 0),
    accumulated_depreciation DECIMAL(18,2) NOT NULL,
    book_value DECIMAL(18,2) NOT NULL,
    journal_entry_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_wo_machine ON public.work_orders(machine_id);
CREATE INDEX IF NOT EXISTS idx_wo_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_downtime_machine ON public.downtime_logs(machine_id);

-- ENABLE RLS
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downtime_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_depreciations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "maint_select" ON public.maintenance_schedules FOR SELECT USING (public.has_permission(auth.uid(), 'maintenance', 'view'));
CREATE POLICY "wo_select" ON public.work_orders FOR SELECT USING (public.has_permission(auth.uid(), 'maintenance', 'view'));
CREATE POLICY "wo_insert" ON public.work_orders FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'maintenance', 'create'));
CREATE POLICY "wo_update" ON public.work_orders FOR UPDATE USING (public.has_permission(auth.uid(), 'maintenance', 'edit'));

-- ============================================================
-- CORE MAINTENANCE PG FUNCTIONS
-- ============================================================

-- Function: Consume Spare Parts for Work Order (Deducts from Spare Parts Warehouse)
CREATE OR REPLACE FUNCTION public.consume_work_order_spare_parts(
    p_work_order_id UUID,
    p_spare_part_id UUID,
    p_quantity DECIMAL,
    p_uom_id UUID,
    p_spare_parts_warehouse_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Outbound inventory movement from Spare Parts Warehouse
    PERFORM public.create_inventory_movement(
        p_spare_part_id, p_spare_parts_warehouse_id, -p_quantity,
        p_uom_id, 'material_issue', 'work_order', p_work_order_id, NULL, 'Maintenance Spare Part Consumption'
    );

    -- Insert spare part line
    INSERT INTO public.work_order_spare_parts (work_order_id, spare_part_id, quantity, uom_id)
    VALUES (p_work_order_id, p_spare_part_id, p_quantity, p_uom_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete Work Order & Restore Machine Operational Status
CREATE OR REPLACE FUNCTION public.complete_work_order(
    p_work_order_id UUID,
    p_downtime_hours DECIMAL
) RETURNS VOID AS $$
DECLARE
    v_wo public.work_orders%ROWTYPE;
BEGIN
    SELECT * INTO v_wo FROM public.work_orders WHERE id = p_work_order_id FOR UPDATE;

    -- Update Work Order
    UPDATE public.work_orders
    SET status = 'completed',
        end_time = now(),
        downtime_hours = p_downtime_hours,
        updated_at = now()
    WHERE id = p_work_order_id;

    -- Restore Machine status to operational
    UPDATE public.machines
    SET status = 'operational',
        last_maintenance_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = v_wo.machine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
