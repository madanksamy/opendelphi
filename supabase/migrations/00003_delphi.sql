-- Migration: 00003_delphi
-- Creates: delphi_rounds, delphi_panelists tables
-- Must run before responses migration (delphi_round_id, panelist_id FKs)

-- =============================================================================
-- DELPHI ROUNDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS delphi_rounds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id           UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  round_number        INT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending',
  consensus_threshold DECIMAL(5,2) DEFAULT 70.0,
  summary             JSONB,
  starts_at           TIMESTAMPTZ,
  ends_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(survey_id, round_number),
  CONSTRAINT valid_round_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  CONSTRAINT valid_consensus_threshold CHECK (consensus_threshold BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_delphi_rounds_survey ON delphi_rounds(survey_id);

-- =============================================================================
-- DELPHI PANELISTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS delphi_panelists (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  email     TEXT NOT NULL,
  name      TEXT,
  expertise TEXT,
  token     TEXT UNIQUE NOT NULL,
  status    TEXT DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_panelist_status CHECK (status IN ('invited', 'accepted', 'declined', 'removed'))
);

CREATE INDEX IF NOT EXISTS idx_delphi_panelists_survey ON delphi_panelists(survey_id);
CREATE INDEX IF NOT EXISTS idx_delphi_panelists_token ON delphi_panelists(token);

-- Enable RLS
ALTER TABLE delphi_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE delphi_panelists ENABLE ROW LEVEL SECURITY;
