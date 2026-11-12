import type { UiLanguage } from "./types";

/*
 * Lists that help a student fill in onboarding quickly. They are suggestions,
 * never the limit: a university or goal that is not here can always be typed.
 *
 * Universities are kept by country so another destination can be added beside
 * South Korea without touching the screens.
 */

export type University = { name: string; local?: string };

export const UNIVERSITIES: Record<string, University[]> = {
  KR: [
    { name: "Seoul National University", local: "서울대학교" },
    { name: "Yonsei University", local: "연세대학교" },
    { name: "Korea University", local: "고려대학교" },
    { name: "KAIST", local: "한국과학기술원" },
    { name: "POSTECH", local: "포항공과대학교" },
    { name: "Sungkyunkwan University", local: "성균관대학교" },
    { name: "Hanyang University", local: "한양대학교" },
    { name: "Kyung Hee University", local: "경희대학교" },
    { name: "Ewha Womans University", local: "이화여자대학교" },
    { name: "Sogang University", local: "서강대학교" },
    { name: "Chung-Ang University", local: "중앙대학교" },
    { name: "Hankuk University of Foreign Studies", local: "한국외국어대학교" },
    { name: "Konkuk University", local: "건국대학교" },
    { name: "Dongguk University", local: "동국대학교" },
    { name: "Hongik University", local: "홍익대학교" },
    { name: "Kookmin University", local: "국민대학교" },
    { name: "Sejong University", local: "세종대학교" },
    { name: "Soongsil University", local: "숭실대학교" },
    { name: "Sookmyung Women's University", local: "숙명여자대학교" },
    { name: "University of Seoul", local: "서울시립대학교" },
    { name: "Seoul National University of Science and Technology", local: "서울과학기술대학교" },
    { name: "Kwangwoon University", local: "광운대학교" },
    { name: "Myongji University", local: "명지대학교" },
    { name: "Sangmyung University", local: "상명대학교" },
    { name: "The Catholic University of Korea", local: "가톨릭대학교" },
    { name: "Inha University", local: "인하대학교" },
    { name: "Incheon National University", local: "인천대학교" },
    { name: "Ajou University", local: "아주대학교" },
    { name: "Gachon University", local: "가천대학교" },
    { name: "Dankook University", local: "단국대학교" },
    { name: "Korea Aerospace University", local: "한국항공대학교" },
    { name: "Pusan National University", local: "부산대학교" },
    { name: "Pukyong National University", local: "부경대학교" },
    { name: "Dong-A University", local: "동아대학교" },
    { name: "Kyungpook National University", local: "경북대학교" },
    { name: "Keimyung University", local: "계명대학교" },
    { name: "Yeungnam University", local: "영남대학교" },
    { name: "Chonnam National University", local: "전남대학교" },
    { name: "Jeonbuk National University", local: "전북대학교" },
    { name: "Chungnam National University", local: "충남대학교" },
    { name: "Chungbuk National University", local: "충북대학교" },
    { name: "Kangwon National University", local: "강원대학교" },
    { name: "Jeju National University", local: "제주대학교" },
    { name: "Hallym University", local: "한림대학교" },
    { name: "Woosong University", local: "우송대학교" },
    { name: "Hanbat National University", local: "한밭대학교" },
    { name: "Sunmoon University", local: "선문대학교" },
    { name: "Handong Global University", local: "한동대학교" },
    { name: "UNIST", local: "울산과학기술원" },
    { name: "GIST", local: "광주과학기술원" },
    { name: "DGIST", local: "대구경북과학기술원" },
  ],
};

export const COUNTRIES = ["KR", "JP", "US", "GB", "AU", "CA", "DE", "CN", "OTHER"] as const;

/** Universities whose English or local name contains what was typed. */
export function findUniversities(country: string | null, typed: string) {
  const query = typed.trim().toLowerCase();
  if (query.length < 2) return [];
  return (UNIVERSITIES[country ?? ""] ?? []).filter((u) => u.name.toLowerCase().includes(query) || (u.local ?? "").includes(query)).slice(0, 6);
}

/** The usual first day of classes where the student studies, as a suggestion to confirm. Only Korea is known so far. */
export function usualSemesterStart(country: string | null, now = new Date()): { date: string; term: "spring" | "fall" } | null {
  if (country !== "KR") return null;
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 9) return { date: `${year}-09-01`, term: "fall" };
  if (month >= 3 && month <= 6) return { date: `${year}-03-02`, term: "spring" };
  if (month <= 2) return { date: `${year}-03-02`, term: "spring" };
  return { date: `${year}-09-01`, term: "fall" };
}

export const INTEREST_IDEAS: Record<UiLanguage, string[]> = {
  en: ["Software engineering", "Data & AI", "Design", "Business", "Finance", "Marketing", "Research", "Engineering", "Healthcare", "Education", "Media", "Trade & logistics"],
  ko: ["소프트웨어 개발", "데이터·AI", "디자인", "경영", "금융", "마케팅", "연구", "공학", "보건의료", "교육", "미디어", "무역·물류"],
};

export const SKILL_IDEAS: Record<UiLanguage, string[]> = {
  en: ["Python", "SQL", "Data analysis", "Web development", "Machine learning", "Statistics", "UX design", "Academic writing", "Presentation", "Project management", "Korean for work", "Excel"],
  ko: ["Python", "SQL", "데이터 분석", "웹 개발", "머신러닝", "통계", "UX 디자인", "학술 글쓰기", "발표", "프로젝트 관리", "업무 한국어", "Excel"],
};
