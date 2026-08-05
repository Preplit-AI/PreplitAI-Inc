# PreplitAI — Changelog & Revision History

## [2.0.0 - Subscription SaaS V3.0 Migration] - 2026-08-04

### Added
- Created V3.0 Enterprise Subscription Architecture schema (`capabilities`, `plan_capabilities`, `providers`, `models`, `provider_models`, `subscription_plans`, `subscriptions`, `billing_periods`, `usage_events`, `organizations`, `organization_members`, `audit_logs`).
- Implemented `FeatureGateway` service (`server/services/FeatureGateway.js`) encapsulating capability resolution, subscription verification, rate limiting, and infrastructure cost accounting.
- Created `server/routes/subscription.js` offering `/api/subscription/me`, `/checkout`, and `/portal`.
- Built `PlanBadge.tsx` displaying plan status and monthly usage percentage (e.g. `Pro • 43%`).
- Built configuration-driven `SubscriptionModal.tsx` supporting Free, Pro ($19/mo), and Max ($49/mo) plan selections with Monthly/Annual billing toggles.

### Removed
- Removed all public credit and token terminology from user interface components.

### Security & Architecture
- Isolated model providers (`groq`, `openai`, `anthropic`, `deepseek`) into decoupled capability mapping tables (`provider_models`).
- Added system audit log tracking (`audit_logs`) for business events.
- Versioned subscription plan structures for legacy customer grandfathering.
