-- Migration: 00008_compliance
-- Creates: audit_log, consent_records, data_retention_policies tables
-- Audit log is IMMUTABLE — no UPDATE or DELETE allowed

-- =============================================================================
-- AUDIT LOG (append-only)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  user_id       UUID REFERENCES auth.users(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  details       JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);

-- Immutable audit log: prevent UPDATE and DELETE
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records are immutable — UPDATE and DELETE are not allowed';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_audit_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- =============================================================================
-- CONSENT RECORDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS consent_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_id UUID,
  survey_id     UUID REFERENCES surveys(id),
  consent_type  TEXT NOT NULL,
  consented     BOOLEAN NOT NULL,
  ip_hash       TEXT,
  consent_text  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_survey ON consent_records(survey_id);
CREATE INDEX IF NOT EXISTS idx_consent_respondent ON consent_records(respondent_id) WHERE respondent_id IS NOT NULL;

-- =============================================================================
-- DATA RETENTION POLICIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type  TEXT NOT NULL,
  retention_days INT NOT NULL DEFAULT 365,
  auto_delete    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT positive_retention CHECK (retention_days > 0)
);

CREATE INDEX IF NOT EXISTS idx_retention_org ON data_retention_policies(org_id);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
