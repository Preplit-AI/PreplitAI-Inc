import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, request, setSession, type Session } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";
import { AppTitle, ErrorLine } from "./ui";

const message = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

export default function Account() {
  const { user, replaceUser, adoptSession, logout } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();

  const [nameState, setNameState] = useState<{ error?: string; saved?: boolean }>({});
  const [pwState, setPwState] = useState<{ error?: string; saved?: boolean }>({});
  const [deleteState, setDeleteState] = useState<{ open: boolean; error?: string }>({ open: false });

  if (!user) return null;

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    try {
      const res = await request<{ user: User }>("/auth/profile", { method: "PUT", body: { name } });
      replaceUser(res.user);
      setNameState({ saved: true });
    } catch (err) {
      setNameState({ error: message(err, "저장하지 못했어요.") });
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
      setPwState({ error: message(err, "바꾸지 못했어요.") });
    }
  };

  const deleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    try {
      await request("/auth/account", { method: "DELETE", body: { password } });
      client.clear();
      setSession(null);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteState({ open: true, error: message(err, "지우지 못했어요.") });
    }
  };

  const signOut = async () => {
    await logout();
    client.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-[32rem]">
      <AppTitle>계정</AppTitle>
      <h1 className="display text-4xl">계정</h1>
      <p className="mt-2 text-slate">{user.email}</p>

      <form onSubmit={saveName} className="mt-10 border-t border-rule pt-8">
        <label htmlFor="name" className="field-label">이름</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="name" name="name" defaultValue={user.name} maxLength={40} className="field" onChange={() => setNameState({})} />
          <button type="submit" className="btn-ink min-h-[50px] shrink-0 px-6">저장</button>
        </div>
        <div className="mt-2">
          {nameState.saved ? <p className="text-sm text-slate" role="status">저장했어요.</p> : <ErrorLine>{nameState.error}</ErrorLine>}
        </div>
      </form>

      <form onSubmit={savePassword} className="mt-8 flex flex-col gap-4 border-t border-rule pt-8">
        <h2 className="text-lg font-semibold">비밀번호 바꾸기</h2>
        <div>
          <label htmlFor="current" className="field-label">지금 비밀번호</label>
          <input id="current" name="current" type="password" autoComplete="current-password" className="field" required />
        </div>
        <div>
          <label htmlFor="next" className="field-label">새 비밀번호</label>
          <input id="next" name="next" type="password" autoComplete="new-password" minLength={8} className="field" required />
          <p className="mt-1.5 text-xs text-slate">8자 이상. 바꾸면 다른 기기에서는 로그아웃돼요.</p>
        </div>
        {pwState.saved ? <p className="text-sm text-slate" role="status">비밀번호를 바꿨어요.</p> : <ErrorLine>{pwState.error}</ErrorLine>}
        <button type="submit" className="btn-ink min-h-[50px] self-start px-6">비밀번호 바꾸기</button>
      </form>

      <div className="mt-8 flex flex-col items-start gap-1 border-t border-rule pt-8">
        <button type="button" onClick={signOut} className="btn-text">로그아웃</button>
        <Link to="/privacy" className="btn-text text-slate">개인정보 처리방침</Link>
      </div>

      <div className="mt-8 border-t border-rule pt-8">
        <h2 className="text-lg font-semibold">계정 지우기</h2>
        <p className="mt-2 leading-relaxed text-slate">
          모든 과목, 녹취록, 노트, 카드, 복습 기록이 바로 지워지고 되돌릴 수 없어요.
        </p>
        {deleteState.open ? (
          <form onSubmit={deleteAccount} className="mt-4 flex flex-col gap-3">
            <label htmlFor="delete-password" className="field-label">확인을 위해 비밀번호를 입력하세요</label>
            <input id="delete-password" name="password" type="password" autoComplete="current-password" className="field" required />
            <ErrorLine>{deleteState.error}</ErrorLine>
            <div className="flex gap-3">
              <button type="submit" className="btn-quiet min-h-[44px] border-maroon text-maroon">계정 지우기</button>
              <button type="button" onClick={() => setDeleteState({ open: false })} className="btn-text">취소</button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setDeleteState({ open: true })} className="btn-text mt-3 text-slate">
            계정 지우기
          </button>
        )}
      </div>
    </div>
  );
}
