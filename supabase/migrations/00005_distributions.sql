-- Migration: 00005_distributions
-- Creates: distributions, reminders tables

-- =============================================================================
-- DISTRIBUTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS distributions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  channel      TEXT NOT NULL,  -- email | sms | link | embed | qr
  recipients   JSONB,
  subject      TEXT,
  body         TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  status       TEXT DEFAULT 'draft',
  created_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_channel CHECK (channel IN ('email', 'sms', 'link', 'embed', 'qr')),
  CONSTRAINT valid_distribution_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_distributions_survey ON distributions(survey_id);
CREATE INDEX IF NOT EXISTS idx_distributions_status ON distributions(status);

-- =============================================================================
-- REMINDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  reminder_number INT DEFAULT 1,
  delay_hours     INT DEFAULT 48,
  template        JSONB,
  sent_at         TIMESTAMPTZ,
  status          TEXT DEFAULT 'scheduled',
  CONSTRAINT valid_reminder_status CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_reminders_survey ON reminders(survey_id);
CREATE INDEX IF NOT EXISTS idx_reminders_distribution ON reminders(distribution_id);

-- Enable RLS
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
