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
    login: string; start: string; myNotes: string; switchTo: string; switchLabel: string; menu: string;
  };
  footer: { privacy: string; contact: string; company: string };
  /** The early-access note: Preplit AI isn't public yet (src/site/EarlyAccess.tsx). */
  early: {
    badge: string; title: string; body: string; button: string; close: string;
    features: { login: string; signup: string; workspace: string };
  };
};

const ko: SiteCopy = {
  home: "/",
  pricing: "/pricing/",
  nav: {
    product: "기능",
    juno: "Juno 소개",
    pricing: "요금제",
    faq: "질문",
    login: "로그인",
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
    features: { login: "로그인", signup: "가입하기", workspace: "워크스페이스" },
  },
};

const en: SiteCopy = {
  home: "/en/",
  pricing: "/en/pricing/",
  nav: {
    product: "Features",
    juno: "Meet Juno",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
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
    features: { login: "Log in", signup: "Sign up", workspace: "Course workspace" },
  },
};

export const siteCopy: Record<Lang, SiteCopy> = { ko, en };
