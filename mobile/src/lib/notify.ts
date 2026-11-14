import { Linking, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Planned } from "./reminders";

/*
 * Delivering notifications in the installed app (Android and iOS).
 *
 * They are local notifications: the phone itself is told when to show each one,
 * so they arrive with the app closed and with no server or connection involved.
 * Nothing about the student's tasks leaves the phone for this.
 *
 * The browser has its own version of this file, notify.web.ts, with the same
 * exports; the bundler picks the right one.
 */

export type Permission = "granted" | "denied" | "undetermined" | "unsupported";
export type Daily = { hour: number; title: string; body: string; url: string };

/** True here: the system delivers these whether or not the app is open. */
export const DELIVERS_WHEN_CLOSED = true;
/** Whether the student can be sent to the system's settings to allow notifications. */
export const CAN_OPEN_SETTINGS = true;

const CHANNEL = "reminders";
let prepared: Promise<void> | null = null;

/** Once: how a notification shows while the app is open, and Android's channel for them. */
function prepare() {
  prepared ??= (async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: "Reminders", importance: Notifications.AndroidImportance.DEFAULT });
    }
  })();
  return prepared;
}

function read(status: Notifications.NotificationPermissionsStatus): Permission {
  if (status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return "granted";
  return status.canAskAgain ? "undetermined" : "denied";
}

export async function permission(): Promise<Permission> {
  try {
    return read(await Notifications.getPermissionsAsync());
  } catch {
    return "unsupported";
  }
}

/** Asks the student, with the system's own prompt. Asked only when they switch reminders on. */
export async function ask(): Promise<Permission> {
  try {
    await prepare();
    return read(await Notifications.requestPermissionsAsync());
  } catch {
    return "unsupported";
  }
}

/** Shows one notification now. @returns whether the system accepted it. */
export async function showNow(note: { title: string; body: string; url: string }): Promise<boolean> {
  try {
    await prepare();
    await Notifications.scheduleNotificationAsync({ content: { title: note.title, body: note.body, data: { url: note.url } }, trigger: null });
    return true;
  } catch {
    return false;
  }
}

/**
 * Replaces everything scheduled with this plan: the task reminders, and the
 * daily quiz reminder if there is one. @returns how many were scheduled.
 */
export async function replaceSchedule(planned: Planned[], daily: Daily | null, nudges: Daily[] = []): Promise<number> {
  await prepare();
  await Notifications.cancelAllScheduledNotificationsAsync();
  let count = 0;
  for (const note of planned) {
    await Notifications.scheduleNotificationAsync({
      content: { title: note.title, body: note.body, data: { url: note.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: note.at, channelId: CHANNEL },
    });
    count += 1;
  }
  // A question or two from Juno at other hours of the day, each its own repeating notification.
  for (const nudge of nudges) {
    await Notifications.scheduleNotificationAsync({
      content: { title: nudge.title, body: nudge.body, data: { url: nudge.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: nudge.hour, minute: 30, channelId: CHANNEL },
    });
    count += 1;
  }
  if (daily) {
    await Notifications.scheduleNotificationAsync({
      content: { title: daily.title, body: daily.body, data: { url: daily.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: daily.hour, minute: 0, channelId: CHANNEL },
    });
    count += 1;
  }
  return count;
}

/** Removes everything scheduled: reminders off, or the student signed out of this device. */
export async function clearSchedule(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing was scheduled.
  }
}

/** Calls `open` with the screen a notification leads to when the student presses it. */
export function onOpen(open: (url: string) => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = response.notification.request.content.data?.url;
    if (typeof url === "string" && url.startsWith("/")) open(url);
  });
  return () => subscription.remove();
}

export function openSystemSettings() {
  Linking.openSettings().catch(() => {});
}
