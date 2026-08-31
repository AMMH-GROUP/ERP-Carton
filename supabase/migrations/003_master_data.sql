-- ============================================================
-- 003: MASTER DATA TABLES, CONSTRAINTS, INDEXES, RLS, SEED DATA
-- ============================================================

-- 1. CUSTOMERS & CONTACTS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_number TEXT,
    payment_terms_days INTEGER DEFAULT 30,
    credit_limit DECIMAL(18,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.customers IS 'Customer master data (PRD §11)';

CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    position TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.customer_contacts IS 'Customer contact persons';

-- 2. SUPPLIERS & APPROVED SUPPLIER PRODUCTS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_number TEXT,
    payment_terms_days INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.suppliers IS 'Supplier master data (PRD §42)';

-- 3. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.product_categories IS 'Hierarchical product categories';

-- 4. UNITS OF MEASURE (UOM)
CREATE TABLE IF NOT EXISTS public.units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    uom_type TEXT CHECK (uom_type IN ('quantity', 'weight', 'length', 'area')),
    is_base BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.units_of_measure IS 'Units of measure master (PCS, KG, Meter, Sqm, etc.)';

CREATE TABLE IF NOT EXISTS public.uom_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    to_uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    conversion_factor DECIMAL(18,6) NOT NULL CHECK (conversion_factor > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    UNIQUE(from_uom_id, to_uom_id)
);
COMMENT ON TABLE public.uom_conversions IS 'UOM conversion factors';

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category_id UUID REFERENCES public.product_categories(id),
    product_type TEXT NOT NULL CHECK (product_type IN ('raw_material', 'finished_good', 'semi_finished', 'spare_part', 'packaging')),
    primary_uom_id UUID NOT NULL REFERENCES public.units_of_measure(id),
    secondary_uom_id UUID REFERENCES public.units_of_measure(id),
    qc_required BOOLEAN NOT NULL DEFAULT false,
    min_stock_level DECIMAL(18,4) DEFAULT 0,
    reorder_point DECIMAL(18,4) DEFAULT 0,
    costing_method TEXT NOT NULL DEFAULT 'weighted_average' CHECK (costing_method IN ('weighted_average', 'fifo', 'standard')),
    standard_cost DECIMAL(18,4) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.products IS 'Product master data (PRD §12)';

CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    lead_time_days INTEGER DEFAULT 7,
    min_order_qty DECIMAL(18,4) DEFAULT 1,
    unit_price DECIMAL(18,4) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    is_preferred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    UNIQUE(supplier_id, product_id)
);
COMMENT ON TABLE public.supplier_products IS 'Approved supplier-product mapping (PRD §42)';

-- 6. PRODUCT SPECIFICATIONS
CREATE TABLE IF NOT EXISTS public.product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.product_specifications IS 'Standard specifications for products (PRD §13)';

-- 7. PRICING RULES & COMPONENTS
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    product_id UUID REFERENCES public.products(id),
    category_id UUID REFERENCES public.product_categories(id),
    profit_margin_pct DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    min_quantity DECIMAL(18,4) DEFAULT 0,
    max_quantity DECIMAL(18,4),
    effective_from DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.pricing_rules IS 'Per-product configurable pricing rules (PRD §15)';

CREATE TABLE IF NOT EXISTS public.pricing_rule_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_rule_id UUID NOT NULL REFERENCES public.pricing_rules(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL CHECK (component_type IN ('raw_material', 'labor', 'machine', 'waste', 'overhead', 'other')),
    calculation_method TEXT NOT NULL CHECK (calculation_method IN ('fixed_amount', 'per_unit', 'per_kg', 'per_sqm', 'percentage_of_material', 'percentage_of_total')),
    value DECIMAL(18,4) NOT NULL DEFAULT 0,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.pricing_rule_components IS 'Cost components forming the pricing formula';

-- 8. TAX RATES
CREATE TABLE IF NOT EXISTS public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    rate DECIMAL(5,2) NOT NULL DEFAULT 14.00,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.tax_rates IS 'Tax rate configuration (PRD §5)';

-- 9. WAREHOUSES & TYPES
CREATE TABLE IF NOT EXISTS public.warehouse_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);
COMMENT ON TABLE public.warehouse_types IS 'Types of warehouses (RM, WIP, FG, Spare Parts, Packaging)';

CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    warehouse_type_id UUID NOT NULL REFERENCES public.warehouse_types(id),
    location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.warehouses IS 'Warehouse master data (PRD §21)';

-- 10. MACHINES
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    machine_type TEXT,
    warehouse_id UUID REFERENCES public.warehouses(id),
    capacity_per_hour DECIMAL(18,2) DEFAULT 0,
    capacity_uom_id UUID REFERENCES public.units_of_measure(id),
    status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'under_maintenance', 'out_of_service', 'retired')),
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_frequency_days INTEGER,
    maintenance_frequency_hours DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.machines IS 'Factory machines master data (PRD §69)';

-- INDEXES FOR MASTER DATA
CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON public.warehouses(warehouse_type_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);

-- ENABLE RLS ON ALL MASTER DATA TABLES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uom_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rule_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR MASTER DATA
CREATE POLICY "customers_select" ON public.customers FOR SELECT USING (public.has_permission(auth.uid(), 'customers', 'view'));
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'customers', 'create'));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (public.has_permission(auth.uid(), 'customers', 'edit'));

CREATE POLICY "customer_contacts_select" ON public.customer_contacts FOR SELECT USING (public.has_permission(auth.uid(), 'customers', 'view'));
CREATE POLICY "customer_contacts_all" ON public.customer_contacts FOR ALL USING (public.has_permission(auth.uid(), 'customers', 'edit'));

CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT USING (public.has_permission(auth.uid(), 'suppliers', 'view'));
CREATE POLICY "suppliers_insert" ON public.suppliers FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'suppliers', 'create'));
CREATE POLICY "suppliers_update" ON public.suppliers FOR UPDATE USING (public.has_permission(auth.uid(), 'suppliers', 'edit'));

CREATE POLICY "supplier_products_select" ON public.supplier_products FOR SELECT USING (public.has_permission(auth.uid(), 'suppliers', 'view'));
CREATE POLICY "supplier_products_all" ON public.supplier_products FOR ALL USING (public.has_permission(auth.uid(), 'suppliers', 'edit'));

CREATE POLICY "product_categories_select" ON public.product_categories FOR SELECT USING (public.has_permission(auth.uid(), 'product_categories', 'view') OR public.has_permission(auth.uid(), 'products', 'view'));
CREATE POLICY "product_categories_all" ON public.product_categories FOR ALL USING (public.has_permission(auth.uid(), 'product_categories', 'edit'));

CREATE POLICY "uom_select" ON public.units_of_measure FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "uom_all" ON public.units_of_measure FOR ALL USING (public.has_permission(auth.uid(), 'uom', 'edit'));

CREATE POLICY "products_select" ON public.products FOR SELECT USING (public.has_permission(auth.uid(), 'products', 'view'));
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'products', 'create'));
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (public.has_permission(auth.uid(), 'products', 'edit'));

CREATE POLICY "product_specs_select" ON public.product_specifications FOR SELECT USING (public.has_permission(auth.uid(), 'products', 'view'));
CREATE POLICY "product_specs_all" ON public.product_specifications FOR ALL USING (public.has_permission(auth.uid(), 'products', 'edit'));

CREATE POLICY "pricing_rules_select" ON public.pricing_rules FOR SELECT USING (public.has_permission(auth.uid(), 'pricing', 'view'));
CREATE POLICY "pricing_rules_all" ON public.pricing_rules FOR ALL USING (public.has_permission(auth.uid(), 'pricing', 'edit'));

CREATE POLICY "tax_rates_select" ON public.tax_rates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "tax_rates_all" ON public.tax_rates FOR ALL USING (public.has_permission(auth.uid(), 'system_settings', 'edit'));

CREATE POLICY "warehouses_select" ON public.warehouses FOR SELECT USING (public.has_permission(auth.uid(), 'warehouses', 'view') OR public.has_permission(auth.uid(), 'inventory', 'view'));
CREATE POLICY "warehouses_all" ON public.warehouses FOR ALL USING (public.has_permission(auth.uid(), 'warehouses', 'edit'));

CREATE POLICY "machines_select" ON public.machines FOR SELECT USING (public.has_permission(auth.uid(), 'machines', 'view') OR public.has_permission(auth.uid(), 'production_orders', 'view'));
CREATE POLICY "machines_all" ON public.machines FOR ALL USING (public.has_permission(auth.uid(), 'machines', 'edit'));

-- SEED MASTER DATA
INSERT INTO public.warehouse_types (code, name_ar, name_en) VALUES
('raw_materials', 'مخزن المواد الخام', 'Raw Materials Warehouse'),
('wip', 'مخزن تحت التشغيل (WIP)', 'Work In Progress Warehouse'),
('finished_goods', 'مخزن المنتج التام', 'Finished Goods Warehouse'),
('spare_parts', 'مخزن قطع الغيار', 'Spare Parts Warehouse'),
('packaging', 'مخزن مواد التعبئة والتغليف', 'Packaging Materials Warehouse')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.units_of_measure (code, name_ar, name_en, uom_type, is_base) VALUES
('PCS', 'قطعة', 'Pieces', 'quantity', true),
('KG', 'كيلوجرام', 'Kilograms', 'weight', true),
('TON', 'طن', 'Tons', 'weight', false),
('M', 'متر طولي', 'Meters', 'length', true),
('SQM', 'متر مربع', 'Square Meters', 'area', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.tax_rates (code, name_ar, name_en, rate, is_default) VALUES
('VAT14', 'ضريبة القيمة المضافة 14%', 'Value Added Tax 14%', 14.00, true),
('ZERO', 'ضريبة صفرية (تصدير)', 'Zero Rate (Export)', 0.00, false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.product_categories (code, name_ar, name_en) VALUES
('RM_PAPER', 'ورق خام', 'Raw Paper Rolls'),
('RM_STARCH', 'نشا ومواد لاصقة', 'Starch & Adhesives'),
('FG_BOX', 'صناديق كرتون مضلع', 'Corrugated Boxes'),
('FG_SHEET', 'ألوة كرتون (شيت)', 'Corrugated Sheets'),
('SPARE', 'قطع غيار ماكينات', 'Machine Spare Parts')
ON CONFLICT (code) DO NOTHING;
