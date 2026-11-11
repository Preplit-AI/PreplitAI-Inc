import { useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiError, request, type Session } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLang, type Lang } from "@/lib/lang";
import { AuthVisual } from "@/site/AuthVisual";
import { SitePage } from "@/site/SitePage";

/*
 * Log in, sign up, and the two pages of a password reset.
 *
 * "Continue with Google" is a plain link to /api/auth/google/start: the server
 * does the whole OpenID Connect flow (server/routes/auth.js), so no Google
 * script loads here and the Content-Security-Policy stays script-src 'self'.
 * Google and "Forgot password?" show only when the server says they are set up
 * (/api/auth/config).
 */

const text = {
  ko: {
    loginTitle: "로그인",
    loginButton: "로그인",
    noAccount: "아직 계정이 없나요?",
    join: "계정 만들기",
    signupTitle: "계정 만들기",
    signupIntro: "한 학기를 함께할 Juno, 계정 하나로 시작해요.",
    signupButton: "계정 만들기",
    haveAccount: "이미 계정이 있나요?",
    login: "로그인",
    name: "이름",
    email: "이메일",
    password: "비밀번호",
    passwordHint: "8자 이상",
    invite: "초대 코드",
    inviteHint: "파일럿 안내에서 받은 코드",
    consent: "개인정보 처리방침을 읽었고, 강의를 처리하고 질문에 답하기 위해 수업 녹음, 녹취록, 질문이 미국의 Groq, Inc.로 전송되는 것에 동의해요.",
    consentLink: "개인정보 처리방침",
    consentFirst: "먼저 개인정보 처리방침 동의에 체크해 주세요.",
    working: "잠시만요",
    google: "Google로 계속하기",
    or: "또는",
    forgot: "비밀번호를 잊으셨나요?",
    forgotTitle: "비밀번호 다시 정하기",
    forgotIntro: "가입한 이메일을 입력하면, 새 비밀번호를 정할 링크를 보내 드려요.",
    forgotButton: "링크 보내기",
    forgotSent: "그 주소로 가입한 계정이 있다면 링크를 보냈어요. 한 시간 동안 쓸 수 있어요. 메일이 보이지 않으면 스팸함도 확인해 주세요.",
    backToLogin: "로그인으로 돌아가기",
    resetTitle: "새 비밀번호 정하기",
    newPassword: "새 비밀번호",
    confirmPassword: "새 비밀번호 한 번 더",
    resetButton: "비밀번호 저장",
    mismatch: "두 비밀번호가 달라요.",
    noToken: "링크가 완전하지 않아요. 메일의 링크를 그대로 열거나, 새 링크를 받아 주세요.",
    newLink: "새 링크 받기",
  },
  en: {
    loginTitle: "Log in",
    loginButton: "Log in",
    noAccount: "No account yet?",
    join: "Create one",
    signupTitle: "Create your account",
    signupIntro: "One account for Juno, your companion for the whole semester.",
    signupButton: "Create account",
    haveAccount: "Already have an account?",
    login: "Log in",
    name: "Name",
    email: "E-mail",
    password: "Password",
    passwordHint: "At least 8 characters",
    invite: "Invite code",
    inviteHint: "From your pilot invitation",
    consent: "I have read the privacy notice and agree that recordings, transcripts and questions are sent to Groq, Inc. in the United States so lectures can be processed and questions answered.",
    consentLink: "privacy notice",
    consentFirst: "Tick the privacy notice box first.",
    working: "One moment",
    google: "Continue with Google",
    or: "or",
    forgot: "Forgot password?",
    forgotTitle: "Reset your password",
    forgotIntro: "Enter the e-mail you signed up with, and we'll send a link to choose a new password.",
    forgotButton: "Send the link",
    forgotSent: "If an account uses that address, the link is on its way. It works for one hour. If it doesn't arrive, look in spam.",
    backToLogin: "Back to log in",
    resetTitle: "Choose a new password",
    newPassword: "New password",
    confirmPassword: "New password again",
    resetButton: "Save the password",
    mismatch: "The two passwords are not the same.",
    noToken: "This link is incomplete. Open the link from the e-mail as it is, or ask for a new one.",
    newLink: "Get a new link",
  },
};

const errors: Record<Lang, Record<string, string>> = {
  ko: {
    InvalidCredentials: "이메일 또는 비밀번호가 맞지 않아요.",
    InvalidCredentialsGoogle: "이메일 또는 비밀번호가 맞지 않아요. Google로 가입했다면 Google로 계속하기를 눌러 주세요.",
    EmailTaken: "이미 가입된 이메일이에요. 로그인해 주세요.",
    WeakPassword: "비밀번호는 8자 이상이어야 해요.",
    InvalidEmail: "이메일 주소를 확인해 주세요.",
    InvalidName: "이름을 입력해 주세요.",
    InvalidInvite: "초대 코드가 맞지 않아요.",
    TooManyRequests: "시도가 너무 많아요. 몇 분 뒤에 다시 해 주세요.",
    Network: "인터넷 연결을 확인해 주세요.",
    GoogleUnavailable: "지금은 Google 로그인을 쓸 수 없어요. 이메일과 비밀번호로 로그인해 주세요.",
    GoogleFailed: "Google 로그인이 끝나지 않았어요. 다시 해 주세요.",
    GoogleCancelled: "Google 로그인을 취소했어요.",
    GoogleEmailUnverified: "Google에서 확인되지 않은 이메일 주소라 쓸 수 없어요.",
    GoogleNoAccount: "이 Google 계정으로 만든 계정이 아직 없어요. 개인정보 처리방침 동의에 체크하고 Google로 계속하면 바로 만들어져요.",
    GoogleOtherAccount: "이 이메일 주소는 다른 Google 계정과 연결되어 있어요.",
    GoogleInviteRequired: "가입에 초대 코드가 필요해요. 이메일과 초대 코드로 먼저 계정을 만들어 주세요.",
    InvalidResetToken: "링크가 만료되었거나 이미 쓰였어요. 새 링크를 받아 주세요.",
    ResetUnavailable: "지금은 비밀번호를 다시 정할 수 없어요.",
    default: "지금은 처리하지 못했어요. 잠시 뒤에 다시 해 주세요.",
  },
  en: {
    InvalidCredentials: "That e-mail and password do not match.",
    InvalidCredentialsGoogle: "That e-mail and password do not match. If you signed up with Google, use Continue with Google.",
    EmailTaken: "That e-mail already has an account. Log in instead.",
    WeakPassword: "The password needs at least 8 characters.",
    InvalidEmail: "Check the e-mail address.",
    InvalidName: "Enter your name.",
    InvalidInvite: "That invite code is not right.",
    TooManyRequests: "Too many attempts. Try again in a few minutes.",
    Network: "Check your internet connection.",
    GoogleUnavailable: "Google sign-in isn't available right now. Use your e-mail and password.",
    GoogleFailed: "Google sign-in didn't finish. Try again.",
    GoogleCancelled: "Google sign-in was cancelled.",
    GoogleEmailUnverified: "Google hasn't verified that account's e-mail address, so it can't be used here.",
    GoogleNoAccount: "No account uses that Google account yet. Tick the privacy notice box and continue with Google to create one.",
    GoogleOtherAccount: "That e-mail address is already linked to a different Google account.",
    GoogleInviteRequired: "Sign-up needs an invite code. Create the account with your e-mail and the code first.",
    InvalidResetToken: "This link has expired or was already used. Ask for a new one.",
    ResetUnavailable: "Password reset isn't available right now.",
    default: "That did not work. Try again in a moment.",
  },
};

function messageFor(err: unknown, lang: Lang, googleOn = false) {
  const code = err instanceof ApiError ? err.code : typeof err === "string" ? err : "default";
  if (code === "InvalidCredentials" && googleOn) return errors[lang].InvalidCredentialsGoogle;
  return errors[lang][code] ?? errors[lang].default;
}

/** Only in-app paths, so a crafted ?next= cannot send someone to another site. */
function safeNext(value: string | null) {
  return value && /^\/(app|workspace)(\/[\w\-/]*)?$/.test(value) ? value : "/workspace";
}

type AuthConfig = { inviteRequired: boolean; google: boolean; passwordReset: boolean };

function useAuthConfig() {
  return useQuery({
    queryKey: ["auth-config"],
    queryFn: () => request<AuthConfig>("/auth/config"),
    staleTime: Infinity,
  });
}

function Frame({ title, intro, children, footer }: { title: string; intro?: string; children: ReactNode; footer: ReactNode }) {
  const { lang } = useLang();
  return (
    <section className="page grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-6">
      <div className="w-full max-w-[28rem] lg:col-span-5">
        <h1 className="display text-[2.75rem] leading-[1.1]">{title}</h1>
        {intro ? <p className="mt-4 text-lg leading-relaxed text-ink">{intro}</p> : null}
        <div className="mt-8">{children}</div>
        <p className="mt-8 border-t border-rule pt-6 text-[0.9375rem] text-slate">{footer}</p>
      </div>
      <AuthVisual lang={lang} className="hidden lg:col-span-6 lg:col-start-7 lg:flex" />
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

function ErrorText({ children }: { children: ReactNode }) {
  return children ? <p role="alert" className="text-sm font-semibold text-maroon">{children}</p> : null;
}

/** Google's "G", in Google's own colours, as its sign-in branding asks. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function googleStart(intent: "login" | "signup", next: string) {
  return `/api/auth/google/start?intent=${intent}&next=${encodeURIComponent(next)}`;
}

function GoogleButton({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
  const className = "inline-flex min-h-[50px] w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 text-[0.9375rem] font-medium text-[#1F1F1F] transition-colors hover:bg-[#F7F8F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";
  if (href) {
    return <a href={href} className={className}><GoogleMark />{label}</a>;
  }
  return <button type="button" onClick={onClick} className={className}><GoogleMark />{label}</button>;
}

function OrLine({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate" role="separator">
      <span className="h-px flex-1 bg-rule" />
      {label}
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

export function Login() {
  const { lang } = useLang();
  const t = text[lang];
  const { status, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const config = useAuthConfig();
  const googleOn = Boolean(config.data?.google);
  // A Google sign-in that did not finish comes back here with ?error=<code>.
  const [error, setError] = useState<string | null>(() => (params.get("error") ? messageFor(params.get("error"), lang) : null));
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"));

  if (status === "signed-in") return <Navigate to={next} replace />;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      navigate(next, { replace: true });
    } catch (err) {
      setError(messageFor(err, lang, googleOn));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.loginTitle} · Preplit AI`} path="/login" noindex>
      <Frame
        title={t.loginTitle}
        footer={<>{t.noAccount} <Link to="/signup" className="font-semibold text-ink underline underline-offset-4">{t.join}</Link></>}
      >
        {googleOn ? (
          <>
            <GoogleButton label={t.google} href={googleStart("login", next)} />
            <OrLine label={t.or} />
          </>
        ) : null}
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label={t.email} name="email" type="email" autoComplete="email" required />
          <div>
            <Field label={t.password} name="password" type="password" autoComplete="current-password" required />
            {config.data?.passwordReset ? (
              <p className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm font-medium text-ink underline underline-offset-4">{t.forgot}</Link>
              </p>
            ) : null}
          </div>
          <ErrorText>{error}</ErrorText>
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
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const config = useAuthConfig();
  const [error, setError] = useState<string | null>(null);
  // Under the Google button: a Google sign-in that came back with ?error=<code>, or the consent reminder.
  const [googleNote, setGoogleNote] = useState<string | null>(() => (params.get("error") ? messageFor(params.get("error"), lang) : null));
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const consentBox = useRef<HTMLInputElement>(null);

  if (status === "signed-in") return <Navigate to="/workspace" replace />;

  // The consent covers Google too, so the box comes first and Google waits for it.
  const withGoogle = () => {
    if (!consent) {
      setGoogleNote(t.consentFirst);
      consentBox.current?.focus();
      return;
    }
    window.location.assign(googleStart("signup", "/workspace"));
  };

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
      navigate("/workspace", { replace: true });
    } catch (err) {
      setError(messageFor(err, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.signupTitle} · Preplit AI`} path="/signup" noindex>
      <Frame
        title={t.signupTitle}
        intro={t.signupIntro}
        footer={<>{t.haveAccount} <Link to="/login" className="font-semibold text-ink underline underline-offset-4">{t.login}</Link></>}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/85">
            <input
              ref={consentBox}
              type="checkbox"
              name="consent"
              required
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (e.target.checked && googleNote === t.consentFirst) setGoogleNote(null);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[#0A0A0A]"
            />
            <span>
              {t.consent}{" "}
              <Link to="/privacy" target="_blank" className="font-semibold underline underline-offset-4">
                {t.consentLink}
              </Link>
            </span>
          </label>
          {config.data?.google ? (
            <div>
              <GoogleButton label={t.google} onClick={withGoogle} />
              {googleNote ? <div className="mt-3"><ErrorText>{googleNote}</ErrorText></div> : null}
              <OrLine label={t.or} />
            </div>
          ) : googleNote ? (
            <ErrorText>{googleNote}</ErrorText>
          ) : null}
          <Field label={t.name} name="name" autoComplete="name" maxLength={40} required />
          <Field label={t.email} name="email" type="email" autoComplete="email" required />
          <Field label={t.password} hint={t.passwordHint} name="password" type="password" autoComplete="new-password" minLength={8} required />
          {config.data?.inviteRequired ? (
            <Field label={t.invite} hint={t.inviteHint} name="inviteCode" autoComplete="off" required />
          ) : null}
          <ErrorText>{error}</ErrorText>
          <button type="submit" disabled={busy} className="btn-ink mt-1 min-h-[50px]">
            {busy ? t.working : t.signupButton}
          </button>
        </form>
      </Frame>
    </SitePage>
  );
}

export function ForgotPassword() {
  const { lang } = useLang();
  const t = text[lang];
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setBusy(true);
    setError(null);
    try {
      await request("/auth/password/forgot", { method: "POST", body: { email, lang } });
      setSent(true);
    } catch (err) {
      setError(messageFor(err, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.forgotTitle} · Preplit AI`} path="/forgot-password" noindex>
      <Frame
        title={t.forgotTitle}
        intro={sent ? undefined : t.forgotIntro}
        footer={<Link to="/login" className="font-semibold text-ink underline underline-offset-4">{t.backToLogin}</Link>}
      >
        {sent ? (
          <p role="status" className="text-lg leading-relaxed text-ink">{t.forgotSent}</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Field label={t.email} name="email" type="email" autoComplete="email" required />
            <ErrorText>{error}</ErrorText>
            <button type="submit" disabled={busy} className="btn-ink mt-1 min-h-[50px]">
              {busy ? t.working : t.forgotButton}
            </button>
          </form>
        )}
      </Frame>
    </SitePage>
  );
}

/**
 * The token comes in the fragment (#token=…), which never leaves the browser; it
 * is cleared from the address bar once read. Kept here too, so a second read
 * (React's development double render) still finds it.
 */
let resetToken: string | null = null;
function readResetToken() {
  const match = window.location.hash.match(/token=([a-f0-9]{64})/);
  if (match) {
    resetToken = match[1];
    window.history.replaceState(null, "", window.location.pathname);
  }
  return resetToken;
}

export function ResetPassword() {
  const { lang } = useLang();
  const t = text[lang];
  const { adoptSession } = useAuth();
  const navigate = useNavigate();
  const [token] = useState(readResetToken);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("again") ?? "")) {
      setError(t.mismatch);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await request<Session>("/auth/password/reset", { method: "POST", body: { token, password } });
      adoptSession(session);
      navigate("/workspace", { replace: true });
    } catch (err) {
      setError(messageFor(err, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SitePage title={`${t.resetTitle} · Preplit AI`} path="/reset-password" noindex>
      <Frame
        title={t.resetTitle}
        footer={<Link to="/login" className="font-semibold text-ink underline underline-offset-4">{t.backToLogin}</Link>}
      >
        {token ? (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Field label={t.newPassword} hint={t.passwordHint} name="password" type="password" autoComplete="new-password" minLength={8} required />
            <Field label={t.confirmPassword} name="again" type="password" autoComplete="new-password" minLength={8} required />
            <ErrorText>{error}</ErrorText>
            <button type="submit" disabled={busy} className="btn-ink mt-1 min-h-[50px]">
              {busy ? t.working : t.resetButton}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <p role="alert" className="text-lg leading-relaxed text-ink">{t.noToken}</p>
            <Link to="/forgot-password" className="btn-ink min-h-[50px] self-start">{t.newLink}</Link>
          </div>
        )}
      </Frame>
    </SitePage>
  );
}
