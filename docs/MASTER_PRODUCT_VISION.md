# PreplitAI Master Product Vision (Version 3.0)
**Track**: K-Startup Grand Challenge 2026, International Student Track
**Tagline**: Transform Any Study Material Into an Interactive Learning Experience — Built for Korea.

---

## Executive Summary

PreplitAI is an AI-powered interactive learning platform built for Korean university students and international students studying in Korea. It transforms static study materials — lecture slides, PDFs, textbooks, handwritten notes, YouTube videos, and recorded lectures — into a persistent, organized, and fully bilingual AI-powered learning workspace.

Unlike generic AI chatbots (ChatGPT, Claude) that start empty every session, PreplitAI builds a **grounded knowledge base** from each student's actual course materials and provides citation-backed answers, interactive assessments, and multi-source reasoning — all organized by subject in dedicated Study Spaces.

Our strategic wedge is **localization**: PreplitAI is architecturally built around how Korean universities teach, how Korean students budget, and the specific barriers international students face navigating Korean-language academic material. This is not a translation layer on a global product — it is a product designed for this market from the ground up.

---

## The Problem

Learning is scattered across PDFs, lecture slides, YouTube, generic chatbots, note-taking apps, flashcards, and quiz apps — students spend more time organizing information than learning it.

For students in Korea, the problem is sharper:
- Korean lecture materials and technical terminology are difficult for international students to parse.
- Professors often teach differently from the textbook, with limited support for students still building Korean fluency.
- Existing AI study tools (YouLearn, Quizlet, ChatGPT) are generic, English-first, and not built for the structure of Korean university courses.
- No competitor offers bilingual Korean/English academic translation, professor-pattern analysis, or semester-aligned pricing.

---

## The Solution

PreplitAI turns any learning material into a complete, bilingual AI-powered learning environment tailored to how Korean universities teach. Every uploaded document becomes an interactive classroom — organized by subject, persistent across sessions, and available in both Korean and English.

---

## Product Architecture: Two Layers

### Layer 1 — Table Stakes (Competitive Parity)

These are the foundational capabilities every serious AI learning platform must deliver. PreplitAI must execute all of these at parity or better:

#### Study Spaces (Workspace Management)
- Create multiple Spaces organized by course/subject
- Space title, icon/color customization
- Dedicated chat history per Space
- Independent AI memory for each Space
- Separate resource library inside each Space
- Persistent workspace — no need to re-upload or re-explain

#### Multi-Source Knowledge Base
- Upload PDFs, YouTube videos, lecture recordings, slides, notes, research papers
- Automatic processing pipeline: Upload → Extract text → OCR if needed → Chunk → Embed → Ready
- AI searches every uploaded source simultaneously and merges answers across documents

#### AI Tutor Chat (Grounded RAG)
- Not a generic chatbot — specifically designed to teach
- Remembers context across the full conversation
- Understands and reasons over uploaded material only (no hallucinated internet knowledge)
- Educational tone: defines, explains, expands, summarizes, clarifies
- Structured formatting: headings, numbering, bullets, paragraphs, references

#### Source Grounding & Citation Engine
- Every AI response contains references to specific pages or timestamps
- Clicking a citation scrolls the PDF viewer or video player to the exact location
- Classic RAG pipeline: Retrieve relevant chunks → Merge results → Generate explanation → Attach citations

#### Interactive PDF Reader
- PDF viewer with zoom, scroll, page navigation
- AI synced with document — citation jumping between chat and PDF
- Split-screen: PDF on left, AI Tutor on right — reading and asking happen simultaneously

#### Video Learning
- Upload lecture videos or YouTube links
- Speech recognition → Transcript → Embeddings → AI Search
- Chat while watching — AI answers from lecture content
- Timestamp-aware citations

#### Assessment & Feedback Loop
- AI asks a question → Student types free-text answer → AI grades answer → AI explains mistakes → Next question
- Not binary correct/wrong — qualitative feedback with reasoning, encouragement, and concept reinforcement
- Mimics human tutoring, not multiple-choice scoring

#### Continuous Conversation & Workspace Memory
- Chat history persists across sessions
- AI remembers all previous discussion within a Space
- Each Space remembers uploaded files, chat history, and learning progress

#### Cross-Document Reasoning
- Combines information from PDFs, lectures, slides, and videos into unified answers
- Natural language search — students ask questions instead of manually searching documents

#### Resource Library & Dashboard
- Resource cards with thumbnail, title, type, preview
- Dashboard: "What do you want to learn today?", recent Spaces, recent uploads, quick access
- Clean sidebar navigation: Home, Spaces, Recent chats, Resources, Uploads

---

### Layer 2 — Differentiation (What Makes PreplitAI Different)

These features go beyond what any competitor offers. They define PreplitAI's identity and justify our market position.

#### Tier 1 — Must Ship. Defines Our Identity.

**1. Korean Academic Assistant (Our Localization Edge)**
- Korean ↔ English academic translation in real-time
- Technical terminology explanations in context (not dictionary lookups — conceptual explanations)
- Course material simplification aligned with how Korean professors structure lectures
- Full support for Korean-language lecture notes, slides, and textbooks
- Bilingual UI and AI responses throughout the entire platform
- *Why it matters*: No competitor does this. This is our entire market wedge. Every international student in Korea who tries us once will feel the difference.

**2. Expected Exam Questions**
- Analyzes past exams and midterms to predict recurring topics, professor trends, and likely exam questions
- Pattern detection across multiple semesters of uploaded material
- *Why it matters*: This is the feature students will talk about. Students share exam prep tools with their entire class group chat — that's viral distribution for free.

**3. Flashcards + Spaced Repetition + Mastery Tracking**
- Auto-generated flashcard decks from uploaded material
- Spaced repetition scheduling (tracks what you got wrong, brings it back later)
- Mastery curve per topic — the difference between a tutoring session and a learning system
- *Why it matters*: Competitors stop at "assess understanding" with a single feedback loop. We track long-term mastery.

#### Tier 2 — High Impact. Ship Within First 3 Months.

**4. Interactive Learning Mode (Flagship Feature)**
- Drag-and-drop exercises generated from study material
- Interactive diagrams and visual animations
- Simulations and concept exploration
- Step-by-step problem solving
- Mini educational games and live demonstrations
- *Why it matters*: Flashy, demo-worthy, and genuinely effective for visual learners. Jaw-drop moment for pitch demos.

**5. AI Video Lecture Generator**
- Converts notes into AI-generated micro-lecture videos with voice narration and animated diagrams
- *Why it matters*: "Upload your notes, get a video lecture back" is a pitch-deck jaw-drop moment. Genuinely useful for students who learn better through video.

**6. Podcast Learning Mode**
- Converts study material into a conversational AI podcast
- Designed for passive learning while commuting (40+ minute Korean subway rides) or exercising
- *Why it matters*: Captures time no competitor touches.

**7. Smart Quiz Generator**
- Unlimited adaptive quizzes: MCQ, short answer, true/false, fill-in-the-blank
- Adapts difficulty based on performance

**8. AI Learning Analytics & Progress Dashboard**
- Identifies misunderstood concepts and repeated mistakes
- Builds a personalized study roadmap
- Topic mastery visualization, weak areas, predicted exam readiness
- *Why it matters*: Individual students want to see their weak spots. Institutions will demand this for the B2B tier.

#### Tier 3 — Future Roadmap. Design For Now, Ship Later.

**9. Adaptive Study Plans**
- AI-generated study schedules based on upcoming exam dates, topic difficulty, and student mastery level
- Requires sufficient usage data to be genuinely useful — build the data layer now, ship the feature when we have real student patterns

**10. Multi-Agent Tutoring**
- Specialized AI personas: Teacher, Examiner, Debate Coach, Coding Mentor
- Keep the architecture modular so personas can be added without rebuilding the chat system

**11. Code Execution & Programming Labs**
- In-browser code execution for CS students
- Park unless we see organic demand from CS departments

---

## Target Users
- **Primary**: Korean university students, International students studying in Korea, GKS Scholarship students, Exchange students
- **Secondary**: Universities and private academies (Institution tier), self-learners, global students

---

## Competitive Positioning

### vs YouLearn
YouLearn built a strong generic product for a global audience. PreplitAI matches their entire feature surface (Layer 1) and then adds 9+ differentiation features (Layer 2) they structurally cannot offer without rebuilding their product:
- No Korean language support or bilingual academic translation
- No expected exam question prediction
- No spaced repetition or mastery tracking
- No video lecture generation from notes
- No podcast mode
- No interactive simulations
- No Korean semester-aligned billing
- Priced in USD for American students

### vs ChatGPT / Claude
- **Purpose-built study workspace**: Persistent, organized Study Spaces vs disposable chat threads
- **Grounded in your material**: Every answer cites your uploaded documents — no hallucinated internet knowledge
- **Bilingual & Korea-localized**: Korean academic terminology, professor lecture alignment, bilingual interface
- **Student-budget pricing**: ₩9,900 – ₩12,900/month vs $20/month
- **Dedicated learning modes**: Interactive simulations, exam prediction, podcasts, video lectures, mastery analytics

### Strategic Moat
Localization is not a translation layer — it is a product architecture decision. PreplitAI is built *for* Korean university students in a way global competitors structurally cannot replicate without rebuilding their product from the ground up.

---

## Pricing Structure

| Tier | Price | What's Included |
| :--- | :--- | :--- |
| **Free** | ₩0/month | Limited uploads, limited AI chats per day, basic quizzes. Zero commitment. |
| **Student Pro** | ₩9,900–₩12,900/month (semester bundle available) | Unlimited AI chats & uploads, Interactive Learning, video lectures, podcast mode, exam prediction, full analytics. |
| **Institution** | Custom (contact sales) | Bulk seats, admin dashboard, LMS integration, SAML SSO, institution-wide analytics. |

---

## K-Startup Grand Challenge Pitch — 5 Demo Moments

1. **Live demo**: Upload a Korean-language PDF → ask a question in English → get a bilingual answer with page citations
2. **Expected Exam Questions**: Show it predicting questions from past midterm papers
3. **Interactive Learning Mode**: Show a drag-and-drop simulation generated from uploaded biology notes
4. **Pricing slide**: ₩9,900/month vs $20/month competitors — "built for Korean student budgets"
5. **Video lecture generation**: Upload handwritten notes → get a narrated micro-lecture back

---

## One-Line Pitch
> "PreplitAI transforms PDFs, lectures, textbooks, and videos into a bilingual AI tutor — interactive simulations, quizzes, video lectures, and predicted exams — built specifically for Korean and international university students in Korea."
