import type { Lang } from "@/lib/lang";

/*
 * The words around the React pages (sign-in, privacy, not found). The landing
 * page's own copy is site/copy.mjs; the nav words and the main action here match
 * it word for word.
 */
export type SiteCopy = {
  home: string;
  pricing: string;
  nav: {
    product: string; juno: string; pricing: string; faq: string;
    login: string; logout: string; start: string; myNotes: string; switchTo: string; switchLabel: string; menu: string;
  };
  footer: { privacy: string; contact: string; company: string };
  /** The early-access note: the workspace isn't public yet (src/site/EarlyAccess.tsx). */
  early: {
    badge: string; title: string; body: string; button: string; close: string;
    /** For a signed-in student: their account is kept, the workspace opens later. */
    signedIn: string; logout: string;
    features: { workspace: string };
  };
};

const ko: SiteCopy = {
  home: "/ko/",
  pricing: "/ko/pricing/",
  nav: {
    product: "기능",
    juno: "Juno 소개",
    pricing: "요금제",
    faq: "질문",
    login: "로그인",
    logout: "로그아웃",
    start: "시작하기",
    myNotes: "내 워크스페이스",
    switchTo: "EN",
    switchLabel: "Read this page in English",
    menu: "주 메뉴",
  },
  footer: { privacy: "개인정보 처리방침", contact: "문의하기", company: "© 2026 Preplit AI, Inc." },
  early: {
    badge: "일찍 오셨네요!",
    title: "개발자 전용",
    body: "Preplit AI 서비스는 지금 승인된 개발자 계정만 이용할 수 있어요. 정식 출시를 기다려 주세요.",
    button: "알겠어요, 기다릴게요",
    close: "닫기",
    signedIn: "계정은 준비됐어요",
    logout: "로그아웃",
    features: { workspace: "워크스페이스" },
  },
};

const en: SiteCopy = {
  home: "/",
  pricing: "/pricing/",
  nav: {
    product: "Features",
    juno: "Meet Juno",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
    logout: "Log out",
    start: "Start",
    myNotes: "My workspace",
    switchTo: "KO",
    switchLabel: "이 페이지를 한국어로 보기",
    menu: "Main",
  },
  footer: { privacy: "Privacy notice", contact: "Email us", company: "© 2026 Preplit AI, Inc." },
  early: {
    badge: "You're early!",
    title: "Developer Access Only",
    body: "Access to Preplit AI services is currently restricted to authorized developer accounts only. Please wait for our official public release.",
    button: "Got it, I will wait",
    close: "Close",
    signedIn: "Your account is ready",
    logout: "Log out",
    features: { workspace: "Course workspace" },
  },
};

export const siteCopy: Record<Lang, SiteCopy> = { ko, en };
