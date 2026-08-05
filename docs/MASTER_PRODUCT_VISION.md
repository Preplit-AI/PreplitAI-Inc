# PreplitAI — Master Product Vision & Architectural Specification (v1.0)

## Executive & Product Summary
PreplitAI is **the world's first complete AI-powered interactive study companion** designed specifically for Korean university students and international students studying in Korea (GKS scholars, exchange students).

Rather than serving as a passive Q&A document search engine, PreplitAI transforms static study materials (PDFs, lecture slides, textbooks, handwritten notes, YouTube videos, recorded lectures) into **interactive classrooms**.

```
                       [ USER STUDY MATERIALS ]
     (PDFs • Slides • YouTube • Audio Lectures • Images • Past Exams)
                                  │
                                  ▼
                     [ PREPLITAI STUDY WORKSPACE ]
  ┌──────────────────────────────────────────────────────────────┐
  │ 1. AI Study Chat (Grounded RAG Context & Multilingual)       │
  │ 2. Interactive Learning Mode (Simulations, Diagrams, Games) │
  │ 3. AI Video Lecture Generator (Voice Narration & Avatars)    │
  │ 4. Podcast Learning Mode (Dual-Speaker Audio Discussions)    │
  │ 5. Smart Flashcards (Active Recall & Memory Cards)           │
  │ 6. Smart Quiz Generator (Adaptive MCQ, Fill-in, Short Ans)   │
  │ 7. Expected Exam Questions (Past Paper Pattern Analytics)    │
  │ 8. AI Learning Analytics (Misunderstanding & Roadmap Engine) │
  │ 9. Korean Academic Assistant (KR ↔ EN Academic Translation)   │
  └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                   [ SUBSCRIPTION SAAS ENGINE ]
       Free Tier • Pro Plan ($19/mo) • Max Plan ($49/mo) • Enterprise
```

---

## The 9 Core Pillar Architecture

| Pillar # | Feature Name | Core Functionality | Differentiator |
| :--- | :--- | :--- | :--- |
| **1** | **AI Study Chat** | Grounded multi-doc Q&A across PDFs, slides, YouTube & recorded audio | Remembers course context & teaches concepts rather than returning static raw text snippets. |
| **2** | **Interactive Learning Mode** | Drag-and-drop exercises, visual simulations, interactive diagrams, mini-games | **Flagship Feature**: Students learn by interacting directly with visual simulations. |
| **3** | **AI Video Lecture Generator** | Converts notes into AI-narrated video lectures with animated slides | Allows students to watch personalized video lessons generated on-demand. |
| **4** | **Podcast Learning Mode** | Converts course material into 2-speaker conversational audio episodes | Enables hands-free passive learning during commutes or exercise. |
| **5** | **Smart Flashcards** | Auto-generates active recall flashcard decks from space documents | Adaptive space repetition tailored to student mastery levels. |
| **6** | **Smart Quiz Generator** | Unlimited adaptive quizzes (MCQ, short answer, fill-in-the-blank) | Difficulty dynamically scales based on user accuracy history. |
| **7** | **Expected Exam Questions** | Analyzes historical past papers, midterms, and finals for question patterns | **Unique Feature**: Predicts exam questions, professor trends, and question frequency. |
| **8** | **AI Learning Analytics** | Pinpoints exact concept misunderstandings and creates a study roadmap | Explains *why* concepts were missed instead of just returning raw scores. |
| **9** | **Korean Academic Assistant** | Academic Korean ↔ English translation and technical jargon simplify | Solves the specific language barrier faced by domestic and international students in Korea. |

---

## Competitive Matrix & Positioning

| Platform | Grounded Chat | Adaptive Quiz | Flashcards | AI Video | Interactive Mode | Exam Prediction | KR Assistant |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ChatGPT** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **NotebookLM** | ✅ | Limited | ❌ | Audio Only | ❌ | ❌ | ❌ |
| **YouLearn.ai** | ✅ | ✅ | ✅ | Limited | ❌ | ❌ | ❌ |
| **PreplitAI** | **✅** | **✅** | **✅** | **✅** | **✅** | **✅** | **✅** |

---

## Target Audience & Growth Strategy
- **Primary Market**: Korean university students & International students in Korea (GKS Scholarship students, exchange students).
- **Secondary Market**: Global university students, language institutes, and higher-ed institutions.
- **Monetization**: Subscription-First SaaS (**Free Plan**, **Pro Plan $19/mo**, **Max Plan $49/mo**).
