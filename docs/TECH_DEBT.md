# PreplitAI — Technical Debt & Refactoring Backlog

## Critical Debt
- **Hardcoded Localhost API Endpoints**: Components currently fetch `http://localhost:5000` explicitly. Refactoring to a centralized `apiClient` service using `VITE_API_BASE_URL` is required for production deployments.

## High Priority Debt
- **State Monolith in `StudyCompanionWorkspace.tsx`**: State logic (document uploads, space changes, chat messages, tool outputs) is managed inside a single workspace file (~750 lines). Splitting into dedicated custom hooks (`useSpaces`, `useStudyTools`, `useDocuments`) will improve testability.

## Medium Priority Debt
- **Vector Search Engine**: Current RAG text matching relies on string search and basic chunk slicing. Upgrading to `pgvector` embeddings will enhance semantic retrieval accuracy.
