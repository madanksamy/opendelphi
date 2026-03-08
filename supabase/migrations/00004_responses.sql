-- Migration: 00004_responses
-- Creates: responses table with indexes

-- =============================================================================
-- RESPONSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  survey_version  INT NOT NULL DEFAULT 1,
  respondent_id   UUID REFERENCES auth.users(id),
  delphi_round_id UUID REFERENCES delphi_rounds(id),
  panelist_id     UUID REFERENCES delphi_panelists(id),
  answers         JSONB NOT NULL DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  status          TEXT DEFAULT 'complete',
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  ip_hash         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_response_status CHECK (status IN ('in_progress', 'complete', 'disqualified'))
);

-- Primary query index
CREATE INDEX IF NOT EXISTS idx_responses_survey ON responses(survey_id);

-- GIN index for querying into JSONB answers
CREATE INDEX IF NOT EXISTS idx_responses_answers ON responses USING gin(answers);

-- Respondent lookup
CREATE INDEX IF NOT EXISTS idx_responses_respondent ON responses(respondent_id) WHERE respondent_id IS NOT NULL;

-- Delphi round lookup
CREATE INDEX IF NOT EXISTS idx_responses_delphi_round ON responses(delphi_round_id) WHERE delphi_round_id IS NOT NULL;

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_responses_created ON responses(survey_id, created_at DESC);

-- Enable RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
