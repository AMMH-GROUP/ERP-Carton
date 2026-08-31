-- ============================================================
-- 008: FINANCE, TREASURY, EXPENSES TABLES, PG FUNCTIONS, RLS, SEED
-- ============================================================

-- 1. ACCOUNT TYPES & CHART OF ACCOUNTS
CREATE TABLE IF NOT EXISTS public.account_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'contra')),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    account_type_id UUID NOT NULL REFERENCES public.account_types(id) ON DELETE RESTRICT,
    parent_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    level INTEGER NOT NULL DEFAULT 1,
    is_header BOOLEAN NOT NULL DEFAULT false, -- Header accounts cannot accept postings
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.chart_of_accounts IS 'Double-entry Chart of Accounts hierarchy (PRD §64)';

-- 2. ACCOUNTING PERIODS & JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS public.accounting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL UNIQUE, -- '2026-08'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    closed_by UUID REFERENCES public.profiles(id),
    closed_at TIMESTAMPTZ,
    reopened_by UUID REFERENCES public.profiles(id),
    reopened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    CONSTRAINT valid_period_dates CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number TEXT NOT NULL UNIQUE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_id UUID NOT NULL REFERENCES public.accounting_periods(id) ON DELETE RESTRICT,
    reference_type TEXT, -- 'sales_invoice', 'purchase_invoice', 'payment', 'expense', 'manual'
    reference_id UUID,
    description TEXT,
    is_posted BOOLEAN NOT NULL DEFAULT false,
    is_reversed BOOLEAN NOT NULL DEFAULT false,
    reversal_of UUID REFERENCES public.journal_entries(id),
    total_debit DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(18,2) NOT NULL DEFAULT 0,
    posted_by UUID REFERENCES public.profiles(id),
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    CONSTRAINT double_entry_balance CHECK (total_debit = total_credit)
);
COMMENT ON TABLE public.journal_entries IS 'Double-entry General Ledger Journal Entries (PRD §65)';

CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    debit DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    description TEXT,
    cost_center TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_line_amount CHECK ((debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0))
);

-- 3. TREASURY (CASHBOXES & BANK ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.cash_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    gl_account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    opening_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    branch TEXT,
    account_number TEXT,
    iban TEXT,
    swift_code TEXT,
    gl_account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
    opening_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.cash_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_account_id UUID NOT NULL REFERENCES public.cash_accounts(id) ON DELETE RESTRICT,
    closing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    system_balance DECIMAL(18,2) NOT NULL,
    physical_balance DECIMAL(18,2) NOT NULL,
    variance DECIMAL(18,2) GENERATED ALWAYS AS (physical_balance - system_balance) STORED,
    variance_reason TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
    approval_id UUID REFERENCES public.approvals(id),
    closed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    UNIQUE(cash_account_id, closing_date)
);

-- 4. EXPENSES
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    gl_account_id UUID REFERENCES public.chart_of_accounts(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number TEXT NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id),
    category_id UUID NOT NULL REFERENCES public.expense_categories(id),
    amount DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    total_amount DECIMAL(18,2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department TEXT,
    description TEXT NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'other')),
    cash_account_id UUID REFERENCES public.cash_accounts(id),
    bank_account_id UUID REFERENCES public.bank_accounts(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'paid', 'cancelled')),
    approval_id UUID REFERENCES public.approvals(id),
    journal_entry_id UUID REFERENCES public.journal_entries(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.expenses IS 'Expense claims with threshold-based approval (PRD §62-63)';

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_coa_code ON public.chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_je_period ON public.journal_entries(period_id);
CREATE INDEX IF NOT EXISTS idx_je_ref ON public.journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON public.expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);

-- ENABLE RLS
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "account_types_select" ON public.account_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "coa_select" ON public.chart_of_accounts FOR SELECT USING (public.has_permission(auth.uid(), 'chart_of_accounts', 'view'));
CREATE POLICY "coa_all" ON public.chart_of_accounts FOR ALL USING (public.has_permission(auth.uid(), 'chart_of_accounts', 'edit'));

CREATE POLICY "je_select" ON public.journal_entries FOR SELECT USING (public.has_permission(auth.uid(), 'journal_entries', 'view') OR public.has_permission(auth.uid(), 'general_ledger', 'view'));
CREATE POLICY "je_insert" ON public.journal_entries FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'journal_entries', 'create'));

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT USING (public.has_permission(auth.uid(), 'expenses', 'view') OR employee_id = auth.uid());
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'expenses', 'create') OR employee_id = auth.uid());

-- SEED ACCOUNT TYPES & COA
INSERT INTO public.account_types (code, name_ar, name_en, normal_balance) VALUES
('asset', 'الأصول', 'Assets', 'debit'),
('liability', 'الخصوم والالتزامات', 'Liabilities', 'credit'),
('equity', 'حقوق الملكية', 'Equity', 'credit'),
('revenue', 'الإيرادات', 'Revenues', 'credit'),
('expense', 'المصروفات', 'Expenses', 'debit')
ON CONFLICT (code) DO NOTHING;

-- SEED DEFAULT CHART OF ACCOUNTS (Top Level Headers)
DO $$
DECLARE
    v_asset_id UUID;
    v_liab_id UUID;
    v_eq_id UUID;
    v_rev_id UUID;
    v_exp_id UUID;
BEGIN
    SELECT id INTO v_asset_id FROM public.account_types WHERE code = 'asset';
    SELECT id INTO v_liab_id FROM public.account_types WHERE code = 'liability';
    SELECT id INTO v_eq_id FROM public.account_types WHERE code = 'equity';
    SELECT id INTO v_rev_id FROM public.account_types WHERE code = 'revenue';
    SELECT id INTO v_exp_id FROM public.account_types WHERE code = 'expense';

    INSERT INTO public.chart_of_accounts (account_code, name_ar, name_en, account_type_id, level, is_header) VALUES
    ('1000', 'الأصول المتداولة', 'Current Assets', v_asset_id, 1, true),
    ('1100', 'النقدية بالخزينة والبنوك', 'Cash & Bank Balances', v_asset_id, 2, true),
    ('1200', 'العملاء والذمم المدينة', 'Accounts Receivable', v_asset_id, 2, false),
    ('1300', 'المخزون', 'Inventory Accounts', v_asset_id, 2, false),
    ('2000', 'الخصوم المتداولة', 'Current Liabilities', v_liab_id, 1, true),
    ('2100', 'الموردون والذمم الدائنة', 'Accounts Payable', v_liab_id, 2, false),
    ('2200', 'ضريبة القيمة المضافة مستحقة السداد', 'VAT Payable', v_liab_id, 2, false),
    ('3000', 'حقوق الملكية', 'Equity', v_eq_id, 1, true),
    ('4000', 'إيرادات المبيعات', 'Sales Revenue', v_rev_id, 1, false),
    ('5000', 'تكلفة البضاعة المباعة (COGS)', 'Cost of Goods Sold', v_exp_id, 1, false),
    ('6000', 'المصروفات العمومية والإدارية', 'General & Administrative Expenses', v_exp_id, 1, false)
    ON CONFLICT (account_code) DO NOTHING;
END $$;

-- ============================================================
-- CORE JOURNAL & POSTING PG FUNCTIONS
-- ============================================================

-- Function: Create Double-Entry Journal Entry with Balance Validation
CREATE OR REPLACE FUNCTION public.create_journal_entry(
    p_period_id UUID,
    p_description TEXT,
    p_reference_type TEXT,
    p_reference_id UUID,
    p_lines JSONB -- Array of { account_id, debit, credit, description }
) RETURNS UUID AS $$
DECLARE
    v_je_id UUID;
    v_entry_number TEXT;
    v_total_debit DECIMAL(18,2) := 0;
    v_total_credit DECIMAL(18,2) := 0;
    v_line JSONB;
BEGIN
    -- 1. Calculate sum of debits and credits
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        v_total_debit := v_total_debit + COALESCE((v_line->>'debit')::DECIMAL, 0);
        v_total_credit := v_total_credit + COALESCE((v_line->>'credit')::DECIMAL, 0);
    END LOOP;

    -- 2. Double-entry balance check
    IF v_total_debit != v_total_credit THEN
        RAISE EXCEPTION 'Journal Entry Imbalance: Total Debits (%) must equal Total Credits (%)',
            v_total_debit, v_total_credit;
    END IF;

    -- 3. Generate JE doc number
    v_entry_number := public.generate_doc_number('journal_entry');

    -- 4. Insert Journal Entry Header
    INSERT INTO public.journal_entries (
        entry_number, entry_date, period_id, reference_type, reference_id,
        description, total_debit, total_credit, created_by
    ) VALUES (
        v_entry_number, CURRENT_DATE, p_period_id, p_reference_type, p_reference_id,
        p_description, v_total_debit, v_total_credit, auth.uid()
    ) RETURNING id INTO v_je_id;

    -- 5. Insert Journal Lines
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        INSERT INTO public.journal_lines (
            journal_entry_id, account_id, debit, credit, description
        ) VALUES (
            v_je_id,
            (v_line->>'account_id')::UUID,
            COALESCE((v_line->>'debit')::DECIMAL, 0),
            COALESCE((v_line->>'credit')::DECIMAL, 0),
            COALESCE(v_line->>'description', p_description)
        );
    END LOOP;

    RETURN v_je_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
