import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiError, request } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLang, type Lang } from "@/lib/lang";
import { SitePage } from "@/site/SitePage";

const text = {
  ko: {
    loginTitle: "로그인",
    loginButton: "로그인",
    noAccount: "아직 계정이 없나요?",
    join: "파일럿 참여하기",
    signupTitle: "파일럿 참여하기",
    signupIntro: "이번 학기, 한 과목의 학생들과 Junbee를 먼저 써 보는 파일럿이에요.",
    signupButton: "계정 만들기",
    haveAccount: "이미 계정이 있나요?",
    login: "로그인",
    name: "이름",
    email: "이메일",
    password: "비밀번호",
    passwordHint: "8자 이상",
    invite: "초대 코드",
    inviteHint: "파일럿 안내에서 받은 코드",
    consent: "개인정보 처리방침을 읽었고, 강의를 처리하기 위해 녹음과 녹취록이 미국의 Groq, Inc.로 전송되는 것에 동의해요.",
    consentLink: "개인정보 처리방침",
    working: "잠시만요",
  },
  en: {
    loginTitle: "Log in",
    loginButton: "Log in",
    noAccount: "No account yet?",
    join: "Join the pilot",
    signupTitle: "Join the pilot",
    signupIntro: "This semester's pilot: the students of one course trying Junbee first.",
    signupButton: "Create account",
    haveAccount: "Already have an account?",
    login: "Log in",
    name: "Name",
    email: "E-mail",
    password: "Password",
    passwordHint: "At least 8 characters",
    invite: "Invite code",
    inviteHint: "From your pilot invitation",
    consent: "I have read the privacy notice and agree that recordings and transcripts are sent to Groq, Inc. in the United States so lectures can be processed.",
    consentLink: "privacy notice",
    working: "One moment",
  },
};

const errors: Record<Lang, Record<string, string>> = {
  ko: {
    InvalidCredentials: "이메일 또는 비밀번호가 맞지 않아요.",
    EmailTaken: "이미 가입된 이메일이에요. 로그인해 주세요.",
    WeakPassword: "비밀번호는 8자 이상이어야 해요.",
    InvalidEmail: "이메일 주소를 확인해 주세요.",
    InvalidName: "이름을 입력해 주세요.",
    InvalidInvite: "초대 코드가 맞지 않아요.",
    TooManyRequests: "시도가 너무 많아요. 몇 분 뒤에 다시 해 주세요.",
    Network: "인터넷 연결을 확인해 주세요.",
    default: "지금은 처리하지 못했어요. 잠시 뒤에 다시 해 주세요.",
  },
  en: {
    InvalidCredentials: "That e-mail and password do not match.",
    EmailTaken: "That e-mail already has an account. Log in instead.",
    WeakPassword: "The password needs at least 8 characters.",
    InvalidEmail: "Check the e-mail address.",
    InvalidName: "Enter your name.",
    InvalidInvite: "That invite code is not right.",
    TooManyRequests: "Too many attempts. Try again in a few minutes.",
    Network: "Check your internet connection.",
    default: "That did not work. Try again in a moment.",
  },
};

function messageFor(err: unknown, lang: Lang) {
  const code = err instanceof ApiError ? err.code : "default";
  return errors[lang][code] ?? errors[lang].default;
}

/** Only in-app paths, so a crafted ?next= cannot send someone to another site. */
function safeNext(value: string | null) {
  return value && /^\/app\/[\w\-/]*$/.test(value) ? value : "/app/learn";
}

function Frame({ title, intro, children, footer }: { title: string; intro?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <section className="page flex justify-center py-14 sm:py-20">
      <div className="w-full max-w-[26rem]">
        <h1 className="display text-4xl">{title}</h1>
        {intro ? <p className="mt-3 leading-relaxed text-ink/75">{intro}</p> : null}
        <div className="mt-8">{children}</div>
        <p className="mt-8 border-t border-rule pt-6 text-sm text-slate">{footer}</p>
      </div>
    </section>
  );
}

function Field({ label, hint, ...input }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} className="field" aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      {hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate">{hint}</p> : null}
    </div>
  );
}

export function Login() {
  const { lang } = useLang();
  const t = text[lang];
  const { status, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "signed-in") return <Navigate to={safeNext(params.get("next"))} replace />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      navigate(safeNext(params.get("next")), { replace: true });
    } catch (err) {
      setError(messageFor(err, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.loginTitle} · Junbee`} path="/login" noindex>
      <Frame
        title={t.loginTitle}
        footer={<>{t.noAccount} <Link to="/signup" className="font-semibold text-ink underline underline-offset-4">{t.join}</Link></>}
      >
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label={t.email} name="email" type="email" autoComplete="email" required />
          <Field label={t.password} name="password" type="password" autoComplete="current-password" required />
          {error ? <p role="alert" className="text-sm font-semibold text-maroon">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-ink mt-1 min-h-[50px]">
            {busy ? t.working : t.loginButton}
          </button>
        </form>
      </Frame>
    </SitePage>
  );
}

export function Signup() {
  const { lang } = useLang();
  const t = text[lang];
  const { status, signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const config = useQuery({
    queryKey: ["auth-config"],
    queryFn: () => request<{ inviteRequired: boolean }>("/auth/config"),
    staleTime: Infinity,
  });

  if (status === "signed-in") return <Navigate to="/app/learn" replace />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await signup({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        inviteCode: form.get("inviteCode") ? String(form.get("inviteCode")) : undefined,
      });
      navigate("/app/learn", { replace: true });
    } catch (err) {
      setError(messageFor(err, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.signupTitle} · Junbee`} path="/signup" noindex>
      <Frame
        title={t.signupTitle}
        intro={t.signupIntro}
        footer={<>{t.haveAccount} <Link to="/login" className="font-semibold text-ink underline underline-offset-4">{t.login}</Link></>}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Field label={t.name} name="name" autoComplete="name" maxLength={40} required />
          <Field label={t.email} name="email" type="email" autoComplete="email" required />
          <Field label={t.password} hint={t.passwordHint} name="password" type="password" autoComplete="new-password" minLength={8} required />
          {config.data?.inviteRequired ? (
            <Field label={t.invite} hint={t.inviteHint} name="inviteCode" autoComplete="off" required />
          ) : null}
          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/85">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#15181E]" />
            <span>
              {t.consent}{" "}
              <Link to="/privacy" target="_blank" className="font-semibold underline underline-offset-4">
                {t.consentLink}
              </Link>
            </span>
          </label>
          {error ? <p role="alert" className="text-sm font-semibold text-maroon">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary mt-1 min-h-[50px]">
            {busy ? t.working : t.signupButton}
          </button>
        </form>
      </Frame>
    </SitePage>
  );
}
