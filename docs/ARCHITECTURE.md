# PreplitAI — V3.0 Enterprise Architecture Specification

## Architecture Overview
PreplitAI operates as a configuration-driven, multi-layer SaaS application:

```
[ Presentation Layer: React 18 / Tailwind Monochrome ]
                        │
                        ▼
    [ API Layer: Express 5 REST Routes ]
                        │
                        ▼
   [ Feature Gateway: FeatureGateway.authorize() ]
   - Subscription Guard & Lifecycle Check
   - Capability Registry Lookup
   - Usage Accounting & Unit Verification
   - Provider & Model Resolution
   - Infrastructure Cost & Analytics Logging
                        │
                        ▼
   [ Data & Infrastructure Layer ]
   - PostgreSQL (Versioned Plans, Capabilities, Usage Events, Audit Logs)
   - Stripe Subscription Gateway
   - Groq / Multi-Provider LLM Engine
```

## Core Schema Components
1. **Capabilities**: Normalized feature definitions (`ai.chat`, `ai.quiz`, `ai.flashcards`, `ai.video`, `export.pdf`).
2. **Provider & Model Decoupling**: AI model providers (`groq`, `openai`, `anthropic`) mapped dynamically via `provider_models`.
3. **Plan Versioning**: `subscription_plans` with version numbers and grandfathering support.
4. **Organizations**: Pre-configured schema for future Team, University, and Enterprise billing.
5. **System Audit Logs**: Isolated log tracking for administrative and business lifecycle events.
