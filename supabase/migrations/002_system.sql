-- ============================================================
-- 002: SYSTEM & INFRASTRUCTURE TABLES
-- ============================================================

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    category TEXT,
    description_en TEXT,
    description_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);
COMMENT ON TABLE public.system_settings IS 'Global system configuration key-value store';

-- Audit Logs (IMMUTABLE)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    module TEXT,
    record_type TEXT,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.audit_logs IS 'Immutable centralized audit trail for sensitive actions';

-- Approvals Engine
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_type TEXT NOT NULL,
    reference_type TEXT NOT NULL,
    reference_id UUID NOT NULL,
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    approver_id UUID REFERENCES public.profiles(id),
    delegate_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    comments TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT no_self_approval CHECK (requester_id IS DISTINCT FROM approver_id)
);
COMMENT ON TABLE public.approvals IS 'Universal reusable approval workflow engine';

-- Approval Delegations
CREATE TABLE IF NOT EXISTS public.approval_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID NOT NULL REFERENCES public.profiles(id),
    delegate_id UUID NOT NULL REFERENCES public.profiles(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approval_types TEXT[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    CONSTRAINT no_self_delegation CHECK (delegator_id != delegate_id),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);
COMMENT ON TABLE public.approval_delegations IS 'Temporary delegations of approval authority';

-- In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_en TEXT,
    title_ar TEXT,
    body_en TEXT,
    body_ar TEXT,
    notification_type TEXT,
    reference_type TEXT,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notifications IS 'User notification queue';

-- Document Sequences (Auto-numbering)
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL,
    year_format TEXT NOT NULL DEFAULT 'YYYY',
    next_number INTEGER NOT NULL DEFAULT 1,
    pad_length INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.document_sequences IS 'Configurable automatic document sequence counters';

-- Attachments (Polymorphic Storage references)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.attachments IS 'Polymorphic file attachment records referencing Supabase Storage';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_action ON public.audit_logs(module, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON public.approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON public.approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_reference ON public.approvals(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_delegator ON public.approval_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON public.attachments(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
