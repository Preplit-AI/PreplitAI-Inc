import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UiLanguage } from "./types";

/*
 * Every word the app shows, in English and Korean. English is the first
 * language; the student can switch at any time, and the choice is kept on the
 * device and in their profile.
 *
 * This is the interface language only. The language Juno explains in, and the
 * language a course is taught in, are separate choices (see Profile and Course).
 */

const en = {
  appName: "Preplit AI",
  common: {
    continue: "Continue", back: "Back", skip: "Skip for now", save: "Save", cancel: "Cancel", done: "Done", add: "Add",
    edit: "Edit", delete: "Delete", close: "Close", retry: "Try again", optional: "optional", loading: "Loading",
    seeAll: "See all", or: "or", none: "None", today: "Today", tomorrow: "Tomorrow", open: "Open",
    inDays: (days: number) => (days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`),
  },
  errors: {
    Network: "No connection. Check your internet and try again.",
    ServerError: "Something went wrong on our side. Try again in a moment.",
    TooManyRequests: "Too many attempts. Try again in a few minutes.",
    InvalidCredentials: "That e-mail and password do not match.",
    EmailTaken: "That e-mail already has an account. Log in instead.",
    WeakPassword: "The password needs at least 8 characters.",
    InvalidEmail: "Check the e-mail address.",
    InvalidName: "Enter your name.",
    InvalidInvite: "That invite code is not right.",
    InvalidField: "Check what you entered and try again.",
    InvalidSchedule: "Check the days and times.",
    InvalidDate: "Check the date. Use the form 2026-09-01.",
    TooManyCourses: "You can keep up to 20 courses.",
    NeedsEvidence: "Add a link or write what you made before marking this done. That is what makes the skill count.",
    FileTooLarge: "That file is too large. Files up to 4 MB work for now.",
    UnsupportedFile: "That kind of file isn't supported. Use a PDF or a text file.",
    UnreadableDocument: "Juno couldn't read that file.",
    NoTextInDocument: "That file has almost no text Juno can read. Scanned PDFs aren't supported yet.",
    AudioNeedsWorker: "Recordings can't be processed yet: the audio server isn't switched on. Slides, PDFs and text work now.",
    Busy: "Juno is still working on the last one. Try again when it finishes.",
    MonthlyLimit: "You've reached this month's limit.",
    TextTooLong: "That text is too long.",
    NoInput: "Add a file or paste some text first.",
    GoogleUnavailable: "Google sign-in isn't available right now. Use your e-mail and password.",
    GoogleFailed: "Google sign-in didn't finish. Try again.",
    GoogleCancelled: "Google sign-in was cancelled.",
    GoogleEmailUnverified: "Google hasn't verified that account's e-mail address, so it can't be used here.",
    GoogleNoAccount: "No account uses that Google account yet. Create one here: tick the box, then continue with Google.",
    GoogleOtherAccount: "That e-mail address is already linked to a different Google account.",
    GoogleInviteRequired: "Sign-up needs an invite code. Create the account with your e-mail and the code first.",
    AnswerFailed: "Juno couldn't write an answer. Nothing was saved. Try again.",
    default: "That did not work. Try again in a moment.",
  } as Record<string, string>,
  early: {
    badge: "You're early!", title: "Developer Access Only",
    body: "Access to Preplit AI services is currently restricted to authorized developer accounts only. Please wait for our official public release.",
    button: "Back to the website",
  },
  welcome: {
    hello: "Hi, I'm Juno.",
    line: "Your companion for university in Korea. I keep your courses, lectures and deadlines in one place, and explain things in your language.",
    points: ["Understand your lectures", "Stay on top of deadlines", "Build skills for your future"],
    start: "Get started", login: "I have an account", language: "한국어",
  },
  auth: {
    loginTitle: "Welcome back", signupTitle: "Create your account", signupLine: "One account for Juno and everything you study.",
    name: "Name", email: "E-mail", password: "Password", passwordHint: "At least 8 characters",
    invite: "Invite code", login: "Log in", signup: "Create account", google: "Continue with Google",
    noAccount: "No account yet?", haveAccount: "Already have an account?", createOne: "Create one",
    consent: "I have read the privacy notice and agree that my course materials and questions are sent to Groq, Inc. in the United States so Juno can process them.",
    consentLink: "Privacy notice", consentFirst: "Tick the privacy notice box first.",
    googleInApp: "Google sign-in opens in the web version for now. Use e-mail and password here.",
  },
  onboarding: {
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    why: "Why I ask",
    language: {
      title: "Which language should I explain things in?",
      line: "I'll keep the lecture's own terms, like 교착 상태 (deadlock), and explain around them in your language.",
      why: "Notes, answers and quizzes are written in this language. You can change it any time.",
      app: "App language", korean: "How is your Korean?", koreanWhy: "So I know how much to explain when a lecture is in Korean.",
      more: "More languages",
    },
    koreanLevels: { none: "Just starting", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", fluent: "Fluent" },
    university: {
      title: "Where are you studying?", line: "Search for your university, or type its name if it isn't listed.",
      why: "So I know your academic calendar and can speak about your university by name.",
      country: "Country of study", search: "University", searchHint: "Start typing: Hanyang, 연세, KAIST…",
      useTyped: (name: string) => `Use "${name}"`, campus: "Campus", campusHint: "For example Seoul or ERICA",
      countries: { KR: "South Korea", JP: "Japan", US: "United States", GB: "United Kingdom", AU: "Australia", CA: "Canada", DE: "Germany", CN: "China", OTHER: "Another country" } as Record<string, string>,
    },
    program: {
      title: "What are you studying?", line: "A few taps. Skip anything you'd rather not say.",
      why: "Juno matches explanations and project ideas to your level and field.",
      department: "Major or department", departmentHint: "For example Computer Science",
      degree: "Program", year: "Year", stage: "Where are you right now?",
    },
    degrees: { language: "Language program", exchange: "Exchange", bachelor: "Bachelor's", master: "Master's", doctorate: "PhD", other: "Other" },
    stages: { preparing: "Preparing to arrive", new: "New this semester", continuing: "Continuing", graduating: "Final year" },
    semester: {
      title: "When did this semester start?", line: "I count weeks from this date, so every lecture lands in the right week.",
      why: "The dates are yours: I never guess them. You can correct this later.",
      starts: "First day of classes", weeks: "Length", weeksValue: (n: number) => `${n} weeks`,
      suggestion: (label: string) => `${label} is the usual start in Korea`, spring: "March 2", fall: "September 1",
    },
    courses: {
      title: "Which courses are you taking?", line: "Add them one by one. Days and times make your timetable; everything else is optional.",
      why: "Each course gets its own workspace for lectures, notes, tasks and quizzes.",
      added: (n: number) => (n === 1 ? "1 course added" : `${n} courses added`), addAnother: "Add another course", addFirst: "Add your first course",
      none: "You can add courses later, but Juno is most useful with at least one.",
      notConnected: "Preplit AI isn't connected to your university's systems, so you add courses yourself.",
    },
    goals: {
      title: "What are you working toward?", line: "Pick what fits, or write your own. This shapes the projects and skills I suggest.",
      why: "Used only to make suggestions fit you. You can change or clear it any time.",
      interests: "Fields you're interested in", role: "A role you're aiming for", roleHint: "For example Backend engineer",
      skills: "Skills you want to build", custom: "Add your own",
    },
    done: {
      title: (name: string) => `All set, ${name}.`, line: "Here is what I know. You can change any of it in your profile.",
      open: "Open my home", explain: "Explains in", studying: "Studying", courses: "Courses", goal: "Aiming for", notSaid: "Not said yet",
    },
  },
  course: {
    new: "New course", edit: "Edit course", name: "Course name", nameHint: "For example Operating Systems",
    code: "Course code", instructor: "Instructor", location: "Room", credits: "Credits", days: "Class days",
    starts: "Starts", ends: "Ends", timeHint: "10:30", language: "Taught in", midterm: "Midterm", final: "Final exam", dateHint: "2026-10-21",
    delete: "Delete course", deleteConfirm: "Delete this course with its lectures, notes and cards? This can't be undone.",
    noCourses: "No courses yet", noCoursesLine: "Add a course and it gets its own workspace.",
    lectures: (n: number) => (n === 1 ? "1 lecture" : `${n} lectures`), cardsDue: (n: number) => `${n} to review`,
    examIn: (kind: string, days: number) => (days === 0 ? `${kind} today` : days === 1 ? `${kind} tomorrow` : `${kind} in ${days} days`),
    overview: "Overview", materials: "Lectures", tasks: "Tasks", askJuno: "Ask Juno", quiz: "Quick quiz", addMaterial: "Add a lecture",
    noMaterials: "Nothing here yet", noMaterialsLine: "Add slides, a PDF or pasted notes and Juno turns them into study notes.",
    schedule: "Schedule", noSchedule: "No class times yet", exams: "Exams", details: "Details", list: "List", week: "Week", noClasses: "No classes",
  },
  days: { short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
  tabs: { home: "Home", courses: "Courses", buddy: "Lecture Buddy", career: "Career" },
  home: {
    morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening",
    week: (n: number, total: number) => `Week ${n} of ${total}`, noSemester: "Semester not set",
    today: "Today's classes", noClassToday: "No classes today", attention: "Needs your attention", nothingDue: "Nothing due soon. Nice and clear.",
    review: "Today's review", reviewLine: (n: number) => (n === 1 ? "1 question from your lectures" : `${n} questions from your lectures`),
    reviewDone: (n: number) => `${n} reviewed today`, reviewNone: "No questions waiting. Add a lecture and Juno writes some.", play: "Play",
    exams: "Coming up", latest: "Latest notes", addTask: "Add a task", addLecture: "Add a lecture",
    overdue: "Overdue", dueToday: "Due today", dueTomorrow: "Due tomorrow", dueIn: (days: number) => `Due in ${days} days`, noDate: "No date",
    juno: {
      "first-course": "Add your first course and I'll set up its workspace.",
      setup: "Tell me when your semester started and I'll file each lecture under its week.",
      quiet: "All quiet. Nothing needs you right now.",
      processing: (title: string) => `I'm working on "${title}". The notes will be here shortly.`,
      ready: (title: string, cards: number) => `Notes for "${title}" are ready, with ${cards} review questions.`,
      failed: (title: string) => `I couldn't make notes from "${title}". Nothing was saved.`,
      classToday: (course: string) => `You have ${course} today. Add the slides or your notes after class and I'll organise them.`,
      semesterOver: (lectures: number) => `The semester is over. You studied ${lectures} lectures with me.`,
      examSoon: (course: string, kind: string, days: number) => `${course} ${kind} is ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}. A short review each day goes a long way.`,
      cardsDue: (n: number) => `${n} review ${n === 1 ? "question is" : "questions are"} waiting. It takes about five minutes.`,
      cardsFinished: (n: number) => `${n} reviewed today. That's today done.`,
    },
  },
  task: {
    new: "New task", edit: "Edit task", title: "What needs doing?", titleHint: "For example Read chapter 4",
    course: "Course", noCourse: "No course", kind: "Type", due: "Due", dueHint: "2026-11-20", time: "Time", notes: "Notes",
    kinds: { task: "Task", assignment: "Assignment", exam: "Exam", study: "Study" },
    priority: "Priority", priorities: { 1: "High", 2: "Normal", 3: "Low" } as Record<number, string>,
    remind: "Remind me", reminders: { none: "No reminder", hour: "1 hour before", day: "1 day before", days3: "3 days before" },
    remindNote: "Reminders show on your Home screen when it's time. Phone notifications aren't switched on in this version.",
    quick: { today: "Today", tomorrow: "Tomorrow", week: "In a week" },
    all: "Tasks", open: "To do", done: "Done", empty: "No tasks", emptyLine: "Add assignments, exams and anything else you need to remember.",
    markDone: "Mark as done", markOpen: "Mark as not done", reminderNow: "Reminder",
  },
  buddy: {
    title: "Lecture Buddy", line: "Understand your lectures. Learn with confidence.",
    add: "Add a lecture", chooseCourse: "Which course is this for?", needCourse: "Add a course first, so Juno knows where to file it.",
    tabFile: "Upload a file", tabPaste: "Paste text", file: "Upload slides or a PDF", fileLine: "PDF or text file, up to 4 MB", paste: "Paste text or notes", pasteLine: "A transcript, your notes, or copied slide text",
    record: "Record or upload audio", recordLine: "Not available yet: recordings need the audio server",
    lectureTitle: "Title", lectureTitleHint: "For example Week 9: Deadlock", pasteHint: "Paste at least a few paragraphs",
    send: "Make my notes", chosen: (name: string) => `Selected: ${name}`, pick: "Choose a file",
    processing: "Juno is reading it", ready: "Ready", failed: "Couldn't make notes", uploading: "Uploading",
    empty: "No lectures yet", emptyLine: "Add your first lecture and Juno writes the notes, the key terms and a quiz.",
    yours: "Your lectures", fromPdf: "PDF", fromText: "Text", fromAudio: "Recording",
    notesIn: (language: string) => `Notes will be written in ${language}, keeping the lecture's own terms.`,
    consent: "Only add material you're allowed to use. Your files are read for their text and not stored.",
  },
  lecture: {
    summary: "Summary", terms: "Key terms", termsLine: "The lecture's own words, the ones your exam uses.", notes: "Notes",
    flagged: "Your professor said this matters", quiz: "Quiz me on this", ask: "Ask Juno about this lecture",
    cards: (n: number) => (n === 1 ? "1 question" : `${n} questions`), delete: "Delete lecture",
    deleteConfirm: "Delete this lecture with its notes and questions? This can't be undone.",
    processing: "Juno is still reading this one. The notes appear here when they're ready.", english: "English",
    generated: "Written by Juno from your material. Check anything important against the source.",
  },
  quiz: {
    title: "Quick quiz", question: (n: number, total: number) => `${n} / ${total}`, from: "From", reveal: "Show the answer",
    knew: "I knew it", notYet: "Not yet", correct: "Correct", wrong: "Not quite", answer: "The answer", next: "Next", finish: "Finish",
    doneTitle: "That's today's review", score: (right: number, total: number) => `${right} of ${total} right`,
    missed: "Worth another look", missedLine: "These come back sooner, so they stick.", reviewSource: "Open the lecture",
    again: "Back to home", empty: "Nothing to review right now", emptyLine: "New questions appear after you add a lecture, and old ones return when it's time.",
    estimate: "This is a learning check, not a grade.",
  },
  juno: {
    title: "Juno", placeholder: "Ask about your lectures", placeholderCareer: "Ask about projects and careers", send: "Send",
    thinking: "Juno is thinking", searching: "Looking through your lectures",
    emptyTitle: "Ask me anything about your courses", emptyLine: "I answer from your own lectures and show where each answer comes from.",
    careerTitle: "Let's plan what you build next", careerLine: "I look at what you've actually studied and suggest projects that use it.",
    scope: (course: string) => `About ${course}`, scopeLecture: (title: string) => `About "${title}"`,
    grounding: { cited: "From your lectures", account: "About your courses", general: "General explanation, not from your lectures" },
    sources: "Sources", openLecture: "Open the lecture", newChat: "New conversation", aiNote: "Juno is an AI. Check important details against your course material.",
    suggestions: { general: ["What should I review this week?", "Which topics did my professor flag for the exam?", "Explain the last lecture simply"], lecture: ["Explain this lecture simply", "What are the key terms here?", "What might be on the exam?"], career: ["Suggest a project that uses what I've studied", "What skills does my target role need?", "How do I turn a course project into a portfolio piece?"] },
  },
  career: {
    title: "Career", line: "What you learn becomes what you can do.", goal: "Where you're heading", noGoal: "Tell Juno what you're aiming for", setGoal: "Set my goals",
    skills: "Your skills", skillsLine: "Each one shows the evidence behind it. Nothing is claimed without work to show for it.",
    evidence: { demonstrated: "Demonstrated", developing: "Developing", wanted: "Want to build" },
    evidenceLine: { demonstrated: "Shown in a finished project", developing: "In a project you're building", wanted: "No project yet" },
    noSkills: "No skills yet", noSkillsLine: "Add the skills you want to build, then start a project that uses them.",
    projects: "Projects", newProject: "New project", noProjects: "No projects yet", noProjectsLine: "A project is how a skill becomes real. Start small.",
    askIdea: "Ask Juno for a project idea", ideaQuestion: "Suggest one project that uses what I've studied so far and fits my goals.",
    status: { idea: "Idea", active: "In progress", done: "Finished" }, milestones: (done: number, total: number) => `${done} of ${total} steps`,
  },
  project: {
    title: "Project name", titleHint: "For example Library database", summary: "What will you build?", summaryHint: "The problem, and what done looks like",
    skills: "Skills it uses", skillHint: "Type a skill and press Add", course: "Related course",
    steps: "Steps", addStep: "Add a step", stepHint: "For example Draw the ER diagram", firstSteps: "First steps",
    start: "Start building", finish: "Mark as finished", reopen: "Reopen", link: "Link to your work", linkHint: "https://github.com/you/project",
    outcome: "What did you make and learn?", outcomeHint: "A few sentences in your own words",
    evidenceTitle: "Show your work", evidenceLine: "A finished project needs a link or a short write-up. That evidence is what turns its skills into demonstrated ones.",
    delete: "Delete project", deleteConfirm: "Delete this project and its steps?", yours: "You are the builder. Juno can explain and suggest, but the work, and the credit, are yours.",
  },
  profile: {
    title: "Profile", account: "Account", study: "Your studies", languages: "Languages", appLanguage: "App language", explainLanguage: "Juno explains in",
    editStudy: "Edit university and program", editGoals: "Edit goals", notifications: "Reminders", dailyQuiz: "Daily quiz reminder",
    quiet: "Quiet hours", quietLine: (from: number, until: number) => `No reminders from ${from}:00 to ${until}:00`,
    notifyNote: "Saved for when phone notifications are switched on. For now, reminders show on your Home screen.",
    privacy: "Privacy notice", data: "Your data", dataLine: "Your materials stay private to you. To delete your account and everything in it, use the account page on the website.",
    logout: "Log out", version: "Preview build",
  },
};

type Strings = typeof en;

const ko: Strings = {
  appName: "Preplit AI",
  common: {
    continue: "계속", back: "뒤로", skip: "나중에 할게요", save: "저장", cancel: "취소", done: "완료", add: "추가",
    edit: "수정", delete: "삭제", close: "닫기", retry: "다시 시도", optional: "선택", loading: "불러오는 중",
    seeAll: "모두 보기", or: "또는", none: "없음", today: "오늘", tomorrow: "내일", open: "열기",
    inDays: (days) => (days <= 0 ? "오늘" : days === 1 ? "내일" : `${days}일 뒤`),
  },
  errors: {
    Network: "연결되지 않았어요. 인터넷을 확인하고 다시 해 주세요.",
    ServerError: "서버에서 문제가 생겼어요. 잠시 뒤에 다시 해 주세요.",
    TooManyRequests: "시도가 너무 많아요. 몇 분 뒤에 다시 해 주세요.",
    InvalidCredentials: "이메일 또는 비밀번호가 맞지 않아요.",
    EmailTaken: "이미 가입된 이메일이에요. 로그인해 주세요.",
    WeakPassword: "비밀번호는 8자 이상이어야 해요.",
    InvalidEmail: "이메일 주소를 확인해 주세요.",
    InvalidName: "이름을 입력해 주세요.",
    InvalidInvite: "초대 코드가 맞지 않아요.",
    InvalidField: "입력한 내용을 다시 확인해 주세요.",
    InvalidSchedule: "요일과 시간을 다시 확인해 주세요.",
    InvalidDate: "날짜를 확인해 주세요. 2026-09-01처럼 써 주세요.",
    TooManyCourses: "과목은 20개까지 둘 수 있어요.",
    NeedsEvidence: "끝냈다고 표시하려면 링크를 넣거나 만든 것을 적어 주세요. 그래야 역량으로 인정돼요.",
    FileTooLarge: "파일이 너무 커요. 지금은 4MB까지 올릴 수 있어요.",
    UnsupportedFile: "지원하지 않는 파일이에요. PDF나 텍스트 파일을 써 주세요.",
    UnreadableDocument: "Juno가 그 파일을 읽지 못했어요.",
    NoTextInDocument: "이 파일에는 읽을 수 있는 글자가 거의 없어요. 스캔한 PDF는 아직 읽지 못해요.",
    AudioNeedsWorker: "녹음은 아직 처리할 수 없어요. 음성 서버가 켜져 있지 않아요. 슬라이드, PDF, 텍스트는 지금 돼요.",
    Busy: "Juno가 아직 앞의 것을 처리하고 있어요. 끝나면 다시 해 주세요.",
    MonthlyLimit: "이번 달 한도에 도달했어요.",
    TextTooLong: "글이 너무 길어요.",
    NoInput: "파일을 추가하거나 글을 붙여 넣어 주세요.",
    GoogleUnavailable: "지금은 Google 로그인을 쓸 수 없어요. 이메일과 비밀번호로 로그인해 주세요.",
    GoogleFailed: "Google 로그인이 끝나지 않았어요. 다시 해 주세요.",
    GoogleCancelled: "Google 로그인을 취소했어요.",
    GoogleEmailUnverified: "Google에서 확인되지 않은 이메일 주소라 쓸 수 없어요.",
    GoogleNoAccount: "이 Google 계정으로 만든 계정이 아직 없어요. 여기에서 동의에 체크하고 Google로 계속하면 만들어져요.",
    GoogleOtherAccount: "이 이메일 주소는 다른 Google 계정과 연결되어 있어요.",
    GoogleInviteRequired: "가입에 초대 코드가 필요해요. 이메일과 초대 코드로 먼저 계정을 만들어 주세요.",
    AnswerFailed: "Juno가 답변을 만들지 못했어요. 저장된 건 없어요. 다시 해 주세요.",
    default: "지금은 처리하지 못했어요. 잠시 뒤에 다시 해 주세요.",
  },
  early: {
    badge: "일찍 오셨네요!", title: "개발자 전용",
    body: "Preplit AI 서비스는 지금 승인된 개발자 계정만 이용할 수 있어요. 정식 출시를 기다려 주세요.",
    button: "홈페이지로 돌아가기",
  },
  welcome: {
    hello: "안녕하세요, Juno예요.",
    line: "한국에서의 대학 생활을 함께하는 동반자예요. 과목, 강의, 마감을 한곳에 모으고, 편한 언어로 설명해 드려요.",
    points: ["강의를 이해하고", "마감을 놓치지 않고", "미래를 위한 역량을 쌓아요"],
    start: "시작하기", login: "계정이 있어요", language: "English",
  },
  auth: {
    loginTitle: "다시 만나서 반가워요", signupTitle: "계정 만들기", signupLine: "Juno와 공부하는 모든 것을 위한 계정 하나.",
    name: "이름", email: "이메일", password: "비밀번호", passwordHint: "8자 이상",
    invite: "초대 코드", login: "로그인", signup: "계정 만들기", google: "Google로 계속하기",
    noAccount: "아직 계정이 없나요?", haveAccount: "이미 계정이 있나요?", createOne: "계정 만들기",
    consent: "개인정보 처리방침을 읽었고, Juno가 처리할 수 있도록 수업 자료와 질문이 미국의 Groq, Inc.로 전송되는 것에 동의해요.",
    consentLink: "개인정보 처리방침", consentFirst: "먼저 개인정보 처리방침 동의에 체크해 주세요.",
    googleInApp: "Google 로그인은 지금 웹 버전에서 열려요. 여기서는 이메일과 비밀번호를 써 주세요.",
  },
  onboarding: {
    step: (n, total) => `${total}단계 중 ${n}단계`,
    why: "묻는 이유",
    language: {
      title: "어떤 언어로 설명해 드릴까요?",
      line: "교착 상태 (deadlock)처럼 강의에 나온 용어는 그대로 두고, 고른 언어로 풀어서 설명해요.",
      why: "노트, 답변, 퀴즈가 이 언어로 쓰여요. 언제든 바꿀 수 있어요.",
      app: "앱 언어", korean: "한국어는 어느 정도인가요?", koreanWhy: "한국어 강의를 얼마나 풀어서 설명할지 알기 위해서예요.",
      more: "다른 언어",
    },
    koreanLevels: { none: "이제 시작", beginner: "초급", intermediate: "중급", advanced: "고급", fluent: "능숙" },
    university: {
      title: "어디에서 공부하나요?", line: "대학을 찾아 주세요. 목록에 없으면 이름을 직접 써도 돼요.",
      why: "학사 일정을 알고, 대학 이름으로 이야기하기 위해서예요.",
      country: "공부하는 나라", search: "대학", searchHint: "입력해 보세요: Hanyang, 연세, KAIST…",
      useTyped: (name) => `"${name}" 그대로 쓰기`, campus: "캠퍼스", campusHint: "예: 서울, ERICA",
      countries: { KR: "대한민국", JP: "일본", US: "미국", GB: "영국", AU: "호주", CA: "캐나다", DE: "독일", CN: "중국", OTHER: "다른 나라" },
    },
    program: {
      title: "무엇을 공부하나요?", line: "몇 번만 누르면 돼요. 말하고 싶지 않은 건 건너뛰세요.",
      why: "Juno가 설명과 프로젝트 제안을 수준과 분야에 맞춰요.",
      department: "전공 또는 학과", departmentHint: "예: 컴퓨터공학",
      degree: "과정", year: "학년", stage: "지금 어느 단계인가요?",
    },
    degrees: { language: "어학 과정", exchange: "교환학생", bachelor: "학부", master: "석사", doctorate: "박사", other: "기타" },
    stages: { preparing: "입국 준비 중", new: "이번 학기 입학", continuing: "재학 중", graduating: "졸업 학년" },
    semester: {
      title: "이번 학기는 언제 시작했나요?", line: "이 날짜부터 주차를 세서, 강의마다 맞는 주에 정리해요.",
      why: "날짜는 직접 정해요. 제가 짐작하지 않아요. 나중에 고칠 수 있어요.",
      starts: "개강일", weeks: "기간", weeksValue: (n) => `${n}주`,
      suggestion: (label) => `한국에서는 보통 ${label}에 개강해요`, spring: "3월 2일", fall: "9월 1일",
    },
    courses: {
      title: "어떤 과목을 듣나요?", line: "하나씩 추가해 주세요. 요일과 시간으로 시간표가 만들어지고, 나머지는 선택이에요.",
      why: "과목마다 강의, 노트, 할 일, 퀴즈를 모으는 워크스페이스가 생겨요.",
      added: (n) => `과목 ${n}개 추가됨`, addAnother: "과목 더 추가", addFirst: "첫 과목 추가",
      none: "과목은 나중에 추가할 수 있지만, 하나라도 있어야 Juno가 제대로 도와요.",
      notConnected: "Preplit AI는 대학 시스템과 연결되어 있지 않아서, 과목은 직접 추가해요.",
    },
    goals: {
      title: "무엇을 향해 가고 있나요?", line: "맞는 것을 고르거나 직접 써 주세요. 제안하는 프로젝트와 역량이 여기에 맞춰져요.",
      why: "제안을 맞추는 데만 써요. 언제든 바꾸거나 지울 수 있어요.",
      interests: "관심 있는 분야", role: "목표로 하는 직무", roleHint: "예: 백엔드 엔지니어",
      skills: "키우고 싶은 역량", custom: "직접 추가",
    },
    done: {
      title: (name) => `준비됐어요, ${name} 님.`, line: "제가 아는 내용이에요. 프로필에서 언제든 바꿀 수 있어요.",
      open: "홈 열기", explain: "설명 언어", studying: "공부", courses: "과목", goal: "목표", notSaid: "아직 말하지 않음",
    },
  },
  course: {
    new: "새 과목", edit: "과목 수정", name: "과목 이름", nameHint: "예: 운영체제",
    code: "학수번호", instructor: "교수", location: "강의실", credits: "학점", days: "수업 요일",
    starts: "시작", ends: "종료", timeHint: "10:30", language: "강의 언어", midterm: "중간고사", final: "기말고사", dateHint: "2026-10-21",
    delete: "과목 삭제", deleteConfirm: "이 과목을 강의, 노트, 카드와 함께 지울까요? 되돌릴 수 없어요.",
    noCourses: "아직 과목이 없어요", noCoursesLine: "과목을 추가하면 전용 워크스페이스가 생겨요.",
    lectures: (n) => `강의 ${n}개`, cardsDue: (n) => `복습 ${n}개`,
    examIn: (kind, days) => (days === 0 ? `오늘 ${kind}` : days === 1 ? `내일 ${kind}` : `${kind}까지 ${days}일`),
    overview: "개요", materials: "강의", tasks: "할 일", askJuno: "Juno에게 묻기", quiz: "빠른 퀴즈", addMaterial: "강의 추가",
    noMaterials: "아직 아무것도 없어요", noMaterialsLine: "슬라이드, PDF, 붙여 넣은 노트를 추가하면 Juno가 공부 노트로 만들어요.",
    schedule: "시간표", noSchedule: "아직 수업 시간이 없어요", exams: "시험", details: "정보", list: "목록", week: "주간", noClasses: "수업 없음",
  },
  days: { short: ["일", "월", "화", "수", "목", "금", "토"], long: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] },
  tabs: { home: "홈", courses: "과목", buddy: "Lecture Buddy", career: "커리어" },
  home: {
    morning: "좋은 아침이에요", afternoon: "좋은 오후예요", evening: "좋은 저녁이에요",
    week: (n, total) => `${total}주 중 ${n}주차`, noSemester: "학기가 설정되지 않음",
    today: "오늘 수업", noClassToday: "오늘은 수업이 없어요", attention: "챙겨야 할 것", nothingDue: "곧 마감인 게 없어요. 깔끔해요.",
    review: "오늘의 복습", reviewLine: (n) => `내 강의에서 나온 질문 ${n}개`,
    reviewDone: (n) => `오늘 ${n}개 복습함`, reviewNone: "기다리는 질문이 없어요. 강의를 추가하면 Juno가 만들어요.", play: "시작",
    exams: "다가오는 일정", latest: "최근 노트", addTask: "할 일 추가", addLecture: "강의 추가",
    overdue: "기한 지남", dueToday: "오늘 마감", dueTomorrow: "내일 마감", dueIn: (days) => `${days}일 뒤 마감`, noDate: "날짜 없음",
    juno: {
      "first-course": "첫 과목을 추가하면 워크스페이스를 만들어 둘게요.",
      setup: "학기가 언제 시작했는지 알려 주면 강의를 주차별로 정리할게요.",
      quiet: "조용해요. 지금 챙길 건 없어요.",
      processing: (title) => `"${title}"을(를) 정리하고 있어요. 노트가 곧 나와요.`,
      ready: (title, cards) => `"${title}" 노트가 준비됐어요. 복습 질문 ${cards}개도 있어요.`,
      failed: (title) => `"${title}"로 노트를 만들지 못했어요. 저장된 건 없어요.`,
      classToday: (course) => `오늘 ${course} 수업이 있어요. 수업 뒤에 슬라이드나 노트를 추가하면 정리해 둘게요.`,
      semesterOver: (lectures) => `학기가 끝났어요. 저와 강의 ${lectures}개를 공부했어요.`,
      examSoon: (course, kind, days) => `${course} ${kind}이(가) ${days === 0 ? "오늘이에요" : days === 1 ? "내일이에요" : `${days}일 남았어요`}. 매일 조금씩 복습하면 충분해요.`,
      cardsDue: (n) => `복습 질문 ${n}개가 기다리고 있어요. 5분쯤 걸려요.`,
      cardsFinished: (n) => `오늘 ${n}개 복습했어요. 오늘 할 일은 끝났어요.`,
    },
  },
  task: {
    new: "새 할 일", edit: "할 일 수정", title: "무엇을 해야 하나요?", titleHint: "예: 4장 읽기",
    course: "과목", noCourse: "과목 없음", kind: "종류", due: "마감", dueHint: "2026-11-20", time: "시간", notes: "메모",
    kinds: { task: "할 일", assignment: "과제", exam: "시험", study: "공부" },
    priority: "중요도", priorities: { 1: "높음", 2: "보통", 3: "낮음" },
    remind: "알림", reminders: { none: "알림 없음", hour: "1시간 전", day: "하루 전", days3: "3일 전" },
    remindNote: "알림은 때가 되면 홈 화면에 보여요. 이 버전에서는 휴대폰 알림이 켜져 있지 않아요.",
    quick: { today: "오늘", tomorrow: "내일", week: "일주일 뒤" },
    all: "할 일", open: "할 일", done: "완료", empty: "할 일이 없어요", emptyLine: "과제, 시험, 기억해야 할 것을 추가해 보세요.",
    markDone: "완료로 표시", markOpen: "미완료로 표시", reminderNow: "알림",
  },
  buddy: {
    title: "Lecture Buddy", line: "강의를 이해하고, 자신 있게 배우세요.",
    add: "강의 추가", chooseCourse: "어느 과목의 강의인가요?", needCourse: "먼저 과목을 추가해 주세요. Juno가 어디에 정리할지 알 수 있어요.",
    tabFile: "파일 올리기", tabPaste: "글 붙여 넣기", file: "슬라이드나 PDF 올리기", fileLine: "PDF 또는 텍스트 파일, 4MB까지", paste: "글이나 노트 붙여 넣기", pasteLine: "녹취록, 내 노트, 복사한 슬라이드 글",
    record: "녹음하거나 음성 올리기", recordLine: "아직 안 돼요: 녹음에는 음성 서버가 필요해요",
    lectureTitle: "제목", lectureTitleHint: "예: 9주차: 교착 상태", pasteHint: "문단 몇 개 이상 붙여 넣어 주세요",
    send: "노트 만들기", chosen: (name) => `선택한 파일: ${name}`, pick: "파일 고르기",
    processing: "Juno가 읽고 있어요", ready: "준비됨", failed: "노트를 만들지 못했어요", uploading: "올리는 중",
    empty: "아직 강의가 없어요", emptyLine: "첫 강의를 추가하면 Juno가 노트, 핵심 용어, 퀴즈를 만들어요.",
    yours: "내 강의", fromPdf: "PDF", fromText: "텍스트", fromAudio: "녹음",
    notesIn: (language) => `노트는 ${language}로 쓰고, 강의의 용어는 그대로 둬요.`,
    consent: "사용해도 되는 자료만 추가해 주세요. 파일은 글자만 읽고 저장하지 않아요.",
  },
  lecture: {
    summary: "요약", terms: "핵심 용어", termsLine: "강의에서 쓴 말 그대로예요. 시험에 나오는 말이에요.", notes: "노트",
    flagged: "교수님이 중요하다고 한 부분", quiz: "이 강의로 퀴즈", ask: "이 강의에 대해 Juno에게 묻기",
    cards: (n) => `질문 ${n}개`, delete: "강의 삭제",
    deleteConfirm: "이 강의를 노트, 질문과 함께 지울까요? 되돌릴 수 없어요.",
    processing: "Juno가 아직 읽고 있어요. 노트가 준비되면 여기에 나와요.", english: "영어",
    generated: "Juno가 올린 자료로 쓴 노트예요. 중요한 내용은 원본과 확인해 주세요.",
  },
  quiz: {
    title: "빠른 퀴즈", question: (n, total) => `${n} / ${total}`, from: "출처", reveal: "답 보기",
    knew: "알고 있었어요", notYet: "아직이에요", correct: "정답", wrong: "아쉬워요", answer: "정답", next: "다음", finish: "끝내기",
    doneTitle: "오늘의 복습 끝", score: (right, total) => `${total}개 중 ${right}개 정답`,
    missed: "다시 볼 것", missedLine: "이 질문들은 더 빨리 다시 나와서 기억에 남아요.", reviewSource: "강의 열기",
    again: "홈으로", empty: "지금은 복습할 게 없어요", emptyLine: "강의를 추가하면 새 질문이 생기고, 때가 되면 예전 질문이 돌아와요.",
    estimate: "성적이 아니라 학습 점검이에요.",
  },
  juno: {
    title: "Juno", placeholder: "강의에 대해 물어보세요", placeholderCareer: "프로젝트와 진로를 물어보세요", send: "보내기",
    thinking: "Juno가 생각하고 있어요", searching: "강의를 찾아보고 있어요",
    emptyTitle: "과목에 대해 무엇이든 물어보세요", emptyLine: "올린 강의에서 답하고, 답이 어디에서 나왔는지 보여 드려요.",
    careerTitle: "다음에 무엇을 만들지 정해 봐요", careerLine: "실제로 공부한 것을 보고, 그것을 쓰는 프로젝트를 제안해요.",
    scope: (course) => `${course}에 대해`, scopeLecture: (title) => `"${title}"에 대해`,
    grounding: { cited: "내 강의에서", account: "내 과목 정보", general: "강의 내용이 아닌 일반적인 설명" },
    sources: "출처", openLecture: "강의 열기", newChat: "새 대화", aiNote: "Juno는 AI예요. 중요한 내용은 수업 자료와 확인해 주세요.",
    suggestions: { general: ["이번 주에 무엇을 복습해야 해?", "교수님이 시험에 나온다고 한 주제는?", "지난 강의를 쉽게 설명해 줘"], lecture: ["이 강의를 쉽게 설명해 줘", "여기서 핵심 용어는 뭐야?", "시험에 뭐가 나올 수 있어?"], career: ["지금까지 공부한 걸 쓰는 프로젝트를 제안해 줘", "내 목표 직무에는 어떤 역량이 필요해?", "수업 프로젝트를 포트폴리오로 만들려면?"] },
  },
  career: {
    title: "커리어", line: "배운 것이 할 수 있는 것이 돼요.", goal: "가고 있는 방향", noGoal: "무엇을 목표로 하는지 Juno에게 알려 주세요", setGoal: "목표 정하기",
    skills: "내 역량", skillsLine: "역량마다 근거가 함께 보여요. 보여 줄 작업 없이 주장하지 않아요.",
    evidence: { demonstrated: "증명됨", developing: "키우는 중", wanted: "키우고 싶음" },
    evidenceLine: { demonstrated: "끝낸 프로젝트로 보여 줌", developing: "만들고 있는 프로젝트에서", wanted: "아직 프로젝트 없음" },
    noSkills: "아직 역량이 없어요", noSkillsLine: "키우고 싶은 역량을 추가하고, 그것을 쓰는 프로젝트를 시작해 보세요.",
    projects: "프로젝트", newProject: "새 프로젝트", noProjects: "아직 프로젝트가 없어요", noProjectsLine: "프로젝트는 역량이 진짜가 되는 방법이에요. 작게 시작하세요.",
    askIdea: "Juno에게 프로젝트 아이디어 묻기", ideaQuestion: "지금까지 공부한 것을 쓰고 내 목표에 맞는 프로젝트를 하나 제안해 줘.",
    status: { idea: "아이디어", active: "진행 중", done: "완료" }, milestones: (done, total) => `${total}단계 중 ${done}단계`,
  },
  project: {
    title: "프로젝트 이름", titleHint: "예: 도서관 데이터베이스", summary: "무엇을 만드나요?", summaryHint: "풀려는 문제와, 끝난 모습",
    skills: "쓰는 역량", skillHint: "역량을 쓰고 추가를 누르세요", course: "관련 과목",
    steps: "단계", addStep: "단계 추가", stepHint: "예: ER 다이어그램 그리기", firstSteps: "첫 단계",
    start: "만들기 시작", finish: "완료로 표시", reopen: "다시 열기", link: "작업 링크", linkHint: "https://github.com/you/project",
    outcome: "무엇을 만들고 배웠나요?", outcomeHint: "내 말로 몇 문장",
    evidenceTitle: "작업을 보여 주세요", evidenceLine: "끝낸 프로젝트에는 링크나 짧은 글이 필요해요. 그 근거가 있어야 역량이 증명된 것으로 바뀌어요.",
    delete: "프로젝트 삭제", deleteConfirm: "이 프로젝트와 단계를 지울까요?", yours: "만드는 사람은 나예요. Juno는 설명하고 제안할 뿐, 작업과 그 공은 내 것이에요.",
  },
  profile: {
    title: "프로필", account: "계정", study: "내 학업", languages: "언어", appLanguage: "앱 언어", explainLanguage: "Juno의 설명 언어",
    editStudy: "대학과 과정 수정", editGoals: "목표 수정", notifications: "알림", dailyQuiz: "매일 퀴즈 알림",
    quiet: "방해 금지 시간", quietLine: (from, until) => `${from}:00부터 ${until}:00까지 알림 없음`,
    notifyNote: "휴대폰 알림이 켜지면 쓰려고 저장해 둬요. 지금은 알림이 홈 화면에 보여요.",
    privacy: "개인정보 처리방침", data: "내 데이터", dataLine: "자료는 나만 볼 수 있어요. 계정과 모든 내용을 지우려면 홈페이지의 계정 화면을 이용해 주세요.",
    logout: "로그아웃", version: "미리보기 빌드",
  },
};

const STRINGS: Record<UiLanguage, Strings> = { en, ko };
/** Shared with the website (src/lib/lang.tsx), so a language chosen there carries over on the web build. */
const KEY = "jb_lang";

type LangValue = { lang: UiLanguage; t: Strings; setLang: (lang: UiLanguage) => void; errorText: (err: unknown) => string };
const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLanguage>("en");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved === "ko" || saved === "en") setLangState(saved);
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((next: UiLanguage) => {
    setLangState(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const value = useMemo<LangValue>(() => {
    const t = STRINGS[lang];
    /** The message for an error, by its code. The server's own wording is Korean, so it is not shown as is. */
    const errorText = (err: unknown) => {
      const code = typeof err === "string" ? err : (err as { code?: string } | null)?.code;
      return (code && t.errors[code]) || t.errors.default;
    };
    return { lang, t, setLang, errorText };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside LangProvider");
  return value;
}

/** The languages Juno can explain in, by their own names, most common among students in Korea first. */
export const EXPLAIN_LANGUAGES: { code: string; name: string }[] = [
  { code: "en", name: "English" }, { code: "zh", name: "中文 (简体)" }, { code: "vi", name: "Tiếng Việt" }, { code: "ko", name: "한국어" },
  { code: "ja", name: "日本語" }, { code: "mn", name: "Монгол" }, { code: "uz", name: "Oʻzbekcha" }, { code: "ur", name: "اردو" },
  { code: "ru", name: "Русский" }, { code: "id", name: "Bahasa Indonesia" }, { code: "zh-TW", name: "中文 (繁體)" }, { code: "th", name: "ไทย" },
  { code: "hi", name: "हिन्दी" }, { code: "bn", name: "বাংলা" }, { code: "ne", name: "नेपाली" }, { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" }, { code: "es", name: "Español" }, { code: "de", name: "Deutsch" }, { code: "pt", name: "Português" },
  { code: "tr", name: "Türkçe" }, { code: "kk", name: "Қазақша" }, { code: "my", name: "မြန်မာ" }, { code: "km", name: "ខ្មែរ" },
  { code: "ms", name: "Bahasa Melayu" }, { code: "fa", name: "فارسی" },
];

export const languageName = (code: string | null) => EXPLAIN_LANGUAGES.find((l) => l.code === code)?.name ?? null;
