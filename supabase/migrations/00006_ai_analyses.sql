-- Migration: 00006_ai_analyses
-- Creates: ai_analyses, llm_consensus_runs tables

-- =============================================================================
-- AI ANALYSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id          UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  round_id           UUID REFERENCES delphi_rounds(id),
  analysis_type      TEXT NOT NULL,
  model_used         TEXT,
  input_token_count  INT,
  output_token_count INT,
  result             JSONB NOT NULL,
  confidence         DECIMAL(5,2),
  created_at         TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_survey ON ai_analyses(survey_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_round ON ai_analyses(round_id) WHERE round_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(analysis_type);

-- =============================================================================
-- LLM CONSENSUS RUNS
-- =============================================================================
CREATE TABLE IF NOT EXISTS llm_consensus_runs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id  UUID REFERENCES surveys(id),
  task_type  TEXT NOT NULL,
  prompt     TEXT NOT NULL,
  results    JSONB NOT NULL,
  consensus  JSONB,
  status     TEXT DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_consensus_status CHECK (status IN ('running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_llm_consensus_survey ON llm_consensus_runs(survey_id);
CREATE INDEX IF NOT EXISTS idx_llm_consensus_status ON llm_consensus_runs(status);

-- Enable RLS
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_consensus_runs ENABLE ROW LEVEL SECURITY;
