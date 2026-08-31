-- ============================================================
-- 004: INVENTORY DOMAIN TABLES, PG FUNCTIONS, RLS, INDEXES
-- ============================================================

-- 1. TRANSACTIONAL BALANCE TABLE (NOT a materialized view)
CREATE TABLE IF NOT EXISTS public.inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    on_hand_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    reserved_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    available_qty DECIMAL(18,4) GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    unit_cost DECIMAL(18,4) NOT NULL DEFAULT 0, -- Weighted Average Cost (WAC)
    total_value DECIMAL(18,2) GENERATED ALWAYS AS (on_hand_qty * unit_cost) STORED,
    last_transaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(item_id, warehouse_id),
    CONSTRAINT non_negative_reserved CHECK (reserved_qty >= 0)
);
COMMENT ON TABLE public.inventory_balances IS 'Real-time transactional inventory balance table per item and warehouse (PRD §21)';

-- 2. IMMUTABLE INVENTORY TRANSACTION LEDGER (Append-only)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    item_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    quantity DECIMAL(18,4) NOT NULL, -- positive = inbound, negative = outbound
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'purchase_receipt', 'material_issue', 'production_receipt',
        'delivery', 'sales_return', 'purchase_return',
        'transfer_in', 'transfer_out', 'adjustment_in', 'adjustment_out',
        'scrap', 'rework_consumption', 'opening_balance'
    )),
    reference_type TEXT NOT NULL, -- 'goods_receipt', 'delivery', 'material_issue', etc.
    reference_id UUID NOT NULL,
    unit_cost DECIMAL(18,4),
    total_cost DECIMAL(18,2),
    running_balance DECIMAL(18,4),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- IMMUTABLE: NO updated_at, NO UPDATE/DELETE allowed
);
COMMENT ON TABLE public.inventory_transactions IS 'Immutable append-only inventory transaction ledger (PRD §22)';

-- 3. STOCK RESERVATIONS
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_item_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES public.products(id),
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    reserved_qty DECIMAL(18,4) NOT NULL CHECK (reserved_qty > 0),
    released_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'partially_released', 'released', 'cancelled')),
    reserved_by UUID REFERENCES public.profiles(id),
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    released_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.stock_reservations IS 'Finished goods stock reservations against Sales Orders (PRD §20)';

-- 4. STOCK COUNTS & ITEMS
CREATE TABLE IF NOT EXISTS public.stock_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_number TEXT NOT NULL UNIQUE,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    count_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'approved', 'cancelled')),
    counted_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.stock_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_count_id UUID NOT NULL REFERENCES public.stock_counts(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.products(id),
    system_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    counted_qty DECIMAL(18,4),
    variance_qty DECIMAL(18,4) GENERATED ALWAYS AS (COALESCE(counted_qty, 0) - system_qty) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. WAREHOUSE TRANSFERS
CREATE TABLE IF NOT EXISTS public.warehouse_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number TEXT NOT NULL UNIQUE,
    source_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    destination_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'in_transit', 'completed', 'cancelled')),
    requested_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    completed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    CONSTRAINT different_warehouses CHECK (source_warehouse_id != destination_warehouse_id)
);

CREATE TABLE IF NOT EXISTS public.warehouse_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES public.warehouse_transfers(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.products(id),
    quantity DECIMAL(18,4) NOT NULL CHECK (quantity > 0),
    uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_inv_balances_item_wh ON public.inventory_balances(item_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_txns_item_wh ON public.inventory_transactions(item_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_txns_date ON public.inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inv_txns_type ON public.inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inv_txns_ref ON public.inventory_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_res_status ON public.stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.warehouse_transfers(status);

-- ENABLE RLS
ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfer_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "inv_balances_select" ON public.inventory_balances FOR SELECT USING (public.has_permission(auth.uid(), 'inventory', 'view'));
CREATE POLICY "inv_txns_select" ON public.inventory_transactions FOR SELECT USING (public.has_permission(auth.uid(), 'inventory', 'view'));
CREATE POLICY "stock_res_select" ON public.stock_reservations FOR SELECT USING (public.has_permission(auth.uid(), 'inventory', 'view') OR public.has_permission(auth.uid(), 'sales_orders', 'view'));
CREATE POLICY "transfers_select" ON public.warehouse_transfers FOR SELECT USING (public.has_permission(auth.uid(), 'warehouse_transfers', 'view'));
CREATE POLICY "transfers_insert" ON public.warehouse_transfers FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'warehouse_transfers', 'create'));
CREATE POLICY "transfers_update" ON public.warehouse_transfers FOR UPDATE USING (public.has_permission(auth.uid(), 'warehouse_transfers', 'edit'));

-- ============================================================
-- CORE INVENTORY PG FUNCTIONS (WAC + ATOMIC MOVEMENTS)
-- ============================================================

-- Function: Create Inventory Movement (Single point of entry for all stock changes)
CREATE OR REPLACE FUNCTION public.create_inventory_movement(
    p_item_id UUID,
    p_warehouse_id UUID,
    p_quantity DECIMAL,
    p_uom_id UUID,
    p_transaction_type TEXT,
    p_reference_type TEXT,
    p_reference_id UUID,
    p_unit_cost DECIMAL DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_txn_id UUID;
    v_balance public.inventory_balances%ROWTYPE;
    v_new_wac DECIMAL(18,4);
    v_new_on_hand DECIMAL(18,4);
    v_actual_cost DECIMAL(18,4);
    v_allow_negative BOOLEAN := false;
BEGIN
    -- Check negative stock config setting
    SELECT (setting_value::TEXT = 'true') INTO v_allow_negative
    FROM public.system_settings WHERE setting_key = 'negative_stock_allowed';

    -- Lock balance row for update
    SELECT * INTO v_balance
    FROM public.inventory_balances
    WHERE item_id = p_item_id AND warehouse_id = p_warehouse_id
    FOR UPDATE;

    -- If no balance row exists, create initial row
    IF NOT FOUND THEN
        INSERT INTO public.inventory_balances (item_id, warehouse_id, on_hand_qty, reserved_qty, uom_id, unit_cost)
        VALUES (p_item_id, p_warehouse_id, 0, 0, p_uom_id, COALESCE(p_unit_cost, 0))
        RETURNING * INTO v_balance;
    END IF;

    -- Negative stock validation for outbound movements
    IF p_quantity < 0 AND NOT v_allow_negative THEN
        IF (v_balance.on_hand_qty + p_quantity) < 0 THEN
            RAISE EXCEPTION 'Insufficient stock in warehouse for item %. On-hand: %, Requested: %',
                p_item_id, v_balance.on_hand_qty, ABS(p_quantity);
        END IF;
    END IF;

    -- Calculate Weighted Average Cost (WAC)
    v_new_on_hand := v_balance.on_hand_qty + p_quantity;

    IF p_quantity > 0 AND p_unit_cost IS NOT NULL AND p_unit_cost > 0 THEN
        -- Inbound: Recalculate WAC
        IF v_new_on_hand > 0 THEN
            v_new_wac := ((v_balance.on_hand_qty * v_balance.unit_cost) + (p_quantity * p_unit_cost)) / v_new_on_hand;
        ELSE
            v_new_wac := p_unit_cost;
        END IF;
        v_actual_cost := p_unit_cost;
    ELSE
        -- Outbound: Keep current WAC
        v_new_wac := v_balance.unit_cost;
        v_actual_cost := v_balance.unit_cost;
    END IF;

    -- 1. Insert immutable transaction row
    INSERT INTO public.inventory_transactions (
        item_id, warehouse_id, quantity, uom_id, transaction_type,
        reference_type, reference_id, unit_cost, total_cost,
        running_balance, notes, created_by
    ) VALUES (
        p_item_id, p_warehouse_id, p_quantity, p_uom_id, p_transaction_type,
        p_reference_type, p_reference_id, v_actual_cost, (ABS(p_quantity) * v_actual_cost),
        v_new_on_hand, p_notes, auth.uid()
    ) RETURNING id INTO v_txn_id;

    -- 2. Update balance table
    UPDATE public.inventory_balances
    SET on_hand_qty = v_new_on_hand,
        unit_cost = v_new_wac,
        last_transaction_at = now(),
        updated_at = now()
    WHERE id = v_balance.id;

    RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Atomic Warehouse Transfer (2 transactions in 1 DB transaction)
CREATE OR REPLACE FUNCTION public.transfer_warehouse_stock(
    p_transfer_id UUID
) RETURNS VOID AS $$
DECLARE
    v_transfer public.warehouse_transfers%ROWTYPE;
    v_item RECORD;
BEGIN
    SELECT * INTO v_transfer FROM public.warehouse_transfers WHERE id = p_transfer_id FOR UPDATE;

    IF v_transfer.status != 'approved' THEN
        RAISE EXCEPTION 'Transfer must be in "approved" status to execute';
    END IF;

    FOR v_item IN SELECT * FROM public.warehouse_transfer_items WHERE transfer_id = p_transfer_id LOOP
        -- Outbound from source warehouse
        PERFORM public.create_inventory_movement(
            v_item.item_id, v_transfer.source_warehouse_id, -v_item.quantity,
            v_item.uom_id, 'transfer_out', 'warehouse_transfer', p_transfer_id, NULL, 'Warehouse Transfer Out'
        );

        -- Inbound to destination warehouse
        PERFORM public.create_inventory_movement(
            v_item.item_id, v_transfer.destination_warehouse_id, v_item.quantity,
            v_item.uom_id, 'transfer_in', 'warehouse_transfer', p_transfer_id, NULL, 'Warehouse Transfer In'
        );
    END LOOP;

    UPDATE public.warehouse_transfers
    SET status = 'completed', completed_by = auth.uid(), updated_at = now()
    WHERE id = p_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
