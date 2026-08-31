-- ============================================================
-- 010: CORE POSTGRESQL FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Check user permission (Super Admin bypass + RBAC query)
CREATE OR REPLACE FUNCTION public.has_permission(
    p_user_id UUID,
    p_module TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Super Admin Bypass Check
    IF EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
          AND ur.is_active = true
          AND r.is_active = true
          AND r.is_system = true
          AND (r.name_en = 'Super Admin' OR r.name_ar = 'مدير النظام')
    ) THEN
        RETURN true;
    END IF;

    -- Granular RBAC Check
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
          AND ur.is_active = true
          AND r.is_active = true
          AND p.module = p_module
          AND p.action = p_action
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Get all permissions for current user
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS TABLE(module TEXT, action TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.module, p.action
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND r.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Atomic Document Number Generator
CREATE OR REPLACE FUNCTION public.generate_doc_number(p_doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
    v_seq public.document_sequences%ROWTYPE;
    v_number TEXT;
    v_year TEXT;
BEGIN
    SELECT * INTO v_seq 
    FROM public.document_sequences
    WHERE doc_type = p_doc_type 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document sequence for doc_type "%" not found', p_doc_type;
    END IF;

    IF v_seq.year_format = 'YYYY' THEN
        v_year := to_char(now(), 'YYYY');
    ELSIF v_seq.year_format = 'YY' THEN
        v_year := to_char(now(), 'YY');
    ELSE
        v_year := '';
    END IF;

    v_number := v_seq.prefix || '-' || 
                (CASE WHEN v_year != '' THEN v_year || '-' ELSE '' END) || 
                lpad(v_seq.next_number::TEXT, v_seq.pad_length, '0');

    UPDATE public.document_sequences
    SET next_number = next_number + 1, 
        updated_at = now()
    WHERE doc_type = p_doc_type;

    RETURN v_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to foundation tables
DROP TRIGGER IF EXISTS trg_profiles_timestamp ON public.profiles;
CREATE TRIGGER trg_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_employees_timestamp ON public.employees;
CREATE TRIGGER trg_employees_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_roles_timestamp ON public.roles;
CREATE TRIGGER trg_roles_timestamp BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_system_settings_timestamp ON public.system_settings;
CREATE TRIGGER trg_system_settings_timestamp BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_document_sequences_timestamp ON public.document_sequences;
CREATE TRIGGER trg_document_sequences_timestamp BEFORE UPDATE ON public.document_sequences FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Function: Create Audit Log Helper
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_action TEXT,
    p_module TEXT,
    p_record_type TEXT,
    p_record_id UUID,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, module, record_type, record_id, old_value, new_value
    ) VALUES (
        auth.uid(), p_action, p_module, p_record_type, p_record_id, p_old_value, p_new_value
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
