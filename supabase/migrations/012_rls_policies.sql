-- ============================================================
-- 012: ROW LEVEL SECURITY POLICIES FOR FOUNDATION MODULES
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (
    id = auth.uid() OR public.has_permission(auth.uid(), 'users', 'view')
);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (
    id = auth.uid() OR public.has_permission(auth.uid(), 'users', 'edit')
);

-- EMPLOYEES
DROP POLICY IF EXISTS "employees_select" ON public.employees;
CREATE POLICY "employees_select" ON public.employees FOR SELECT USING (
    public.has_permission(auth.uid(), 'users', 'view')
);

DROP POLICY IF EXISTS "employees_insert" ON public.employees;
CREATE POLICY "employees_insert" ON public.employees FOR INSERT WITH CHECK (
    public.has_permission(auth.uid(), 'users', 'create')
);

DROP POLICY IF EXISTS "employees_update" ON public.employees;
CREATE POLICY "employees_update" ON public.employees FOR UPDATE USING (
    public.has_permission(auth.uid(), 'users', 'edit')
);

-- ROLES
DROP POLICY IF EXISTS "roles_select" ON public.roles;
CREATE POLICY "roles_select" ON public.roles FOR SELECT USING (
    public.has_permission(auth.uid(), 'roles', 'view') OR public.has_permission(auth.uid(), 'users', 'view')
);

DROP POLICY IF EXISTS "roles_insert" ON public.roles;
CREATE POLICY "roles_insert" ON public.roles FOR INSERT WITH CHECK (
    public.has_permission(auth.uid(), 'roles', 'create')
);

DROP POLICY IF EXISTS "roles_update" ON public.roles;
CREATE POLICY "roles_update" ON public.roles FOR UPDATE USING (
    public.has_permission(auth.uid(), 'roles', 'edit')
);

DROP POLICY IF EXISTS "roles_delete" ON public.roles;
CREATE POLICY "roles_delete" ON public.roles FOR DELETE USING (
    public.has_permission(auth.uid(), 'roles', 'delete') AND is_system = false
);

-- PERMISSIONS
DROP POLICY IF EXISTS "permissions_select" ON public.permissions;
CREATE POLICY "permissions_select" ON public.permissions FOR SELECT USING (
    auth.role() = 'authenticated'
);

-- ROLE_PERMISSIONS
DROP POLICY IF EXISTS "role_permissions_select" ON public.role_permissions;
CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT USING (
    public.has_permission(auth.uid(), 'roles', 'view') OR public.has_permission(auth.uid(), 'permissions_admin', 'view')
);

DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
CREATE POLICY "role_permissions_insert" ON public.role_permissions FOR INSERT WITH CHECK (
    public.has_permission(auth.uid(), 'permissions_admin', 'edit') OR public.has_permission(auth.uid(), 'roles', 'edit')
);

DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;
CREATE POLICY "role_permissions_delete" ON public.role_permissions FOR DELETE USING (
    public.has_permission(auth.uid(), 'permissions_admin', 'edit') OR public.has_permission(auth.uid(), 'roles', 'edit')
);

-- USER_ROLES
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (
    user_id = auth.uid() OR public.has_permission(auth.uid(), 'users', 'view')
);

DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT WITH CHECK (
    public.has_permission(auth.uid(), 'users', 'edit')
);

DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE USING (
    public.has_permission(auth.uid(), 'users', 'edit')
);

-- SYSTEM_SETTINGS
DROP POLICY IF EXISTS "system_settings_select" ON public.system_settings;
CREATE POLICY "system_settings_select" ON public.system_settings FOR SELECT USING (
    public.has_permission(auth.uid(), 'system_settings', 'view')
);

DROP POLICY IF EXISTS "system_settings_update" ON public.system_settings;
CREATE POLICY "system_settings_update" ON public.system_settings FOR UPDATE USING (
    public.has_permission(auth.uid(), 'system_settings', 'edit')
);

-- AUDIT_LOGS
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT USING (
    public.has_permission(auth.uid(), 'audit_logs', 'view')
);

-- APPROVALS
DROP POLICY IF EXISTS "approvals_select" ON public.approvals;
CREATE POLICY "approvals_select" ON public.approvals FOR SELECT USING (
    requester_id = auth.uid() OR approver_id = auth.uid() OR delegate_id = auth.uid() OR public.has_permission(auth.uid(), 'approvals', 'view')
);

DROP POLICY IF EXISTS "approvals_insert" ON public.approvals;
CREATE POLICY "approvals_insert" ON public.approvals FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "approvals_update" ON public.approvals;
CREATE POLICY "approvals_update" ON public.approvals FOR UPDATE USING (
    approver_id = auth.uid() OR delegate_id = auth.uid() OR public.has_permission(auth.uid(), 'approvals', 'approve')
);

-- APPROVAL_DELEGATIONS
DROP POLICY IF EXISTS "approval_delegations_select" ON public.approval_delegations;
CREATE POLICY "approval_delegations_select" ON public.approval_delegations FOR SELECT USING (
    delegator_id = auth.uid() OR delegate_id = auth.uid() OR public.has_permission(auth.uid(), 'approvals', 'view')
);

DROP POLICY IF EXISTS "approval_delegations_insert" ON public.approval_delegations;
CREATE POLICY "approval_delegations_insert" ON public.approval_delegations FOR INSERT WITH CHECK (
    delegator_id = auth.uid() OR public.has_permission(auth.uid(), 'approvals', 'approve')
);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- DOCUMENT_SEQUENCES
DROP POLICY IF EXISTS "document_sequences_select" ON public.document_sequences;
CREATE POLICY "document_sequences_select" ON public.document_sequences FOR SELECT USING (
    auth.role() = 'authenticated'
);

-- ATTACHMENTS
DROP POLICY IF EXISTS "attachments_select" ON public.attachments;
CREATE POLICY "attachments_select" ON public.attachments FOR SELECT USING (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "attachments_insert" ON public.attachments;
CREATE POLICY "attachments_insert" ON public.attachments FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "attachments_delete" ON public.attachments;
CREATE POLICY "attachments_delete" ON public.attachments FOR DELETE USING (
    uploaded_by = auth.uid() OR public.has_permission(auth.uid(), 'attachments', 'delete')
);
