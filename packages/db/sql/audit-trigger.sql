-- Audit trigger function. Writes an entry to audit_logs on every INSERT/UPDATE/DELETE
-- of any table this trigger is attached to. Pulls actor + tenant + request id from
-- per-transaction GUC values set by withTenantTx() in @ico/db.
--
-- SECURITY DEFINER lets the trigger write to audit_logs even though the calling
-- user (app_tenant) only has INSERT permission on it.

CREATE OR REPLACE FUNCTION write_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_tenant uuid;
  v_actor uuid;
  v_actor_kind text;
  v_request_id text;
  v_ip text;
  v_record_id uuid;
  v_op_lower text;
BEGIN
  -- Pull GUC values; missing settings come back as NULL or empty string.
  v_tenant := nullif(current_setting('app.current_tenant', true), '')::uuid;
  v_actor := nullif(current_setting('app.current_actor', true), '')::uuid;
  v_actor_kind := coalesce(nullif(current_setting('app.current_actor_kind', true), ''), 'system');
  v_request_id := nullif(current_setting('app.current_request_id', true), '');
  v_ip := nullif(current_setting('app.current_ip', true), '');

  -- For the tenants table itself, the row IS the tenant.
  IF TG_TABLE_NAME = 'tenants' THEN
    v_tenant := coalesce(v_tenant, (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END));
  ELSE
    v_tenant := coalesce(
      v_tenant,
      (CASE WHEN TG_OP = 'DELETE' THEN OLD.tenant_id ELSE NEW.tenant_id END)
    );
  END IF;

  v_record_id := (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END);
  v_op_lower := lower(TG_OP);

  INSERT INTO audit_logs (
    tenant_id, actor_user_id, actor_kind, action,
    table_name, record_id, before_jsonb, after_jsonb,
    ip, request_id, occurred_at
  ) VALUES (
    v_tenant,
    v_actor,
    v_actor_kind,
    v_op_lower::audit_action,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    v_ip,
    v_request_id,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
