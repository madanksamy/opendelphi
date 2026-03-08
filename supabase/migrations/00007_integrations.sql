-- Migration: 00007_integrations
-- Creates: integrations, google_sheets_sync tables

-- =============================================================================
-- INTEGRATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS integrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,  -- google_sheets | ehr | slack | webhook
  config         JSONB NOT NULL,
  status         TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_integration_type CHECK (type IN ('google_sheets', 'ehr', 'slack', 'webhook')),
  CONSTRAINT valid_integration_status CHECK (status IN ('active', 'paused', 'error', 'disconnected'))
);

CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);

-- =============================================================================
-- GOOGLE SHEETS SYNC
-- =============================================================================
CREATE TABLE IF NOT EXISTS google_sheets_sync (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  spreadsheet_id  TEXT NOT NULL,
  sheet_name      TEXT DEFAULT 'Responses',
  last_row_synced INT DEFAULT 0,
  sync_direction  TEXT DEFAULT 'push',
  status          TEXT DEFAULT 'active',
  CONSTRAINT valid_sync_direction CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  CONSTRAINT valid_sync_status CHECK (status IN ('active', 'paused', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_sheets_sync_integration ON google_sheets_sync(integration_id);
CREATE INDEX IF NOT EXISTS idx_sheets_sync_survey ON google_sheets_sync(survey_id);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheets_sync ENABLE ROW LEVEL SECURITY;
