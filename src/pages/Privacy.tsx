import { useLang } from "@/lib/lang";
import { SitePage } from "@/site/SitePage";

/*
 * The pilot's privacy notice, in plain words. It describes only what the code
 * does: what is stored, that audio is deleted after transcription, the one
 * overseas transfer (to the provider for transcription, notes and answers), the
 * single login cookie, and deletion. Have it reviewed before the pilot opens.
 */

type Section = { title: string; body: string[] };

const content: Record<"ko" | "en", { title: string; intro: string; effective: string; sections: Section[] }> = {
  ko: {
    title: "개인정보 처리방침",
    intro: "Preplit AI 파일럿이 어떤 정보를 왜 받고, 얼마나 두고, 어떻게 지우는지 적었어요.",
    effective: "시행일: 2026년 11월 6일 · 운영: Preplit AI, Inc.",
    sections: [
      {
        title: "받는 정보",
        body: [
          "계정: 이메일, 이름, 비밀번호. 비밀번호는 되돌릴 수 없는 형태(bcrypt)로만 저장해요.",
          "학습 자료: Preplit AI로 녹음하거나 직접 올린 수업 녹음 또는 녹취록, 그리고 그것으로 만든 노트와 카드.",
          "복습 기록: 어떤 카드를 언제 어떻게 평가했는지. 다음 복습 날짜를 정하는 데만 써요.",
          "대화: Juno에게 한 질문과 받은 답변. 직접 지울 때까지 보관해요. 답변이 끝나지 않았거나 실패한 질문은 저장하지 않아요.",
          "질문 횟수: 사용량 한도를 지키기 위해 질문마다 시각과 사용량을 기록해요. 대화를 지워도 30일 한도를 계산하는 데 쓰이고, 계정을 지우면 함께 지워져요.",
          "학기 일정: 직접 넣은 학기 시작일, 수업 요일, 시험 날짜. 주차를 맞추고 알려 드리는 데만 써요.",
          "알림: 켠 경우에만, 이 기기로 알림을 보낼 때 쓰는 주소와 어떤 알림을 보냈는지의 기록.",
        ],
      },
      {
        title: "녹음 파일",
        body: [
          "수업 녹음에는 교수님과 다른 학생의 목소리가 들어갈 수 있어요. 교수님이 허락한 수업에서만 녹음해 주세요.",
          "녹음하는 동안 소리는 이 기기의 브라우저 저장소에 저장돼요. 창이 닫혀도 녹음을 잃지 않기 위해서예요. 노트가 만들어지면 기기에서 지워지고, 노트를 만들지 못했으면 직접 지우거나 14일 뒤에 지워져요.",
          "서버에 올라간 녹음 파일은 글로 옮기는 데만 쓰고, 처리가 끝나면 성공하든 실패하든 바로 서버에서 지워요.",
          "남는 건 녹취록, 노트, 카드예요. 노트를 만들지 못한 경우에는 아무것도 저장하지 않아요.",
        ],
      },
      {
        title: "국외 이전",
        body: [
          "이전받는 곳: Groq, Inc. (미국)",
          "이전하는 정보: 강의 녹음, 녹취록, Juno에게 한 질문과 이어지는 대화, 답변에 필요한 강의 내용과 과목·강의 제목",
          "목적: 녹음을 글로 옮기고, 녹취록으로 노트와 카드를 만들고, 질문에 답하기 위해",
          "시기와 방법: 강의를 올리거나 질문할 때마다 암호화된 연결(HTTPS)로 전송",
          "보유 기간: 처리에 필요한 동안, Groq의 정책에 따름",
          "가입할 때 이 이전에 따로 동의를 받아요. 동의하지 않으면 강의를 처리할 수 없어서 가입할 수 없어요.",
          "알림을 켜면 알림은 브라우저 회사의 전달 서비스(Google, Apple, Mozilla, Microsoft 중 쓰는 브라우저의 것)를 거쳐요. 내용은 암호화되어 그 회사가 읽을 수 없어요.",
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
        title: "쿠키와 기기 저장",
        body: ["로그인 상태를 유지하는 쿠키 하나만 써요. 자바스크립트가 읽을 수 없게(httpOnly) 설정돼 있어요. 광고·분석 쿠키는 없어요.", "쿠키 말고는 위에 적은 녹음과, 알림 안내를 닫았다는 표시만 이 기기에 저장해요."],
      },
      {
        title: "지우기",
        body: [
          "강의나 과목을 지우면 그 노트와 카드도 바로 지워져요. 그 강의를 바탕으로 이미 받은 답변은 대화를 지울 때까지 남아요.",
          "대화는 언제든 직접 지울 수 있고, 지우면 바로 사라져요.",
          "계정 설정에서 계정을 지우면 모든 과목, 녹취록, 노트, 카드, 복습 기록, 대화, 일정, 알림 기록이 바로 지워져요.",
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
    intro: "What the Preplit AI pilot collects, why, how long it keeps it, and how it is deleted.",
    effective: "Effective 6 November 2026 · Operated by Preplit AI, Inc.",
    sections: [
      {
        title: "What we collect",
        body: [
          "Account: e-mail, name and password. The password is stored only in a form that cannot be reversed (bcrypt).",
          "Study material: class recordings you make in Preplit AI or upload, transcripts, and the notes and cards made from them.",
          "Review history: which card you rated, when and how. It is used only to schedule the next review.",
          "Conversations: the questions you ask Juno and its answers, kept until you delete them. A question whose answer failed or was cancelled is not kept.",
          "Question count: the time and usage of each question, to enforce usage limits. It still counts toward the 30-day limit after you delete a conversation, and is deleted with your account.",
          "Semester schedule: the semester start date, class days and exam dates you enter. Used only to work out the week and to remind you.",
          "Notifications: only if you turn them on, the address used to reach this device and a record of which reminders were sent.",
        ],
      },
      {
        title: "Recordings",
        body: [
          "A class recording can include the voices of your lecturer and other students. Only record classes where your lecturer allows it.",
          "While you record, the audio is saved in this device's browser storage, so a closed window cannot lose the lecture. It is removed from the device once the notes exist. If notes could not be made, it stays until you delete it or for 14 days.",
          "On our server a recording is used only to transcribe it. When processing ends, successfully or not, the audio file is deleted from our server.",
          "What remains is the transcript, notes and cards. If notes could not be made, nothing is kept.",
        ],
      },
      {
        title: "Transfer abroad",
        body: [
          "Recipient: Groq, Inc. (United States)",
          "Data: lecture recordings and transcripts; questions you ask Juno and the conversation around them; the lecture content, and course and lecture titles, needed to answer",
          "Purpose: to transcribe recordings, to make notes and cards from transcripts, and to answer questions",
          "When and how: each time you upload a lecture or ask a question, over an encrypted (HTTPS) connection",
          "Retention: for as long as processing requires, under Groq's policy",
          "You are asked to agree to this transfer separately when you sign up. Without it lectures cannot be processed, so an account cannot be created.",
          "If you turn on notifications, they pass through your browser maker's delivery service (Google, Apple, Mozilla or Microsoft). Their content is encrypted, so that company cannot read it.",
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
        title: "Cookies and device storage",
        body: ["One cookie keeps you signed in. It is httpOnly, so scripts cannot read it. There are no advertising or analytics cookies.", "Apart from the cookie, the only things stored on this device are the recordings described above and a note that you closed the notification prompt."],
      },
      {
        title: "Deleting",
        body: [
          "Deleting a lecture or course deletes its notes and cards immediately. Answers you already received from that lecture stay until you delete the conversation.",
          "You can delete a conversation at any time, and it is gone immediately.",
          "Deleting your account in account settings immediately deletes every course, transcript, note, card, review record, conversation, schedule and notification record.",
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
    <SitePage title={`${c.title} · Preplit AI`} description={c.intro} path="/privacy">
      <article className="page grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-6">
        <header className="lg:col-span-5">
          <div className="lg:sticky lg:top-[120px]">
            <h1 className="display text-[2.75rem] leading-[1.1]">{c.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink">{c.intro}</p>
            <p className="mt-3 text-sm text-slate">{c.effective}</p>
          </div>
        </header>
        <div className="lg:col-span-6 lg:col-start-7">
          {c.sections.map((s) => (
            <section key={s.title} className="border-t border-rule py-6 first:border-t-0 first:pt-0">
              <h2 className="display text-[1.375rem] leading-snug">{s.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {s.body.map((line) => (
                  <li key={line} className="leading-relaxed text-ink">
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
