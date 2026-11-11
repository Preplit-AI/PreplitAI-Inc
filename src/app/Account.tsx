import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, request, setSession, type Session } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useCopy, useLang } from "@/lib/lang";
import { disablePush } from "@/lib/push";
import type { User } from "@/lib/types";
import { PageHead } from "@/workspace/kit";
import { NotificationSettings } from "@/workspace/Notifications";
import { AppTitle, ErrorLine } from "./ui";

const COPY = {
  ko: {
    errors: {
      WrongPassword: "비밀번호가 맞지 않아요.",
      WeakPassword: "새 비밀번호는 8자 이상이어야 해요.",
      WrongConfirmation: "이메일 주소가 맞지 않아요.",
      TooManyRequests: "시도가 너무 많아요. 몇 분 뒤에 다시 해 주세요.",
      Network: "인터넷 연결을 확인해 주세요.",
    } as Record<string, string>,
    googleOnly: "Google로 로그인하는 계정이에요. 비밀번호로도 로그인하려면, 로그인 화면의",
    googleOnlyLink: "비밀번호 찾기",
    googleOnlyEnd: "에서 만들 수 있어요.",
    confirmEmail: "확인을 위해 이메일 주소를 입력하세요",
    title: "계정",
    name: "이름",
    save: "저장",
    saved: "저장했어요.",
    saveFailed: "저장하지 못했어요.",
    password: "비밀번호 바꾸기",
    current: "지금 비밀번호",
    next: "새 비밀번호",
    rule: "8자 이상. 바꾸면 다른 기기에서는 로그아웃돼요.",
    changed: "비밀번호를 바꿨어요.",
    changeFailed: "바꾸지 못했어요.",
    language: "언어",
    languageHint: "홈페이지와 워크스페이스가 같은 언어로 보여요.",
    signOut: "로그아웃",
    privacy: "개인정보 처리방침",
    deleteTitle: "계정 지우기",
    deleteText: "모든 과목, 녹취록, 노트, 카드, 복습 기록, 대화, 일정이 바로 지워지고 되돌릴 수 없어요.",
    confirm: "확인을 위해 비밀번호를 입력하세요",
    cancel: "취소",
    deleteFailed: "지우지 못했어요.",
  },
  en: {
    errors: {
      WrongPassword: "That password is not right.",
      WeakPassword: "The new password needs at least 8 characters.",
      WrongConfirmation: "That e-mail address is not this account's.",
      TooManyRequests: "Too many attempts. Try again in a few minutes.",
      Network: "Check your internet connection.",
    } as Record<string, string>,
    googleOnly: "You sign in with Google. To log in with a password as well, set one from",
    googleOnlyLink: "Forgot password?",
    googleOnlyEnd: "on the log-in page.",
    confirmEmail: "Type your e-mail address to confirm",
    title: "Account",
    name: "Name",
    save: "Save",
    saved: "Saved.",
    saveFailed: "Couldn't save.",
    password: "Change password",
    current: "Current password",
    next: "New password",
    rule: "At least 8 characters. Other devices are signed out when you change it.",
    changed: "Your password was changed.",
    changeFailed: "Couldn't change it.",
    language: "Language",
    languageHint: "The home page and the workspace show in the same language.",
    signOut: "Sign out",
    privacy: "Privacy notice",
    deleteTitle: "Delete account",
    deleteText: "Every course, transcript, note, card, review record, conversation and schedule is deleted at once, and this can't be undone.",
    confirm: "Enter your password to confirm",
    cancel: "Cancel",
    deleteFailed: "Couldn't delete.",
  },
};

export default function Account() {
  const { user, replaceUser, adoptSession, logout } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const t = useCopy(COPY);
  const { lang, setLang } = useLang();
  const home = lang === "ko" ? "/ko/" : "/";

  const [nameState, setNameState] = useState<{ error?: string; saved?: boolean }>({});
  const [pwState, setPwState] = useState<{ error?: string; saved?: boolean }>({});
  const [deleteState, setDeleteState] = useState<{ open: boolean; error?: string }>({ open: false });

  if (!user) return null;
  // Older sessions predate the field; an account counts as having a password unless the server says not.
  const hasPassword = user.hasPassword !== false;
  const message = (err: unknown, fallback: string) => (err instanceof ApiError ? t.errors[err.code] ?? fallback : fallback);

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    try {
      const res = await request<{ user: User }>("/auth/profile", { method: "PUT", body: { name } });
      replaceUser(res.user);
      setNameState({ saved: true });
    } catch (err) {
      setNameState({ error: message(err, t.saveFailed) });
    }
  };

  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const session = await request<Session>("/auth/password", {
        method: "PUT",
        body: { currentPassword: String(data.get("current") ?? ""), newPassword: String(data.get("next") ?? "") },
      });
      adoptSession(session);
      form.reset();
      setPwState({ saved: true });
    } catch (err) {
      setPwState({ error: message(err, t.changeFailed) });
    }
  };

  const deleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const typed = String(new FormData(e.currentTarget).get("confirm") ?? "");
    try {
      await request("/auth/account", { method: "DELETE", body: hasPassword ? { password: typed } : { confirmEmail: typed } });
      client.clear();
      setSession(null);
      window.location.replace(home);
    } catch (err) {
      setDeleteState({ open: true, error: message(err, t.deleteFailed) });
    }
  };

  const signOut = async () => {
    // A notification about someone's lectures must not keep arriving on a device they signed out of.
    await disablePush().catch(() => {});
    await logout();
    client.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-[40rem]">
      <AppTitle>{t.title}</AppTitle>
      <PageHead eyebrow="Preplit AI" title={t.title} sub={user.email} />

      <form onSubmit={saveName} className="window mt-5 p-4 sm:p-5">
        <label htmlFor="name" className="field-label">{t.name}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="name" name="name" defaultValue={user.name} maxLength={40} className="field" onChange={() => setNameState({})} />
          <button type="submit" className="btn-ink shrink-0">{t.save}</button>
        </div>
        <div className="mt-2">{nameState.saved ? <p className="text-sm text-slate" role="status">{t.saved}</p> : <ErrorLine>{nameState.error}</ErrorLine>}</div>
      </form>

      <section className="window mt-3 p-4 sm:p-5" aria-labelledby="language-title">
        <h2 id="language-title" className="text-sm font-semibold">{t.language}</h2>
        <p className="mt-0.5 text-xs text-slate">{t.languageHint}</p>
        <div role="group" aria-labelledby="language-title" className="mt-3 inline-flex rounded-full bg-bone p-0.5 text-sm font-medium">
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={cn("rounded-full px-4 py-1.5 transition-colors", lang === l ? "bg-white text-ink shadow-window" : "text-slate hover:text-ink")}
            >
              {l === "ko" ? "한국어" : "English"}
            </button>
          ))}
        </div>
      </section>

      {hasPassword ? (
        <form onSubmit={savePassword} className="window mt-3 flex flex-col gap-3 p-4 sm:p-5">
          <h2 className="text-sm font-semibold">{t.password}</h2>
          <div>
            <label htmlFor="current" className="field-label">{t.current}</label>
            <input id="current" name="current" type="password" autoComplete="current-password" className="field" required />
          </div>
          <div>
            <label htmlFor="next" className="field-label">{t.next}</label>
            <input id="next" name="next" type="password" autoComplete="new-password" minLength={8} className="field" required />
            <p className="mt-1 text-xs text-slate">{t.rule}</p>
          </div>
          {pwState.saved ? <p className="text-sm text-slate" role="status">{t.changed}</p> : <ErrorLine>{pwState.error}</ErrorLine>}
          <button type="submit" className="btn-ink self-start">{t.password}</button>
        </form>
      ) : (
        <section className="window mt-3 p-4 sm:p-5">
          <h2 className="text-sm font-semibold">{t.password}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            {t.googleOnly} <Link to="/forgot-password" className="font-semibold text-ink underline underline-offset-4">{t.googleOnlyLink}</Link> {t.googleOnlyEnd}
          </p>
        </section>
      )}

      <NotificationSettings />

      <div className="window mt-3 flex flex-col items-start gap-0.5 px-4 py-3 sm:px-5">
        <button type="button" onClick={signOut} className="btn-text">{t.signOut}</button>
        <Link to="/privacy" className="btn-text text-slate">{t.privacy}</Link>
      </div>

      <div className="mt-7 px-1">
        <h2 className="text-sm font-semibold">{t.deleteTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate">{t.deleteText}</p>
        {deleteState.open ? (
          <form onSubmit={deleteAccount} className="mt-3 flex flex-col gap-2">
            <label htmlFor="delete-confirm" className="field-label">{hasPassword ? t.confirm : t.confirmEmail}</label>
            {hasPassword ? (
              <input id="delete-confirm" name="confirm" type="password" autoComplete="current-password" className="field" required />
            ) : (
              <input id="delete-confirm" name="confirm" type="email" autoComplete="off" className="field" required />
            )}
            <ErrorLine>{deleteState.error}</ErrorLine>
            <div className="flex gap-3">
              <button type="submit" className="btn-quiet border-maroon text-maroon">{t.deleteTitle}</button>
              <button type="button" onClick={() => setDeleteState({ open: false })} className="btn-text">{t.cancel}</button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setDeleteState({ open: true })} className="btn-text mt-2 text-slate">{t.deleteTitle}</button>
        )}
      </div>
    </div>
  );
}
