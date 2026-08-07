# Master PreplitAI Specification (Version 4.0 — Master Source of Truth)

**Document Status**: Living Master Specification (IPO-Grade Blueprint & Product Requirements Document)  
**Authors**: Multidisciplinary Startup Strategy & Product Architecture Team  
**Target Audience**: Investors, Accelerators, University Enterprise Partners, Engineers, Designers, Product Managers, Enterprise Clients, Future Team  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Company Identity](#2-company-identity)
3. [Problem Statement](#3-problem-statement)
4. [Market Research](#4-market-research)
5. [User Personas](#5-user-personas)
6. [Product Vision](#6-product-vision)
7. [Product Philosophy](#7-product-philosophy)
8. [Feature Bible](#8-feature-bible)
9. [Complete User Journey](#9-complete-user-journey)
10. [AI Architecture](#10-ai-architecture)
11. [Technical Architecture](#11-technical-architecture)
12. [UI/UX System](#12-uiux-system)
13. [Pricing](#13-pricing)
14. [Business Model](#14-business-model)
15. [Growth Strategy](#15-growth-strategy)
16. [Go-To-Market Strategy](#16-go-to-market-strategy)
17. [Competitive Analysis](#17-competitive-analysis)
18. [KPI Framework](#18-kpi-framework)
19. [Product Roadmap](#19-product-roadmap)
20. [Risks & Mitigation](#20-risks--mitigation)
21. [Appendices](#21-appendices)

---

## 1. Executive Summary

### Mission
To democratize 1-on-1 human-grade tutoring for every student on earth by building the world's most intelligent, adaptive, multi-source AI Learning Operating System.

### Vision
A world where educational background, language barriers, geographic location, or socioeconomic status no longer limit academic human potential. PreplitAI aims to become the universal cognitive layer for human knowledge acquisition.

### Core Philosophy
- **Grounding over Guessing**: AI must strictly cite authoritative course materials with verifiable page and timestamp references.
- **Active Engagement over Passive Consumption**: Reading and watching are passive; learning happens when students query, test, sequence, debate, and teach back.
- **Localization as Architecture**: Academic nuances in non-English higher education (e.g., South Korean university lecture structures, GKS international scholar dynamics) require custom RAG pipelines, contextual translation, and localized pricing—not a generic translation wrapper.

### Strategic Timeline
- **5-Year Ambition**: Become the primary study OS across South Korean universities, East Asia, and top international higher-education systems with 5M+ Active Learners.
- **10-Year Ambition**: Power the core cognitive AI infrastructure for 1,000+ global universities, K-12 school districts, and corporate upskilling programs.
- **20-Year / Moonshot Vision**: Achieve true neural adaptive learning—an autonomous, hyper-personalized AI Professor that co-evolves with a human from early childhood through post-doctoral research.

---

## 2. Company Identity

### Brand Personality & Positioning
- **Personality**: Professional, authoritative, empathetic, rigorous, state-of-the-art.
- **Voice**: Clean, zero-emoticon, concise, academic yet approachable.
- **Positioning**: The Enterprise-Grade AI Study Workspace for Serious Learners.

### Core Decision Framework
1. **Student Outcome Obsession**: Every UI element, prompt, and micro-animation must demonstrably improve retention or reduce study anxiety.
2. **Deterministic Citation Integrity**: If the AI cannot ground an answer in uploaded materials, it must transparently state context limits rather than hallucinate.
3. **Privacy & Security First**: Student notes, proprietary university lectures, and past exams (Jokbo) must remain end-to-end encrypted and never used for public model training.

---

## 3. Problem Statement

### Deep Analysis of the Educational Crisis
- **Fragmented Tools**: Students juggle PDFs in Adobe Acrobat, lecture videos on YouTube/LMS, flashcards in Anki/Quizlet, notes in Notion, and Q&A in generic chatbots (ChatGPT/Claude).
- **The Passive Learning Trap**: Re-reading notes and highlighting PDFs yield less than 15% long-term retention compared to active retrieval practice (80%+).
- **The Global Student & Multilingual Barrier**: In non-English higher-education hubs (such as South Korea with over 200,000 international students), academic jargon, fast-paced lectures, and bilingual exams present severe academic friction.
- **Hallucination in Generic AI**: Generic LLMs lack strict citation grounding, hallucinate historical and mathematical facts, and operate in isolated, disposable chat sessions without long-term space memory.

---

## 4. Market Research

### Market Sizing (TAM / SAM / SOM)
- **Global EdTech Market (TAM)**: $404 Billion by 2025 (CAGR 16.3%).
- **AI-Powered Learning Platforms (SAM)**: $25.7 Billion.
- **Korean & East Asian University AI Market (SOM)**: $850 Million (Focusing initially on Korean domestic students & international scholars).

### SWOT Matrix
```
+-------------------------------------------------+-------------------------------------------------+
| STRENGTHS                                       | WEAKNESSES                                      |
| • 9 integrated AI learning tools in 1 space     | • High token cost for multi-source indexing     |
| • Deterministic citation & grounded RAG         | • Brand awareness building vs OpenAI/Google    |
| • Native Korean/English academic localization   |                                                 |
+-------------------------------------------------+-------------------------------------------------+
| OPPORTUNITIES                                   | THREATS                                         |
| • K-Startup Grand Challenge & Korean Uni B2B    | • Rapid model iteration from frontier AI labs   |
| • GKS International Scholar Expansion           | • Free basic AI tools bundled in LMS systems    |
+-------------------------------------------------+-------------------------------------------------+
```

---

## 5. User Personas

| Persona | Goals | Key Pain Points | Primary AI Feature Used |
| :--- | :--- | :--- | :--- |
| **Min-jun (Domestic Korean Student)** | High GPA, Ace Midterms/Finals | Complex English textbooks & heavy exam volume | Expected Exam Qs & Flashcards |
| **Sarah (GKS International Scholar)** | Master Korean lectures & technical terms | Language barrier during live lectures & slides | Korean Academic Assistant & Audio Podcast |
| **Dr. Park (University Professor)** | Efficient assignment & quiz generation | Manual grading & plagiarism verification | Teacher Analytics & Quiz Generator |

---

## 6. Product Vision & Architecture

PreplitAI is an **AI-Native Learning Operating System**. 
It replaces disposable chat prompts with **Persistent Study Spaces**. A Study Space acts as a living knowledge repository that ingests multi-source course materials (PDFs, YouTube videos, lecture recordings, code, notes) and unifies them into a single grounded graph.

```
                    +--------------------------------------------------+
                    |             PREPLITAI STUDY SPACE                |
                    +--------------------------------------------------+
                                             |
    +-------------------+--------------------+-------------------+-------------------+
    |                   |                    |                   |                   |
[PDFs & Slides]  [YouTube & Audio]  [Handwritten Notes]  [Code Files]   [Past Exams / Jokbo]
    |                   |                    |                   |                   |
    +-------------------+--------------------+-------------------+-------------------+
                                             |
                                             v
                      +----------------------------------------------+
                      |    MULTI-SOURCE HYBRID RAG VECTOR PIPELINE   |
                      +----------------------------------------------+
                                             |
                                             v
       +-------------------------------------+-------------------------------------+
       |                                     |                                     |
       v                                     v                                     v
[Grounded AI Chat & Citation Engine]   [9 Interactive AI Tools]            [Analytics & SRS Engine]
• Page & Paragraph References          • Flashcards (SRS)                 • Weakness Detection
• Timestamp Video Sync                 • Smart Quizzes                    • Exam Readiness %
• Side-by-Side Document Viewer         • Expected Exam Qs                 • Topic Mastery Graphs
                                       • Podcast & Audio Generator        
                                       • Interactive Simulations          
```

---

## 7. Product Philosophy

1. **Mastery-First**: Moving from binary scoring (Correct/Wrong) to qualitative conceptual feedback.
2. **Cognitive Load Minimization**: UI should present non-scrollable, immediate tab access to all 8 workspace tools without nested navigation drawers.
3. **Multi-Source Synthesis**: Answers must synthesize insights across all documents in a Space simultaneously.

---

## 8. Feature Bible (Exhaustive Technical Specification)

### 8.1 AI Study Chat (Grounded RAG)
- **Purpose**: Answer student queries strictly using uploaded course materials.
- **Workflow**: Student enters query → Embeddings & Hybrid Keyword Search retrieve Top-K chunks → LLM synthesizes response → UI attaches interactive page citations.
- **Technical Spec**: RAG engine uses Qdrant hybrid search + Claude 3.5 Sonnet / GPT-4o-mini. Page citations jump directly to bounding boxes in `DocumentViewer.tsx`.
- **Edge Cases**: No matching documents → System emits explicit "Context Window Limit: Material not covered in uploaded files".

### 8.2 Smart Flashcards & Spaced Repetition (SRS)
- **Purpose**: Auto-extract key concepts and schedule active recall decks.
- **Algorithm**: Modified SM-2 Spaced Repetition Algorithm. Ratings: `Hard` (1 day), `Good` (3 days), `Easy` (7 days).
- **Database Schema**:
  ```sql
  CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES spaces(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INT DEFAULT 1,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

### 8.3 Smart Quiz Generator & Qualitative Assessment
- **Purpose**: Generate MCQ, Short Answer, and Fill-in-the-blank practice quizzes.
- **Qualitative Grading Engine**: Student submits free-text response → AI evaluates correctness, identifies conceptual gaps, provides constructive feedback, and recommends relevant PDF pages for review.

### 8.4 Interactive Learning Mode (Flagship)
- **Purpose**: Provide active, non-textual learning exercises (sequence ordering, concept matching, diagram labeling, fill gaps).
- **Implementation**: Rendered in `InteractiveLearningView.tsx` with Framer Motion animations.

### 8.5 Podcast Learning Mode
- **Purpose**: Convert course notes into a 2-speaker conversational podcast script and generate synthetic audio via Web Speech API / ElevenLabs API.
- **Use Case**: Commuting on Korean subways or walking.

### 8.6 AI Summary Notes
- **Purpose**: Extract high-yield summary cheat sheets, key formulas, and main chapter concepts into markdown.

### 8.7 Expected Exam Questions (Professor Pattern Analysis)
- **Purpose**: Analyze past midterm exams (Jokbo) alongside course slides to predict likely exam questions for midterms/finals.
- **Prompt Strategy**: Identifies recurring formula patterns, diagram types, and professor emphasis areas.

### 8.8 AI Learning Analytics Dashboard
- **Purpose**: Provide visual mastery metrics, weekly study minutes, topic breakdown radar charts, and readiness scores.

### 8.9 Korean Academic Assistant
- **Purpose**: Real-time Korean ↔ English academic terminology simplification and bilingual UI context switching.

---

## 9. Complete User Journey

```
[Discovery / Landing Page] ──► [1-Click Auth] ──► [Create Space] ──► [Upload Material]
                                                                            │
                                                                            ▼
[Master Concept] ◄── [Analytics Dashboard] ◄── [Interactive Tool] ◄── [Grounded AI Chat]
```

---

## 10. AI Architecture

### RAG Pipeline & Multi-Agent Routing
```
User Query ──► Query Rewriter ──► Hybrid Dense/Sparse Search (Qdrant) ──► Reranker (Cohere) ──► LLM Generator
```
- **Dense Embeddings**: `text-embedding-3-large` (OpenAI)
- **Bilingual Embeddings**: `BGE-M3` for Korean/English semantic alignment
- **Reranker**: Cohere Rerank v3
- **Context Window Buffer**: 128k context with dynamic chunk truncation

---

## 11. Technical Architecture

### Tech Stack
- **Frontend Framework**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn UI
- **State Management**: React Query + LanguageContext + AuthContext
- **Backend API**: Node.js Express + Python FastAPI (Microservice for OCR & PDF Processing)
- **Database**: PostgreSQL (Prisma ORM) + Redis (Session/Rate Limiting) + Qdrant (Vector DB)
- **Hosting**: AWS ECS / Vercel + Cloudflare WAF / CDN

---

## 12. UI/UX System

- **Design Philosophy**: High contrast, minimal noise, zero emoticons, state-of-the-art dark mode.
- **Color Palette**:
  - Dark Red Accent: `#630000` / `#c84040`
  - Dark Surface: `#0a0a0a` / `#111111`
  - Light Surface: `#ffffff` / `#fafafa`
- **Typography**: Inter (UI font), Outfit (Headings), JetBrains Mono (Code/Formulas).

---

## 13. Pricing Strategy

| Tier | Price (KRW) | Price (USD) | Target Audience | Key Inclusions |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | ₩0 / mo | $0 / mo | Casual Learners | 3 Spaces, basic chat, 5 uploads/mo |
| **Student Pro** | ₩9,900 / mo | $8.99 / mo | University Students | Unlimited Spaces, All 9 AI Tools, Exam Predictor |
| **Semester Pass**| ₩39,900 / semester | $34.99 / term | Active Scholars | 4-month full access bundle (25% discount) |
| **Institution** | Custom B2B | Custom | Universities & Academies | LMS Integration, SSO, Enterprise Analytics |

---

## 14. Business Model & Growth Strategy

- **B2C Campus Ambassador Network**: Student leads at Seoul National University, Yonsei, Korea University, KAIST, and Hanyang.
- **Viral Referral Loop**: "Share your Study Space with a classmate to get 1 month of Student Pro free."
- **B2B University Licensing**: Departmental licenses for international scholar support offices.

---

## 15. Competitive Analysis

| Feature | PreplitAI | ChatGPT Plus | YouLearn | Anki / Quizlet |
| :--- | :---: | :---: | :---: | :---: |
| **Multi-Source Grounded RAG** | ✅ Yes | ❌ Limited | ✅ Yes | ❌ No |
| **Strict Page & Timestamp Citations** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Expected Exam Predictor (Jokbo)** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Bilingual Korean/English Assistant**| ✅ Native | ⚠️ Generic | ❌ No | ❌ No |
| **Integrated SRS Flashcards & Quizzes** | ✅ Yes | ❌ No | ⚠️ Basic | ✅ Flashcards only |
| **Interactive Simulations & Drag-and-Drop**| ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Semester Bundle Pricing (KRW)** | ✅ Yes | ❌ No ($20) | ❌ No ($15) | ⚠️ Freemium |

---

## 16. Product Roadmap

- **Phase 1 (Q1 2026)**: Core Foundation & 9 Tools Polish (Completed).
- **Phase 2 (Q2 2026)**: Canvas / Mind Map Workspace & Live Collaborative Study Rooms.
- **Phase 3 (Q3 2026)**: Mobile Native App Launch (iOS & Android) + LMS Integrations.
- **Phase 4 (Q4 2026)**: Global Expansion into Japan, Vietnam, and Southeast Asian higher-education markets.

---

## 17. Appendices

### API Endpoint Specifications
- `POST /api/v1/spaces` — Create a new Study Space
- `POST /api/v1/documents/upload` — Ingest PDF, YouTube URL, or notes
- `POST /api/v1/chat/query` — RAG retrieval query with citations
- `GET /api/v1/analytics/mastery` — Retrieve learning analytics graph

---
*End of Master PreplitAI Specification (v4.0)*
