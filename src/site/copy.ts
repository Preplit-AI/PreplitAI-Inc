import type { Lang } from "@/lib/lang";

/*
 * Every word on the public site. Korean is written first; English is the
 * translation (brand book, "Write the Korean first"). No line names the
 * machinery, promises a grade, or shows a number the product did not measure;
 * example content is always labelled as an example.
 */

type DemoCard = { front: string; back: string };

export type SiteCopy = {
  meta: { title: string; description: string };
  nav: { learn: string; remember: string; privacy: string; login: string; start: string; switchTo: string; switchLabel: string; menu: string };
  hero: { title: [string, string]; body: string; cta: string; secondary: string; pilotNote: string };
  example: {
    badge: string; course: string; lecture: string; topic: string; meta: string; summary: string;
    flagLabel: string; flagQuote: string; flagAt: string; junbee: string;
  };
  belief: { title: string; body: string };
  learn: { name: string; line: string; steps: { title: string; body: string }[] };
  remember: {
    name: string; line: string; stepTitle: string; body: string;
    demo: {
      badge: string; today: (n: number) => string; reveal: string; ratings: [string, string, string, string];
      done: (n: number) => string; restart: string; hint: string; combLabel: (done: number, total: number) => string;
      course: string; cards: DemoCard[];
    };
  };
  junbee: { title: string; body: string; messages: { when: string; text: string }[] };
  promise: { line: string; items: { title: string; body: string }[]; privacyLink: string };
  final: { title: string; body: string; cta: string };
  footer: { privacy: string; contact: string; company: string };
};

const ko: SiteCopy = {
  meta: {
    title: "Junbee · 준비됐어?",
    description: "강의를 녹음해서 올리면 믿을 수 있는 노트가 되고, 노트는 하루 5분 복습 카드가 돼요.",
  },
  nav: {
    learn: "배움",
    remember: "기억",
    privacy: "개인정보",
    login: "로그인",
    start: "시작하기",
    switchTo: "EN",
    switchLabel: "Read this page in English",
    menu: "메뉴",
  },
  hero: {
    title: ["출석했잖아.", "이제 남는 것도 있어야지."],
    body: "강의를 녹음해서 올리면 믿을 수 있는 노트가 되고, 노트는 하루 5분 복습 카드가 돼요.",
    cta: "파일럿 참여하기",
    secondary: "어떻게 쓰는지 보기",
    pilotNote: "지금은 한 과목의 학생들과 먼저 써 보고 있어요.",
  },
  example: {
    badge: "예시",
    course: "운영체제",
    lecture: "9주차",
    topic: "교착 상태",
    meta: "50분 녹음 · 카드 8장",
    summary: "프로세스들이 서로가 가진 자원을 기다리며 아무도 진행하지 못하는 상태. 네 가지 조건이 한꺼번에 성립할 때만 생긴다.",
    flagLabel: "시험에 나온다고 한 부분",
    flagQuote: "“네 가지 조건은 중간고사에 나옵니다.”",
    flagAt: "31:05",
    junbee: "12~14분은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다.",
  },
  belief: {
    title: "학생들은 게으르지 않아요. 늦을 뿐이에요.",
    body: "중간고사가 3주 남았다는 걸, 4주차 강의가 시험의 전부였다는 걸 늦게 알게 되죠. 의지의 문제가 아니라 준비의 문제예요. Junbee는 이미 하고 있는 일, 강의실에 앉아 있는 시간을 준비로 바꿔요.",
  },
  learn: {
    name: "배움",
    line: "받아적지 마. 듣기만 해.",
    steps: [
      {
        title: "녹음해요",
        body: "강의실에서 휴대폰 녹음 앱으로 녹음하고, 끝나면 파일을 올려요. 강의 중에는 듣기만 하면 돼요.",
      },
      {
        title: "노트가 와요",
        body: "몇 분 뒤 노트가 도착해요. 교수님이 시험에 나온다고 한 부분은 따로 모아 두고, 잘 안 들린 부분은 [불명확]으로 남겨요.",
      },
    ],
  },
  remember: {
    name: "기억",
    line: "하루 5분이면 안 잊는다.",
    stepTitle: "하루 5분 복습해요",
    body: "강의마다 노트에서 카드 5~10장을 뽑아, 잊을 때쯤 다시 보여줘요. 오늘 카드를 다 보면 오늘은 끝이에요.",
    demo: {
      badge: "예시",
      today: (n) => `오늘의 ${n}장`,
      reveal: "답 보기",
      ratings: ["다시", "어려움", "알맞음", "쉬움"],
      done: (n) => `오늘 카드 ${n}장을 모두 봤어요.`,
      restart: "처음부터 다시",
      hint: "직접 넘겨 보세요. 한 장을 끝낼 때마다 칸이 하나 채워져요.",
      combLabel: (done, total) => `오늘 카드 ${total}장 중 ${done}장 복습함`,
      course: "운영체제 9주차",
      cards: [
        { front: "교착 상태(deadlock)란?", back: "프로세스들이 서로가 가진 자원을 기다리며 아무도 진행하지 못하는 상태." },
        { front: "교착 상태가 생기는 네 가지 조건은?", back: "상호 배제, 점유 대기, 비선점, 순환 대기." },
        { front: "순환 대기를 막는 방법 하나는?", back: "자원에 순서를 매기고, 그 순서대로만 요청하게 한다." },
      ],
    },
  },
  junbee: {
    title: "Junbee가 하는 말은 세 가지뿐이에요.",
    body: "Junbee는 노트 작업이 끝났을 때만 말해요. 재촉하지 않고, 칭찬하지 않고, 하지 못한 일은 숨기지 않아요.",
    messages: [
      { when: "노트가 준비됐을 때", text: "9주차 노트 정리했어요. 카드 8장." },
      { when: "일부가 잘 안 들렸을 때", text: "12~14분은 잘 안 들려서 [불명확]으로 두었어요 — 추측해서 채우지 않았습니다." },
      { when: "노트를 만들지 못했을 때", text: "이 녹음은 노트로 만들지 못했어요. 저장된 건 없습니다." },
    ],
  },
  promise: {
    line: "배운 것 전부, 배우지 않은 것은 하나도.",
    items: [
      {
        title: "세지 않은 숫자는 보여주지 않아요",
        body: "연속 학습일, 숙련도 점수, 자신감 지수 같은 건 없어요. 화면의 숫자는 모두 실제로 센 것이에요.",
      },
      {
        title: "녹음은 바로 지워요",
        body: "녹음 파일은 글로 옮긴 직후 서버에서 지워요. 남는 건 녹취록, 노트, 카드뿐이에요.",
      },
      {
        title: "여러분의 것이에요",
        body: "노트와 카드는 다른 사람과 공유하지 않고 학습 데이터로 쓰지 않아요. 계정을 지우면 전부 함께 지워져요.",
      },
      {
        title: "지금은 두 가지만 해요",
        body: "파일럿에서는 배움과 기억만 해요. 할 수 없는 일을 할 수 있는 척하지 않아요.",
      },
    ],
    privacyLink: "개인정보 처리방침 읽기",
  },
  final: {
    title: "준비, 시작!",
    body: "파일럿에 참여해서 이번 주 강의부터 녹음해 보세요.",
    cta: "파일럿 참여하기",
  },
  footer: { privacy: "개인정보 처리방침", contact: "문의", company: "© 2026 PreplitAI, Inc." },
};

const en: SiteCopy = {
  meta: {
    title: "Junbee · Ready when it matters.",
    description: "Record the lecture and upload it. You get notes you can trust, and the notes become five minutes of review a day.",
  },
  nav: {
    learn: "Learn",
    remember: "Remember",
    privacy: "Privacy",
    login: "Log in",
    start: "Get started",
    switchTo: "한국어",
    switchLabel: "이 페이지를 한국어로 보기",
    menu: "Menu",
  },
  hero: {
    title: ["You went to the lecture.", "Now have something to show for it."],
    body: "Record the lecture and upload it. You get notes you can trust, and the notes become five minutes of review a day.",
    cta: "Join the pilot",
    secondary: "See how it works",
    pilotNote: "Right now we are trying it with the students of one course.",
  },
  example: {
    badge: "Example",
    course: "Operating Systems",
    lecture: "Week 9",
    topic: "Deadlock",
    meta: "50-minute recording · 8 cards",
    summary: "Processes each wait for a resource another one holds, so none of them can proceed. It only happens when four conditions hold at once.",
    flagLabel: "Flagged for the exam",
    flagQuote: "“The four conditions will be on the midterm.”",
    flagAt: "31:05",
    junbee: "Minutes 12–14 were hard to hear, so I marked them [unclear] instead of guessing.",
  },
  belief: {
    title: "Students are not lazy. They are late.",
    body: "Late to find out the midterm is in three weeks, late to realise the week-four lecture was the one the exam is built on. That is not a willpower problem. It is a preparation problem. Junbee turns what you already do, sitting in the lecture, into being ready.",
  },
  learn: {
    name: "Learn",
    line: "Don't write it down. Just listen.",
    steps: [
      {
        title: "Record it",
        body: "Record the lecture with your phone's voice recorder and upload the file afterwards. In class, you only have to listen.",
      },
      {
        title: "Notes arrive",
        body: "A few minutes later your notes arrive. Whatever the lecturer said would be on the exam is gathered in one place, and anything that could not be heard stays marked [unclear].",
      },
    ],
  },
  remember: {
    name: "Remember",
    line: "Five minutes a day and it stays.",
    stepTitle: "Review for five minutes",
    body: "Each lecture's notes become 5 to 10 cards, shown again just before you would forget them. When today's cards are done, you are done for the day.",
    demo: {
      badge: "Example",
      today: (n) => `Today's ${n} cards`,
      reveal: "Show answer",
      ratings: ["Again", "Hard", "Good", "Easy"],
      done: (n) => `You have seen all ${n} of today's cards.`,
      restart: "Start over",
      hint: "Try it. Each card you finish fills one cell.",
      combLabel: (done, total) => `${done} of today's ${total} cards reviewed`,
      course: "Operating Systems, week 9",
      cards: [
        { front: "What is a deadlock?", back: "A state where processes each wait for a resource another holds, so none can proceed." },
        { front: "What are the four conditions for deadlock?", back: "Mutual exclusion, hold and wait, no preemption, circular wait." },
        { front: "One way to prevent circular wait?", back: "Number the resources and only ever request them in that order." },
      ],
    },
  },
  junbee: {
    title: "Junbee says three things. That is all.",
    body: "Junbee speaks only when a lecture's notes are finished. It does not nag, it does not celebrate, and it never hides what it could not do.",
    messages: [
      { when: "When notes are ready", text: "Week 9 notes are ready. 8 cards." },
      { when: "When part was hard to hear", text: "Minutes 12–14 were hard to hear, so I marked them [unclear] instead of guessing." },
      { when: "When nothing could be made", text: "I couldn't turn this recording into notes. Nothing was saved." },
    ],
  },
  promise: {
    line: "Everything you were taught. Nothing you weren't.",
    items: [
      {
        title: "No numbers we did not count",
        body: "No days-in-a-row counters, mastery scores or confidence ratings. Every number on screen was actually counted.",
      },
      {
        title: "Recordings are deleted straight away",
        body: "The audio file is deleted from our server as soon as it has been transcribed. Only the transcript, notes and cards remain.",
      },
      {
        title: "It is yours",
        body: "Your notes and cards are not shared with anyone and are not used as training data. Delete your account and all of it goes with it.",
      },
      {
        title: "Two things, for now",
        body: "The pilot does Learn and Remember and nothing else. It does not pretend to do what it cannot.",
      },
    ],
    privacyLink: "Read the privacy notice",
  },
  final: {
    title: "Ready. Go.",
    body: "Join the pilot and record this week's lectures.",
    cta: "Join the pilot",
  },
  footer: { privacy: "Privacy notice", contact: "Contact", company: "© 2026 PreplitAI, Inc." },
};

export const siteCopy: Record<Lang, SiteCopy> = { ko, en };
