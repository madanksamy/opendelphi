-- Migration: 00009_rls_policies
-- Comprehensive Row-Level Security policies for all tables
--
-- Role hierarchy: owner > admin > editor > viewer > member
-- Helper function checks membership and minimum role level.

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Check if the current user is a member of an org with at least the given role
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID, min_role TEXT DEFAULT 'member')
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_level INT;
  min_level INT;
BEGIN
  SELECT role INTO user_role
  FROM org_members
  WHERE org_id = check_org_id AND user_id = auth.uid();

  IF user_role IS NULL THEN RETURN FALSE; END IF;

  -- Map roles to numeric levels
  role_level := CASE user_role
    WHEN 'owner' THEN 50
    WHEN 'admin' THEN 40
    WHEN 'editor' THEN 30
    WHEN 'viewer' THEN 20
    WHEN 'member' THEN 10
    ELSE 0
  END;

  min_level := CASE min_role
    WHEN 'owner' THEN 50
    WHEN 'admin' THEN 40
    WHEN 'editor' THEN 30
    WHEN 'viewer' THEN 20
    WHEN 'member' THEN 10
    ELSE 0
  END;

  RETURN role_level >= min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the org_id for a survey
CREATE OR REPLACE FUNCTION get_survey_org_id(check_survey_id UUID)
RETURNS UUID AS $$
  SELECT org_id FROM surveys WHERE id = check_survey_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
-- Members can read their own orgs
CREATE POLICY org_select ON organizations FOR SELECT
  USING (is_org_member(id, 'member'));

-- Owners and admins can update
CREATE POLICY org_update ON organizations FOR UPDATE
  USING (is_org_member(id, 'admin'));

-- Any authenticated user can create an org (they become owner)
CREATE POLICY org_insert ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can delete
CREATE POLICY org_delete ON organizations FOR DELETE
  USING (is_org_member(id, 'owner'));

-- =============================================================================
-- PROFILES
-- =============================================================================
-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Org members can see profiles of other members in their orgs
CREATE POLICY profiles_select_org ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members om1
      JOIN org_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.id
    )
  );

-- =============================================================================
-- ORG MEMBERS
-- =============================================================================
-- Members can see other members in their orgs
CREATE POLICY org_members_select ON org_members FOR SELECT
  USING (is_org_member(org_id, 'member'));

-- Admins+ can add members
CREATE POLICY org_members_insert ON org_members FOR INSERT
  WITH CHECK (is_org_member(org_id, 'admin'));

-- Admins+ can update member roles (but not their own)
CREATE POLICY org_members_update ON org_members FOR UPDATE
  USING (is_org_member(org_id, 'admin') AND user_id != auth.uid());

-- Admins+ can remove members (but not themselves)
CREATE POLICY org_members_delete ON org_members FOR DELETE
  USING (is_org_member(org_id, 'admin') AND user_id != auth.uid());

-- =============================================================================
-- SURVEYS
-- =============================================================================
-- Org members can read surveys
CREATE POLICY surveys_select ON surveys FOR SELECT
  USING (is_org_member(org_id, 'viewer'));

-- Editors+ can create surveys
CREATE POLICY surveys_insert ON surveys FOR INSERT
  WITH CHECK (is_org_member(org_id, 'editor'));

-- Editors+ can update surveys
CREATE POLICY surveys_update ON surveys FOR UPDATE
  USING (is_org_member(org_id, 'editor'));

-- Admins+ can delete surveys
CREATE POLICY surveys_delete ON surveys FOR DELETE
  USING (is_org_member(org_id, 'admin'));

-- =============================================================================
-- SURVEY VERSIONS
-- =============================================================================
CREATE POLICY survey_versions_select ON survey_versions FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY survey_versions_insert ON survey_versions FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

-- =============================================================================
-- RESPONSES
-- =============================================================================
-- Survey org members (viewer+) can read responses
CREATE POLICY responses_select ON responses FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

-- Anyone can insert responses (public survey submission)
-- For authenticated surveys, the requires_auth check is at the app layer
CREATE POLICY responses_insert_anon ON responses FOR INSERT
  WITH CHECK (true);

-- Admins can delete responses (e.g. spam cleanup)
CREATE POLICY responses_delete ON responses FOR DELETE
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- =============================================================================
-- DELPHI ROUNDS
-- =============================================================================
CREATE POLICY delphi_rounds_select ON delphi_rounds FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY delphi_rounds_insert ON delphi_rounds FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY delphi_rounds_update ON delphi_rounds FOR UPDATE
  USING (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY delphi_rounds_delete ON delphi_rounds FOR DELETE
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- =============================================================================
-- DELPHI PANELISTS
-- =============================================================================
CREATE POLICY delphi_panelists_select ON delphi_panelists FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY delphi_panelists_insert ON delphi_panelists FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY delphi_panelists_update ON delphi_panelists FOR UPDATE
  USING (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY delphi_panelists_delete ON delphi_panelists FOR DELETE
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- =============================================================================
-- DISTRIBUTIONS
-- =============================================================================
CREATE POLICY distributions_select ON distributions FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY distributions_insert ON distributions FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY distributions_update ON distributions FOR UPDATE
  USING (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY distributions_delete ON distributions FOR DELETE
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- =============================================================================
-- REMINDERS
-- =============================================================================
CREATE POLICY reminders_select ON reminders FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY reminders_insert ON reminders FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY reminders_update ON reminders FOR UPDATE
  USING (is_org_member(get_survey_org_id(survey_id), 'editor'));

CREATE POLICY reminders_delete ON reminders FOR DELETE
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- =============================================================================
-- AI ANALYSES
-- =============================================================================
CREATE POLICY ai_analyses_select ON ai_analyses FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY ai_analyses_insert ON ai_analyses FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

-- =============================================================================
-- LLM CONSENSUS RUNS
-- =============================================================================
CREATE POLICY llm_consensus_select ON llm_consensus_runs FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'viewer'));

CREATE POLICY llm_consensus_insert ON llm_consensus_runs FOR INSERT
  WITH CHECK (is_org_member(get_survey_org_id(survey_id), 'editor'));

-- =============================================================================
-- INTEGRATIONS
-- =============================================================================
CREATE POLICY integrations_select ON integrations FOR SELECT
  USING (is_org_member(org_id, 'viewer'));

CREATE POLICY integrations_insert ON integrations FOR INSERT
  WITH CHECK (is_org_member(org_id, 'admin'));

CREATE POLICY integrations_update ON integrations FOR UPDATE
  USING (is_org_member(org_id, 'admin'));

CREATE POLICY integrations_delete ON integrations FOR DELETE
  USING (is_org_member(org_id, 'admin'));

-- =============================================================================
-- GOOGLE SHEETS SYNC
-- =============================================================================
CREATE POLICY sheets_sync_select ON google_sheets_sync FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integrations i
      WHERE i.id = google_sheets_sync.integration_id
      AND is_org_member(i.org_id, 'viewer')
    )
  );

CREATE POLICY sheets_sync_insert ON google_sheets_sync FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM integrations i
      WHERE i.id = google_sheets_sync.integration_id
      AND is_org_member(i.org_id, 'admin')
    )
  );

CREATE POLICY sheets_sync_update ON google_sheets_sync FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM integrations i
      WHERE i.id = google_sheets_sync.integration_id
      AND is_org_member(i.org_id, 'admin')
    )
  );

CREATE POLICY sheets_sync_delete ON google_sheets_sync FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM integrations i
      WHERE i.id = google_sheets_sync.integration_id
      AND is_org_member(i.org_id, 'admin')
    )
  );

-- =============================================================================
-- AUDIT LOG (append-only: INSERT only, admins can read)
-- =============================================================================
-- Admins can read audit logs for their org
CREATE POLICY audit_log_select ON audit_log FOR SELECT
  USING (is_org_member(org_id, 'admin'));

-- Authenticated users can insert audit entries (typically via service role)
CREATE POLICY audit_log_insert ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- No UPDATE or DELETE policies — triggers already block those operations

-- =============================================================================
-- CONSENT RECORDS
-- =============================================================================
-- Org admins can read consent records for their surveys
CREATE POLICY consent_select ON consent_records FOR SELECT
  USING (is_org_member(get_survey_org_id(survey_id), 'admin'));

-- Anyone can insert consent records (during survey submission)
CREATE POLICY consent_insert ON consent_records FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- DATA RETENTION POLICIES
-- =============================================================================
CREATE POLICY retention_select ON data_retention_policies FOR SELECT
  USING (is_org_member(org_id, 'admin'));

CREATE POLICY retention_insert ON data_retention_policies FOR INSERT
  WITH CHECK (is_org_member(org_id, 'owner'));

CREATE POLICY retention_update ON data_retention_policies FOR UPDATE
  USING (is_org_member(org_id, 'owner'));

CREATE POLICY retention_delete ON data_retention_policies FOR DELETE
  USING (is_org_member(org_id, 'owner'));
