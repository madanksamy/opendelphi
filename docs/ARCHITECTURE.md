# OpenDelphi — Architecture & Implementation Plan

## Vision
The ultimate feedback, survey, and consensus-building platform — surpassing Google Forms, Typeform, SurveyMonkey, and Qualtrics. HIPAA/GDPR/FDA 21 CFR/SOC 2 compliant. AI-native with multi-LLM consensus pipeline.

---

## 1. System Architecture

```
                              ┌─────────────────────────────┐
                              │        CDN / Vercel Edge     │
                              │   (Static Assets, ISR, SSR)  │
                              └──────────┬──────────────────┘
                                         │
                              ┌──────────▼──────────────────┐
                              │   Next.js 15 App Router      │
                              │   ┌───────────────────────┐  │
                              │   │ Public Pages           │  │
                              │   │ - Landing, Pricing     │  │
                              │   │ - Survey Response UI   │  │
                              │   ├───────────────────────┤  │
                              │   │ Authenticated App      │  │
                              │   │ - Form Builder (DnD)   │  │
                              │   │ - Dashboards           │  │
                              │   │ - Analytics/Reports    │  │
                              │   │ - CMS / Admin          │  │
                              │   │ - AI Voice Studio      │  │
                              │   ├───────────────────────┤  │
                              │   │ API Routes             │  │
                              │   │ - /api/surveys/*       │  │
                              │   │ - /api/ai/*            │  │
                              │   │ - /api/integrations/*  │  │
                              │   └───────────────────────┘  │
                              └──────┬───────┬───────┬──────┘
                                     │       │       │
                 ┌───────────────────┘       │       └────────────────────┐
                 │                           │                           │
      ┌──────────▼──────────┐   ┌────────────▼──────────┐   ┌───────────▼──────────┐
      │    Supabase          │   │   AWS Services         │   │   AI Layer            │
      │  - Auth (RLS, MFA)   │   │  - SES (Email)         │   │  - Multi-LLM Router   │
      │  - PostgreSQL        │   │  - SNS (SMS)           │   │  - OpenAI GPT-4o      │
      │  - Realtime          │   │  - S3 (Files)          │   │  - Anthropic Claude   │
      │  - Storage           │   │  - Lambda (Workers)    │   │  - Google Gemini      │
      │  - Edge Functions    │   │  - CloudWatch          │   │  - Mistral            │
      └──────────────────────┘   └────────────────────────┘   │  - Consensus Engine   │
                                                              └──────────────────────┘
                 ┌───────────────────────────────────────────┐
                 │           Background Workers               │
                 │  - Reminders (cron)                        │
                 │  - AI Analysis (event-driven)              │
                 │  - Google Sheets Sync (realtime)           │
                 └───────────────────────────────────────────┘
```

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR/ISR, API routes, server components |
| Language | TypeScript (strict) | Type safety for complex form schemas |
| UI | shadcn/ui + Radix | Accessible, composable, themeable |
| Styling | Tailwind CSS 4 | Utility-first, fast iteration |
| Drag & Drop | @dnd-kit/core | Best React DnD; accessible, extensible |
| Rich Text | Tiptap (ProseMirror) | Inline editing in form builder |
| Charts | Recharts + D3 | Standard charts + custom viz |
| Forms | React Hook Form + Zod | Performant + runtime validation |
| State | Zustand + TanStack Query | Lightweight client + server cache |
| Auth | Supabase Auth | RLS, SSR, social, MFA |
| Database | Supabase PostgreSQL | RLS multi-tenancy, JSONB schemas |
| Realtime | Supabase Realtime | Live collaboration + dashboards |
| Email | AWS SES + React Email | Transactional with templates |
| SMS | AWS SNS | Distribution + reminders |
| AI | OpenAI, Anthropic, Google, Mistral | Multi-LLM consensus |
| Voice | OpenAI Whisper + TTS | Voice-to-form creation |
| Payments | Stripe | Subscriptions, metered billing |
| Testing | Vitest + Playwright | Unit + E2E |
| Monitoring | Sentry + Vercel Analytics | Errors + performance |
| Dev Port | 3040 | |

## 3. Database Schema

### Core Tables

```sql
-- MULTI-TENANT LAYER
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  plan            TEXT NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  settings        JSONB DEFAULT '{}',
  hipaa_baa_signed BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_members (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id   UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL DEFAULT 'member', -- owner|admin|editor|viewer
  UNIQUE(org_id, user_id)
);

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  phone      TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SURVEY ENGINE
CREATE TABLE surveys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  slug            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'standard',
  -- types: standard|delphi|meeting_feedback|product_review|
  --        employee_review|patient_intake|satisfaction
  status          TEXT NOT NULL DEFAULT 'draft',
  schema          JSONB NOT NULL DEFAULT '[]', -- field definitions
  settings        JSONB DEFAULT '{}',
  theme           JSONB DEFAULT '{}',
  multi_step      BOOLEAN DEFAULT FALSE,
  welcome_screen  JSONB,
  thank_you_screen JSONB,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  response_limit  INT,
  requires_auth   BOOLEAN DEFAULT FALSE,
  is_anonymous    BOOLEAN DEFAULT TRUE,
  version         INT DEFAULT 1,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Schema JSONB format:
-- [{ id, type, label, description, required, validation, options,
--    logic: { show_if: { field_id, op, value } },
--    column, step, properties }]

CREATE TABLE survey_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID REFERENCES surveys(id) ON DELETE CASCADE,
  version      INT NOT NULL,
  schema       JSONB NOT NULL,
  settings     JSONB,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(survey_id, version)
);

-- DELPHI METHOD
CREATE TABLE delphi_rounds (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id             UUID REFERENCES surveys(id) ON DELETE CASCADE,
  round_number          INT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',
  consensus_threshold   DECIMAL(5,2) DEFAULT 70.0,
  summary               JSONB,
  starts_at             TIMESTAMPTZ,
  ends_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(survey_id, round_number)
);

CREATE TABLE delphi_panelists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id  UUID REFERENCES surveys(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT,
  expertise  TEXT,
  token      TEXT UNIQUE NOT NULL,
  status     TEXT DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT now()
);

-- RESPONSES
CREATE TABLE responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id       UUID REFERENCES surveys(id) ON DELETE CASCADE,
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
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_responses_survey ON responses(survey_id);
CREATE INDEX idx_responses_answers ON responses USING gin(answers);

-- DISTRIBUTION & REMINDERS
CREATE TABLE distributions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID REFERENCES surveys(id) ON DELETE CASCADE,
  channel      TEXT NOT NULL, -- email|sms|link|embed|qr
  recipients   JSONB,
  subject      TEXT,
  body         TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  status       TEXT DEFAULT 'draft',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distributions(id) ON DELETE CASCADE,
  survey_id       UUID REFERENCES surveys(id) ON DELETE CASCADE,
  reminder_number INT DEFAULT 1,
  delay_hours     INT DEFAULT 48,
  template        JSONB,
  sent_at         TIMESTAMPTZ,
  status          TEXT DEFAULT 'scheduled'
);

-- AI ANALYSIS
CREATE TABLE ai_analyses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id          UUID REFERENCES surveys(id) ON DELETE CASCADE,
  round_id           UUID REFERENCES delphi_rounds(id),
  analysis_type      TEXT NOT NULL,
  model_used         TEXT,
  input_token_count  INT,
  output_token_count INT,
  result             JSONB NOT NULL,
  confidence         DECIMAL(5,2),
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE llm_consensus_runs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id  UUID REFERENCES surveys(id),
  task_type  TEXT NOT NULL,
  prompt     TEXT NOT NULL,
  results    JSONB NOT NULL,
  consensus  JSONB,
  status     TEXT DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INTEGRATIONS
CREATE TABLE integrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type           TEXT NOT NULL, -- google_sheets|ehr|slack|webhook
  config         JSONB NOT NULL,
  status         TEXT DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE google_sheets_sync (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id  UUID REFERENCES integrations(id) ON DELETE CASCADE,
  survey_id       UUID REFERENCES surveys(id) ON DELETE CASCADE,
  spreadsheet_id  TEXT NOT NULL,
  sheet_name      TEXT DEFAULT 'Responses',
  last_row_synced INT DEFAULT 0,
  sync_direction  TEXT DEFAULT 'push',
  status          TEXT DEFAULT 'active'
);

-- COMPLIANCE: AUDIT LOG
CREATE TABLE audit_log (
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

CREATE INDEX idx_audit_org_time ON audit_log(org_id, created_at DESC);

-- COMPLIANCE: CONSENT & RETENTION
CREATE TABLE consent_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_id UUID,
  survey_id     UUID REFERENCES surveys(id),
  consent_type  TEXT NOT NULL,
  consented     BOOLEAN NOT NULL,
  ip_hash       TEXT,
  consent_text  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE data_retention_policies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type  TEXT NOT NULL,
  retention_days INT NOT NULL DEFAULT 365,
  auto_delete    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

## 4. Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing, pricing, features
│   ├── (auth)/               # Login, register, forgot-password
│   ├── (app)/                # Authenticated app
│   │   ├── dashboard/
│   │   ├── surveys/
│   │   │   ├── new/
│   │   │   └── [id]/         # edit, responses, analytics, distribute, settings
│   │   ├── delphi/
│   │   │   └── [id]/         # rounds, panel
│   │   ├── templates/
│   │   ├── integrations/
│   │   ├── ai-studio/        # Voice mode + AI generation
│   │   ├── settings/         # org, billing, team, compliance
│   │   └── admin/            # Site admin (super-admin)
│   ├── s/[slug]/             # Public survey response
│   └── api/
│       ├── surveys/
│       ├── ai/               # analyze, generate, consensus, voice
│       ├── integrations/
│       ├── webhooks/
│       └── cron/
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── form-builder/         # Builder, FieldPalette, FieldRenderer, FieldEditor,
│   │   │                     # LogicEditor, StepManager, ThemeEditor, PreviewMode
│   │   └── fields/           # 18+ field type components
│   ├── survey-renderer/      # SurveyForm, StepNavigation, ProgressBar
│   ├── analytics/            # Charts, tables, heatmaps, word clouds
│   ├── delphi/               # RoundManager, ConsensusGauge, PanelManager
│   ├── ai/                   # VoiceRecorder, AIChat, SuggestionPanel
│   ├── dashboard/            # StatsCards, RecentSurveys, ResponseTimeline
│   └── shared/               # AppShell, Sidebar, Header
├── lib/
│   ├── supabase/             # client, server, admin, middleware, types
│   ├── ai/
│   │   ├── router.ts         # Multi-LLM router
│   │   ├── consensus.ts      # Consensus engine
│   │   ├── providers/        # openai, anthropic, google, mistral
│   │   ├── prompts/          # Template functions
│   │   └── voice.ts          # Whisper + TTS
│   ├── aws/                  # ses, sns, s3, lambda
│   ├── integrations/         # google-sheets, ehr
│   ├── billing/              # stripe, plans, usage
│   ├── compliance/           # audit, encryption, consent, retention, hipaa
│   ├── schema/               # Zod schemas
│   ├── hooks/                # React hooks
│   └── utils/
├── stores/                   # Zustand stores
└── middleware.ts

supabase/
├── migrations/               # Numbered SQL migrations
├── seed.sql
└── functions/                # Edge Functions

scripts/
├── seed-mock-data.ts         # 64 clients + 10 surveys
├── generate-types.sh
└── setup-aws.sh
```

## 5. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Supabase: auth, organizations, profiles, RLS
- App shell: sidebar, header, routing
- Vercel deployment, CI/CD

### Phase 2: Form Builder Core (Weeks 3-5)
- 18+ field types with registry pattern
- Drag-and-drop canvas (@dnd-kit)
- Inline editing, multi-step, multi-column
- Conditional logic, live preview, theming
- Auto-save, versioning

### Phase 3: Survey Response Engine (Weeks 5-6)
- Public survey renderer (/s/[slug])
- Multi-step navigation, field validation
- Partial saves, mobile-optimized, accessible
- Welcome/thank-you screens, embed mode

### Phase 4: Analytics Dashboard (Weeks 7-8)
- Summary stats, per-field visualization
- Data tables with sort/filter/export
- NPS gauge, word cloud, heatmap, trends
- Real-time updates, CSV/Excel/PDF export

### Phase 5: Distribution & Reminders (Weeks 8-9)
- AWS SES email + SNS SMS
- Email templates, recipient management
- Scheduled sends, automated reminders
- Delivery tracking, QR codes

### Phase 6: Delphi Method Engine (Weeks 10-12)
- Panel management, round lifecycle
- Anonymous token access
- Between-round feedback, consensus calculation
- AI round summaries, round comparison

### Phase 7: AI Integration (Weeks 12-14)
- Multi-LLM router + consensus pipeline
- Response analysis (sentiment, themes)
- Voice mode (Whisper -> LLM -> form schema)
- AI question generation, support agent

### Phase 8: Integrations (Weeks 14-15)
- Google Sheets real-time sync
- Webhooks, EHR framework (FHIR)
- Slack notifications

### Phase 9: Compliance Hardening (Weeks 15-17)
- HIPAA: field-level encryption, BAA, PHI tagging
- GDPR: consent, erasure, portability, DPO
- FDA 21 CFR Part 11: e-signatures, immutable audit trail
- SOC 2: security controls, monitoring

### Phase 10: Billing & Plans (Weeks 17-18)
- Stripe subscriptions, feature gating
- Usage tracking, billing dashboard

### Phase 11: Templates & Mock Data (Weeks 18-20)
- 10 survey templates, 64 mock clients
- 24 medical-specific profiles
- Template gallery, performance optimization
- E2E tests, documentation

## 6. Form Builder Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar: [Undo] [Redo] [Preview] [Theme] [Publish]    │
├─────────┬───────────────────────────────┬───────────────┤
│ Field   │     Builder Canvas            │  Properties   │
│ Palette │                               │  Inspector    │
│         │  ┌─── Step 1 ──────────────┐  │               │
│ [Text]  │  │ ┌──────┐  ┌──────────┐  │  │  Label: ___   │
│ [Email] │  │ │Field │  │ Field    │  │  │  Required: ☑  │
│ [Phone] │  │ │  1   │  │   2      │  │  │  Validation   │
│ [Select]│  │ └──────┘  └──────────┘  │  │  Logic: ...   │
│ [Rating]│  │ ┌─────────────────────┐ │  │               │
│  ...    │  │ │   Field 3 (full w)  │ │  │               │
│         │  │ └─────────────────────┘ │  │               │
│         │  └─────────────────────────┘  │               │
└─────────┴───────────────────────────────┴───────────────┘
```

- **State**: Zustand store with undo/redo (temporal middleware), immer for immutable updates
- **Inline editing**: Click label to edit; double-click options to manage
- **Field registry**: `fields/index.ts` maps type -> {BuilderComponent, RendererComponent, config, icon, validation}

## 7. Multi-LLM Consensus Pipeline

```
Task → LLM Router → [GPT-4o, Claude, Gemini] → Consensus Engine → Result
                                                   ├─ Normalize outputs
                                                   ├─ Score agreement
                                                   ├─ Merge (majority-vote / weighted avg)
                                                   └─ Confidence = agreement %
```

## 8. Pricing Tiers

| Feature | Free | Pro $29/mo | Business $79/mo | Enterprise |
|---------|------|-----------|----------------|------------|
| Surveys | 1 | 25 | Unlimited | Unlimited |
| Responses/mo | 100 | 5,000 | 50,000 | Unlimited |
| Team members | 1 | 5 | 25 | Unlimited |
| Field types | Basic 10 | All 18+ | All | All+Custom |
| Multi-step | No | Yes | Yes | Yes |
| AI analysis | No | 10K tok/mo | 100K tok/mo | Custom |
| Voice mode | No | No | Yes | Yes |
| Delphi | No | 1 | Unlimited | Unlimited |
| Email dist. | No | 500/mo | 10K/mo | Unlimited |
| SMS | No | No | 1K/mo | Unlimited |
| Sheets sync | No | Yes | Yes | Yes |
| EHR | No | No | No | Yes |
| HIPAA | No | No | Add-on $50 | Included |
| SSO | No | No | No | Yes |

## 9. Mock Data

**64 clients across 8 sectors** (8 each): Healthcare, Medical Education, Pharma/Biotech, Corporate/HR, Events, Product/SaaS, Education, Government/NonProfit

**24 medical-specific** with specialties: Cardiology, Orthopedics, Pediatrics, EM, Psychiatry, Oncology, OB/GYN, Neurology, Dermatology, Ophthalmology, Radiology, Anesthesiology + 12 med ed programs

**10 example surveys**: Patient Satisfaction, Pre-Visit Intake, Employee Engagement, Conference Feedback, Delphi Treatment Protocol, Product Review, Medical Course Eval, Meeting Feedback, 360-Degree Review, Clinical Trial Patient Experience

## 10. Key Architectural Decisions

1. **JSONB for form schemas** — loaded/saved as unit, avoids JOINs, simplifies versioning
2. **Supabase RLS for multi-tenancy** — org_id on every table, works with Auth
3. **Next.js API routes (not separate backend)** — single Vercel deployment
4. **Zustand over Redux** — simpler undo/redo with temporal middleware
5. **Separate compliance module** — centralized audit/encryption/consent in lib/compliance
6. **Survey versioning** — responses reference the version they were collected against
