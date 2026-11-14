import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuth } from "./auth";
import { useLang } from "./i18n";
import * as notify from "./notify";
import { useOverview, useTasks } from "./queries";
import { dailyQuizHour, isQuiet, planReminders } from "./reminders";

/*
 * Reminders as notifications on this device.
 *
 * The student switches them on once per device; the system then asks its own
 * permission question. From there this keeps the device's schedule in step with
 * their tasks: every change to a task, to quiet hours or to the daily quiz
 * replaces the schedule, and signing out clears it, so a notification about one
 * student's deadlines never arrives for the next person on the device.
 *
 * What is scheduled is decided in reminders.ts (pure, tested); how it is
 * delivered is notify.ts on a phone and notify.web.ts in a browser.
 */

/** Kept on the device: the choice is about this phone, not the account. */
const KEY = "preplit.notify";

type NotificationsValue = {
  /** What the system says: granted, denied, not asked yet, or not possible here. */
  permission: notify.Permission;
  /** The student switched them on for this device. */
  wanted: boolean;
  /** The student wants them and the system allows them. */
  on: boolean;
  /** The student switched them on, but the system is blocking them. */
  blocked: boolean;
  /** Delivered with the app closed (the installed app) or only while it is open (a browser). */
  whenClosed: boolean;
  canOpenSettings: boolean;
  /** How many notifications are scheduled right now. */
  scheduled: number;
  dailyQuizHour: number;
  turnOn: () => Promise<notify.Permission>;
  turnOff: () => Promise<void>;
  sendTest: () => Promise<boolean>;
  openSettings: () => void;
};

const NotificationsContext = createContext<NotificationsValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status, profile } = useAuth();
  const { t } = useLang();
  const [wanted, setWanted] = useState(false);
  const [permission, setPermission] = useState<notify.Permission>("undetermined");
  const [scheduled, setScheduled] = useState(0);

  const refreshPermission = useCallback(() => notify.permission().then(setPermission), []);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((saved) => setWanted(saved === "1")).catch(() => {});
    refreshPermission();
    // The student may have changed the permission in the system's settings while away.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshPermission();
    });
    return () => subscription.remove();
  }, [refreshPermission]);

  // A pressed notification opens the screen it is about.
  useEffect(() => notify.onOpen((url) => router.push(url as never)), []);

  const ready = status === "signed-in" && Boolean(profile?.onboarded);
  const on = wanted && permission === "granted";
  const watching = ready && on;

  // The same cached lists the screens use, so a task changed anywhere reschedules at once.
  const tasks = useTasks("open", undefined, watching);
  const overview = useOverview(watching);

  const quietFrom = profile?.quietFrom ?? 22;
  const quietUntil = profile?.quietUntil ?? 8;
  const quizHour = dailyQuizHour({ from: quietFrom, until: quietUntil });
  const wantsQuiz = Boolean(profile?.dailyQuiz);
  // The daily reminder is only worth sending once there is something to review.
  const hasCards = (overview.data?.courses ?? []).some((course) => course.totalCards > 0);

  useEffect(() => {
    if (!watching) {
      notify.clearSchedule().then(() => setScheduled(0));
      return;
    }
    if (!tasks.data) return;
    const words = { today: t.home.dueToday, tomorrow: t.home.dueTomorrow, inDays: t.home.dueIn };
    const planned = planReminders(tasks.data, { from: quietFrom, until: quietUntil }, new Date(), words, "/tasks");
    const daily = wantsQuiz && hasCards ? { hour: quizHour, title: t.notify.quizTitle, body: t.notify.quizBody, url: "/quiz" } : null;
    // Juno drops in with a question late morning and mid-afternoon, never inside quiet hours.
    const nudges = wantsQuiz && hasCards
      ? [11, 15].filter((hour) => !isQuiet(hour, { from: quietFrom, until: quietUntil })).map((hour, i) => ({ hour, title: t.homeX.nudgeTitle, body: t.homeX.nudges[i % t.homeX.nudges.length], url: "/quiz" }))
      : [];
    let cancelled = false;
    notify
      .replaceSchedule(planned, daily, nudges)
      .then((count) => {
        if (!cancelled) setScheduled(count);
      })
      .catch(() => {
        if (!cancelled) setScheduled(0);
      });
    return () => {
      cancelled = true;
    };
  }, [watching, tasks.data, quietFrom, quietUntil, quizHour, wantsQuiz, hasCards, t]);

  const turnOn = useCallback(async () => {
    // The choice is recorded first: the system's question may go unanswered, or be
    // answered "no" and changed later in settings, and reminders should start then.
    setWanted(true);
    AsyncStorage.setItem(KEY, "1").catch(() => {});
    const answer = await notify.ask();
    setPermission(answer);
    return answer;
  }, []);

  const turnOff = useCallback(async () => {
    setWanted(false);
    AsyncStorage.setItem(KEY, "0").catch(() => {});
    await notify.clearSchedule();
    setScheduled(0);
  }, []);

  const sendTest = useCallback(() => notify.showNow({ title: t.notify.testTitle, body: t.notify.testBody, url: "/" }), [t]);

  const value = useMemo<NotificationsValue>(
    () => ({
      permission,
      wanted,
      on,
      blocked: wanted && permission === "denied",
      whenClosed: notify.DELIVERS_WHEN_CLOSED,
      canOpenSettings: notify.CAN_OPEN_SETTINGS,
      scheduled,
      dailyQuizHour: quizHour,
      turnOn,
      turnOff,
      sendTest,
      openSettings: notify.openSystemSettings,
    }),
    [permission, on, wanted, scheduled, quizHour, turnOn, turnOff, sendTest],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error("useNotifications must be used inside NotificationsProvider");
  return value;
}
