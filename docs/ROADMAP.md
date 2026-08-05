# PreplitAI — Product & Engineering Roadmap

## Immediate Tasks (Current Sprint)
1. **API Client & Environment Centralization**: Create `src/lib/apiClient.ts` to replace all `http://localhost:5000` instances with `import.meta.env.VITE_API_BASE_URL`.
2. **Server-Side Credit Deduction Middleware**: Attach automatic transactional credit deduction via `CreditService.deduct()` to AI action routes (`/quiz`, `/flashcards`, `/summary`, `/podcast`, `/expected-exam`, `/chat`).
3. **pgvector Indexing Migration**: Upgrade vector text retrieval from PostgreSQL `ILIKE`/tsvector to `pgvector` HNSW indexes for high-volume semantic document retrieval.

## 30-Day Plan (Launch Readiness)
- Complete FFmpeg local worker loop for rendering MP4 video lectures.
- Implement Passkeys / WebAuthn and Multi-Factor Authentication (MFA).
- Set up Sentry error reporting & OpenTelemetry metrics monitoring.

## 90-Day Plan (Enterprise & Scaling)
- Redis response caching for repeated document chunk embeddings.
- Team & Institution Workspace sharing with Role-Based Access Control (RBAC).
- Multi-region database replication for enterprise SLA compliance.
