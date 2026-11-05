import { useLang } from "@/lib/lang";
import { cn } from "@/lib/cn";
import { SitePage } from "@/site/SitePage";

/*
 * The pilot's privacy notice, in plain words. It describes only what the code
 * does: what is stored, that audio is deleted after transcription, the one
 * overseas transfer (to the transcription and notes provider), the single
 * login cookie, and deletion. Have it reviewed before the pilot opens.
 */

type Section = { title: string; body: string[] };

const content: Record<"ko" | "en", { title: string; intro: string; effective: string; sections: Section[] }> = {
  ko: {
    title: "개인정보 처리방침",
    intro: "Junbee 파일럿이 어떤 정보를 왜 받고, 얼마나 두고, 어떻게 지우는지 적었어요.",
    effective: "시행일: 2026년 11월 3일 · 운영: PreplitAI, Inc.",
    sections: [
      {
        title: "받는 정보",
        body: [
          "계정: 이메일, 이름, 비밀번호. 비밀번호는 되돌릴 수 없는 형태(bcrypt)로만 저장해요.",
          "학습 자료: 직접 올린 강의 녹음 또는 녹취록, 그리고 그것으로 만든 노트와 카드.",
          "복습 기록: 어떤 카드를 언제 어떻게 평가했는지. 다음 복습 날짜를 정하는 데만 써요.",
        ],
      },
      {
        title: "녹음 파일",
        body: [
          "녹음 파일은 글로 옮기는 데만 쓰고, 처리가 끝나면 성공하든 실패하든 바로 서버에서 지워요.",
          "남는 건 녹취록, 노트, 카드예요. 노트를 만들지 못한 경우에는 아무것도 저장하지 않아요.",
        ],
      },
      {
        title: "국외 이전",
        body: [
          "이전받는 곳: Groq, Inc. (미국)",
          "이전하는 정보: 강의 녹음, 녹취록",
          "목적: 녹음을 글로 옮기고, 녹취록으로 노트와 카드를 만들기 위해",
          "시기와 방법: 강의를 올릴 때마다 암호화된 연결(HTTPS)로 전송",
          "보유 기간: 처리에 필요한 동안, Groq의 정책에 따름",
          "가입할 때 이 이전에 따로 동의를 받아요. 동의하지 않으면 강의를 처리할 수 없어서 가입할 수 없어요.",
        ],
      },
      {
        title: "쓰지 않는 방법",
        body: [
          "여러분의 녹음, 노트, 카드를 다른 사람에게 보여주거나 팔지 않아요.",
          "학습 데이터로 쓰지 않아요.",
          "광고나 분석 도구를 쓰지 않아요.",
        ],
      },
      {
        title: "쿠키",
        body: ["로그인 상태를 유지하는 쿠키 하나만 써요. 자바스크립트가 읽을 수 없게(httpOnly) 설정돼 있어요. 광고·분석 쿠키는 없어요."],
      },
      {
        title: "지우기",
        body: [
          "강의나 과목을 지우면 그 노트와 카드도 바로 지워져요.",
          "계정 설정에서 계정을 지우면 모든 과목, 녹취록, 노트, 카드, 복습 기록이 바로 지워져요.",
        ],
      },
      {
        title: "문의",
        body: ["개인정보에 관한 문의, 열람·정정·삭제 요청은 info@preplitai.com으로 보내 주세요."],
      },
    ],
  },
  en: {
    title: "Privacy notice",
    intro: "What the Junbee pilot collects, why, how long it keeps it, and how it is deleted.",
    effective: "Effective 3 November 2026 · Operated by PreplitAI, Inc.",
    sections: [
      {
        title: "What we collect",
        body: [
          "Account: e-mail, name and password. The password is stored only in a form that cannot be reversed (bcrypt).",
          "Study material: lecture recordings or transcripts you upload, and the notes and cards made from them.",
          "Review history: which card you rated, when and how. It is used only to schedule the next review.",
        ],
      },
      {
        title: "Recordings",
        body: [
          "A recording is used only to transcribe it. When processing ends, successfully or not, the audio file is deleted from our server.",
          "What remains is the transcript, notes and cards. If notes could not be made, nothing is kept.",
        ],
      },
      {
        title: "Transfer abroad",
        body: [
          "Recipient: Groq, Inc. (United States)",
          "Data: lecture recordings and transcripts",
          "Purpose: to transcribe recordings, and to make notes and cards from transcripts",
          "When and how: each time you upload a lecture, over an encrypted (HTTPS) connection",
          "Retention: for as long as processing requires, under Groq's policy",
          "You are asked to agree to this transfer separately when you sign up. Without it lectures cannot be processed, so an account cannot be created.",
        ],
      },
      {
        title: "What we do not do",
        body: [
          "We do not show or sell your recordings, notes or cards to anyone.",
          "We do not use them as training data.",
          "We do not use advertising or analytics tools.",
        ],
      },
      {
        title: "Cookies",
        body: ["One cookie keeps you signed in. It is httpOnly, so scripts cannot read it. There are no advertising or analytics cookies."],
      },
      {
        title: "Deleting",
        body: [
          "Deleting a lecture or course deletes its notes and cards immediately.",
          "Deleting your account in account settings immediately deletes every course, transcript, note, card and review record.",
        ],
      },
      {
        title: "Contact",
        body: ["For questions, or to see, correct or delete your data, write to info@preplitai.com."],
      },
    ],
  },
};

export default function Privacy() {
  const { lang } = useLang();
  const c = content[lang];
  return (
    <SitePage title={`${c.title} · Junbee`} description={c.intro} path="/privacy">
      <article className="page py-14 sm:py-20">
        <div className="max-w-read">
          <h1 className="display text-4xl">{c.title}</h1>
          <p className={cn("mt-4 text-lg leading-relaxed text-ink/80", lang === "ko" ? "font-kr" : "font-serif")}>{c.intro}</p>
          <p className="mt-3 text-sm text-slate">{c.effective}</p>
          {c.sections.map((s) => (
            <section key={s.title} className="mt-10 border-t border-rule pt-6">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.body.map((line) => (
                  <li key={line} className={cn("leading-relaxed text-ink/85", lang === "ko" ? "font-kr" : "font-serif")}>
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </SitePage>
  );
}
