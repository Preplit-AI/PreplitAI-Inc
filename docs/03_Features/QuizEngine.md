---
Document:
  Name: Quiz Engine
  Version: 1.0
  Status: Living Master Specification
  Owner: PreplitAI Core Architecture Team
  Reviewers:
    - Executive Team
    - AI Research
    - Core Engineering
    - Product & Design
  Last Updated: 2026-08-06
  Priority: P0
  Related Documents:
    - docs/00_Company/Vision.md
    - docs/01_Research/LearningScience.md
    - docs/04_AI/AIArchitecture.md
    - docs/05_Architecture/Database.md
---

# 03_Features — Quiz Engine

## 1. Executive Summary
Quiz Engine is an integral module of PreplitAI, transforming static educational inputs into interactive cognitive assets.

## 2. Vision
To provide a seamless, AI-native experience that maximizes long-term student retention and conceptual mastery.

## 3. Educational Problem
Students struggle with information overload and passive studying, resulting in high cognitive strain and poor recall.

## 4. Market Opportunity
Differentiates PreplitAI from generic chatbot wrappers by offering a purpose-built educational tool.

## 5. Learning Science Foundation
- **Retrieval Practice (Roediger & Karpicke)**: Promotes active recall over passive re-reading.
- **Cognitive Load Theory (Sweller)**: Minimizes extraneous cognitive load via structured UI.

## 6. User Personas
- **University Student**: Seeking efficient midterm & final preparation.
- **International Scholar**: Requiring localized, bilingual academic terminology support.

## 7. User Stories
> "As a student, I want to engage with Quiz Engine so that I can master my course material faster and verify my knowledge with confidence."

## 8. User Journey
```
[Open Space] ──► [Select Quiz Engine] ──► [Engage Interactive Workflow] ──► [Review Analytics & Mastery]
```

## 9. Functional Requirements (FR)
- **FR-001**: System shall ingest course material and generate active learning prompts for Quiz Engine.
- **FR-002**: System shall support bilingual KR/EN language toggling natively.
- **FR-003**: System shall ground all generated insights in uploaded course materials with source citations.

## 10. Non-Functional Requirements (NFR)
- **NFR-001 Latency**: Response generation start under 1.2s.
- **NFR-002 Availability**: 99.9% uptime.
- **NFR-003 Privacy**: Data encrypted in transit (TLS 1.3) and at rest (AES-256). Zero model retraining on student files.

## 11. UX/UI Specification
Integrated directly into ToolPanel.tsx and DocumentViewer.tsx with dark mode (#0a0a0a) and dark red academic accents (#630000 / #c84040).

## 12. Accessibility Requirements
WCAG 2.1 AA compliant, full keyboard navigation, screen reader ARIA narration tags.

## 13. System Architecture
```
Client Input ──► API Gateway ──► Quiz Engine Processor Service ──► Vector Database ──► LLM Stream
```

## 14. AI Pipeline
- Embeddings: text-embedding-3-large + BGE-M3
- Reranker: Cohere Rerank v3
- LLM Router: Claude 3.5 Sonnet / GPT-4o-mini

## 15. Database Schema
```sql
CREATE TABLE quizengine_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 16. API Specification
`POST /api/v1/quizengine/process`
```json
{ "space_id": "uuid", "action": "execute", "language": "ko" }
```

## 17. Security & Privacy
Isolated tenant sandboxing per user. Multi-region data redundancy.

## 18. Analytics & KPIs
- Activation Rate: > 45%
- Concept Mastery Delta: +25% retention

## 19. Risks & Edge Cases
- Insufficient Context: Handled via explicit context boundary notifications.

## 20. Testing Strategy
Automated unit tests, continuous integration regression suites, and human-in-the-loop pedagogical benchmarks.

## 21. Future Versions
- **v1.0**: Initial grounded release.
- **v2.0**: Multi-agent adaptive persona feedback.

## 22. Acceptance Criteria
- [x] Grounded outputs verified against space source files.
- [x] Zero latency lag during interactive UI state transitions.

## 23. Open Questions
- Optimal embedding chunk sizes for hyper-specialized technical jargon.

## 24. References
- Sweller, J. (1988). Cognitive load during problem solving.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning.
