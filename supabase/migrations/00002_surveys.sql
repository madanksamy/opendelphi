-- Migration: 00002_surveys
-- Creates: surveys, survey_versions tables

-- =============================================================================
-- SURVEYS
-- =============================================================================
CREATE TABLE IF NOT EXISTS surveys (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by       UUID REFERENCES auth.users(id),
  title            TEXT NOT NULL,
  description      TEXT,
  slug             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'standard',
  -- types: standard | delphi | meeting_feedback | product_review |
  --        employee_review | patient_intake | satisfaction
  status           TEXT NOT NULL DEFAULT 'draft',
  schema           JSONB NOT NULL DEFAULT '[]',  -- field definitions
  settings         JSONB DEFAULT '{}',
  theme            JSONB DEFAULT '{}',
  multi_step       BOOLEAN DEFAULT FALSE,
  welcome_screen   JSONB,
  thank_you_screen JSONB,
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  response_limit   INT,
  requires_auth    BOOLEAN DEFAULT FALSE,
  is_anonymous     BOOLEAN DEFAULT TRUE,
  version          INT DEFAULT 1,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, slug),
  CONSTRAINT valid_survey_status CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  CONSTRAINT valid_survey_type CHECK (type IN (
    'standard', 'delphi', 'meeting_feedback', 'product_review',
    'employee_review', 'patient_intake', 'satisfaction'
  ))
);

-- Schema JSONB format:
-- [{ id, type, label, description, required, validation, options,
--    logic: { show_if: { field_id, op, value } },
--    column, step, properties }]

CREATE INDEX IF NOT EXISTS idx_surveys_org ON surveys(org_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(org_id, slug);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);

CREATE TRIGGER trg_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SURVEY VERSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS survey_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  version      INT NOT NULL,
  schema       JSONB NOT NULL,
  settings     JSONB,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(survey_id, version)
);

CREATE INDEX IF NOT EXISTS idx_survey_versions_survey ON survey_versions(survey_id);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_versions ENABLE ROW LEVEL SECURITY;
