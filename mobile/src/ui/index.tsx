import type { ComponentProps, ComponentRef, ReactNode, Ref } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
// Imported by its own path so only this one icon font is bundled, not every family.
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLUMN, TABLET, color, font, radius, scheme, space, type Scheme } from "@/lib/theme";

/*
 * The design system: every screen is built from these parts, so the app looks
 * like one thing. Sizes follow one rule: nothing smaller than 12 pt, and every
 * control is at least 44 pt tall.
 *
 * Colours come from the theme in use (Dawn or Dusk), so every style that holds
 * a colour is made per theme, on first use.
 */

function themed<S>(make: () => S): () => S {
  const made: Partial<Record<Scheme, S>> = {};
  return () => (made[scheme()] ??= make());
}

export type IconName = ComponentProps<typeof Feather>["name"];
export const Icon = Feather;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  return { width, height, tablet: width >= TABLET };
}

// ── Text ─────────────────────────────────────────────────────────────────────
// Headings are Lexend; everything a student operates is Schibsted Grotesk.
const TEXT = themed(() => StyleSheet.create({
  display: { fontFamily: font.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.7, color: color.ink },
  title: { fontFamily: font.display, fontSize: 21, lineHeight: 27, letterSpacing: -0.4, color: color.ink },
  /** Juno speaking in the first person. */
  voice: { fontFamily: font.voice, fontSize: 17, lineHeight: 25, letterSpacing: -0.2, color: color.ink },
  heading: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23, color: color.ink },
  body: { fontFamily: font.regular, fontSize: 15.5, lineHeight: 23, color: color.ink },
  strong: { fontFamily: font.semibold, fontSize: 15.5, lineHeight: 23, color: color.ink },
  small: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 19, color: color.inkMuted },
  label: { fontFamily: font.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: "uppercase", color: color.inkMuted },
}));
export type TextVariant = "display" | "title" | "voice" | "heading" | "body" | "strong" | "small" | "label";

export function T({ variant = "body", tone, style, ...rest }: TextProps & { variant?: TextVariant; tone?: string }) {
  return <Text {...rest} style={[TEXT()[variant], tone ? { color: tone } : null, style]} />;
}

// ── Screen ───────────────────────────────────────────────────────────────────
type ScreenProps = {
  children: ReactNode;
  /** Shown above the content: a back button, the title, and one action on the right. */
  title?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
  /** Stays at the bottom, above the keyboard: the screen's main action. */
  footer?: ReactNode;
  scroll?: boolean;
  /** Wider than one reading column, for tablet layouts with two columns. */
  wide?: boolean;
  background?: string;
  padded?: boolean;
};

export function Screen({ children, title, back, right, footer, scroll = true, wide = false, background, padded = true }: ScreenProps) {
  const styles = sheet();
  background ??= color.ground;
  const insets = useSafeAreaInsets();
  const { tablet } = useLayout();
  const column: ViewStyle = { width: "100%", maxWidth: wide && tablet ? 1080 : COLUMN, alignSelf: "center", paddingHorizontal: padded ? (tablet ? space.xxl : space.xl) : 0 };
  const hasHeader = Boolean(title || back || right);
  const goBack = typeof back === "function" ? back : () => (router.canGoBack() ? router.back() : router.replace("/"));

  const body = (
    <View style={[column, { paddingTop: hasHeader ? space.sm : space.lg, paddingBottom: footer ? space.lg : space.huge, flexGrow: 1 }]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: background }}>
      <View style={{ height: insets.top }} />
      {hasHeader ? (
        <View style={[column, styles.header]}>
          {back ? <IconButton icon="arrow-left" label="Back" onPress={goBack} /> : <View style={{ width: 4 }} />}
          <T variant="heading" numberOfLines={1} style={{ flex: 1, textAlign: back ? "center" : "left" }}>{title}</T>
          {right ?? <View style={{ width: back ? 44 : 0 }} />}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
      {footer ? (
        <View style={{ borderTopWidth: 1, borderTopColor: color.rule, backgroundColor: background }}>
          <View style={[column, { paddingTop: space.md, paddingBottom: Math.max(insets.bottom, space.md) }]}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", icon, loading, disabled, small, style }: ButtonProps) {
  const styles = sheet();
  const off = disabled || loading;
  const fg = variant === "primary" ? color.onAction : variant === "danger" ? color.danger : color.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(off), busy: Boolean(loading) }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && { minHeight: 44, paddingHorizontal: space.lg },
        variant === "primary" && { backgroundColor: color.action },
        variant === "secondary" && { backgroundColor: color.surface, borderWidth: 1, borderColor: color.ruleStrong },
        variant === "danger" && { backgroundColor: color.surface, borderWidth: 1, borderColor: color.danger },
        pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] },
        off && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: small ? 14.5 : 16, color: fg }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, tone, filled }: { icon: IconName; label: string; onPress?: () => void; tone?: string; filled?: boolean }) {
  const styles = sheet();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, filled && { backgroundColor: color.surface, borderWidth: 1, borderColor: color.rule }, pressed && { backgroundColor: color.sunken }]}
    >
      <Icon name={icon} size={20} color={tone ?? color.ink} />
    </Pressable>
  );
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: string }) {
  const styles = sheet();
  const base = [styles.card, tone ? { backgroundColor: tone, borderColor: tone } : null, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

/** A heading above a group, with an optional action on its right. */
export function Section({ title, action, onAction, children, style }: { title: string; action?: string; onAction?: () => void; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: space.xxl }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md, minHeight: 24 }}>
        <T variant="label">{title}</T>
        {action ? (
          <Pressable accessibilityRole="button" hitSlop={10} onPress={onAction}>
            <T variant="small" tone={color.ink} style={{ fontFamily: font.semibold }}>{action}</T>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** One line in a list: an icon or mark, a title, a line under it, and where it leads. */
export function Row({ icon, mark, title, sub, right, onPress, last }: { icon?: IconName; mark?: ReactNode; title: string; sub?: string | null; right?: ReactNode; onPress?: () => void; last?: boolean }) {
  const styles = sheet();
  const content = (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: color.rule }]}>
      {mark ?? (icon ? <View style={styles.rowIcon}><Icon name={icon} size={18} color={color.ink} /></View> : null)}
      <View style={{ flex: 1 }}>
        <T variant="strong" numberOfLines={2}>{title}</T>
        {sub ? <T variant="small" numberOfLines={2}>{sub}</T> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={18} color={color.inkFaint} /> : null)}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: color.sunken }}>
      {content}
    </Pressable>
  );
}

export function Badge({ label, bg, fg, icon }: { label: string; bg?: string; fg?: string; icon?: IconName }) {
  const styles = sheet();
  bg ??= color.sunken;
  fg ??= color.inkSoft;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: 12, color: fg }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/** A plain statement of something the student should know: a limit, an error, a state. */
export function Notice({ text, tone = "info", icon }: { text: string; tone?: "info" | "error" | "warn" | "good"; icon?: IconName }) {
  const styles = sheet();
  const look = {
    info: { bg: color.sunken, fg: color.inkSoft, icon: "info" as IconName },
    error: { bg: color.dangerSoft, fg: color.dangerDeep, icon: "alert-circle" as IconName },
    warn: { bg: color.lampSoft, fg: color.lampInk, icon: "alert-triangle" as IconName },
    good: { bg: color.settledSoft, fg: color.settled, icon: "check-circle" as IconName },
  }[tone];
  return (
    <View accessibilityRole={tone === "error" ? "alert" : undefined} style={[styles.notice, { backgroundColor: look.bg }]}>
      <Icon name={icon ?? look.icon} size={16} color={look.fg} style={{ marginTop: 2 }} />
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 13.5, lineHeight: 19, color: look.fg }}>{text}</Text>
    </View>
  );
}

// ── Inputs ───────────────────────────────────────────────────────────────────
/** What a ref to a text field holds: use it to move the cursor to the next field. */
export type InputRef = ComponentRef<typeof TextInput>;
type FieldProps = TextInputProps & { label: string; hint?: string; error?: string | null; optional?: string; ref?: Ref<InputRef> };

export function Field({ label, hint, error, optional, style, multiline, ref, ...input }: FieldProps) {
  const styles = sheet();
  return (
    <View style={{ marginBottom: space.lg }}>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {optional ? <Text style={[styles.fieldLabel, { color: color.inkFaint, fontFamily: font.regular }]}>({optional})</Text> : null}
      </View>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={color.inkFaint}
        multiline={multiline}
        {...input}
        style={[styles.input, multiline && { minHeight: 120, paddingTop: 12, textAlignVertical: "top" }, error ? { borderColor: color.danger } : null, style]}
      />
      {error ? <T variant="small" tone={color.danger} style={{ marginTop: 6 }}>{error}</T> : hint ? <T variant="small" style={{ marginTop: 6 }}>{hint}</T> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  const styles = sheet();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      aria-pressed={selected === undefined ? undefined : selected}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && { backgroundColor: color.action, borderColor: color.action }, pressed && { opacity: 0.8 }]}
    >
      {icon ? <Icon name={icon} size={14} color={selected ? color.onAction : color.ink} /> : null}
      <Text style={{ fontFamily: font.medium, fontSize: 14.5, color: selected ? color.onAction : color.ink }}>{label}</Text>
    </Pressable>
  );
}

export function Chips({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }, style]}>{children}</View>;
}

/** Two to four choices, one of which is on. */
export function Segment<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (value: V) => void }) {
  const styles = sheet();
  return (
    <View style={styles.segment} accessibilityRole="tablist">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onChange(option.value)} style={[styles.segmentItem, on && styles.segmentOn]}>
            <Text style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 14, color: on ? color.ink : color.inkMuted }} numberOfLines={1}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (value: boolean) => void }) {
  const styles = sheet();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} aria-checked={value} accessibilityLabel={label} onPress={() => onChange(!value)} style={[styles.row, { minHeight: 56 }]}>
      <View style={{ flex: 1 }}>
        <T variant="strong">{label}</T>
        {sub ? <T variant="small">{sub}</T> : null}
      </View>
      <View style={[styles.toggle, value && { backgroundColor: color.action }]}>
        <View style={[styles.toggleKnob, value && { transform: [{ translateX: 20 }] }]} />
      </View>
    </Pressable>
  );
}

export function Checkbox({ checked, onChange, children, label }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; label: string }) {
  const styles = sheet();
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} aria-checked={checked} accessibilityLabel={label} onPress={() => onChange(!checked)} style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
      <View style={[styles.checkbox, checked && { backgroundColor: color.action, borderColor: color.action }]}>
        {checked ? <Icon name="check" size={15} color={color.onAction} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

// ── Overlays and states ──────────────────────────────────────────────────────
/** A panel that rises from the bottom (a centred card on tablets) for one short job: add a task, add a course. */
export function Sheet({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const styles = sheet();
  const insets = useSafeAreaInsets();
  const { tablet, height } = useLayout();
  return (
    <Modal visible={visible} transparent animationType={tablet ? "fade" : "slide"} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.sheetBackdrop, tablet && { justifyContent: "center", alignItems: "center" }]}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: height * 0.92 }, tablet ? { width: 520, borderRadius: radius.xl } : null]}>
          <View style={styles.sheetHeader}>
            <T variant="heading" style={{ flex: 1 }}>{title}</T>
            <IconButton icon="x" label="Close" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.xl, paddingTop: space.sm }} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer ? <View style={{ padding: space.xl, paddingTop: space.md, paddingBottom: Math.max(insets.bottom, space.lg), borderTopWidth: 1, borderTopColor: color.rule }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space.huge, gap: space.md }} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={color.action} />
      {label ? <T variant="small">{label}</T> : null}
    </View>
  );
}

/** A request failed: say so plainly and offer to try again. */
export function Failed({ text, retryLabel, onRetry }: { text: string; retryLabel: string; onRetry: () => void }) {
  return (
    <View style={{ padding: space.xl, gap: space.lg, alignItems: "center" }}>
      <Notice tone="error" text={text} />
      <Button small variant="secondary" icon="refresh-cw" label={retryLabel} onPress={onRetry} />
    </View>
  );
}

export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  const styles = sheet();
  return (
    <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: tone ?? color.action, height: "100%", borderRadius: radius.pill }} />
    </View>
  );
}

const sheet = themed(() => StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: 52 },
  button: { minHeight: 50, borderRadius: radius.md, paddingHorizontal: space.xl, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.rule, padding: space.lg },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, minHeight: 60 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: color.sunken, alignItems: "center", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, alignSelf: "flex-start" },
  notice: { flexDirection: "row", gap: space.sm, padding: space.md, borderRadius: radius.md },
  fieldLabel: { fontFamily: font.semibold, fontSize: 13.5, color: color.ink } as TextStyle,
  input: {
    minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface,
    paddingHorizontal: space.lg, fontFamily: font.regular, fontSize: 16, color: color.ink,
  },
  chip: { minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: color.ruleStrong, backgroundColor: color.surface, flexDirection: "row", alignItems: "center", gap: 6 },
  segment: { flexDirection: "row", backgroundColor: color.sunken, borderRadius: radius.pill, padding: 3 },
  segmentItem: { flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: space.md },
  segmentOn: { backgroundColor: color.surface, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: color.ruleStrong, padding: 4 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: color.onInk },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: color.ruleStrong, backgroundColor: color.surface, alignItems: "center", justifyContent: "center", marginTop: 1 },
  sheetBackdrop: { flex: 1, backgroundColor: color.scrim, justifyContent: "flex-end" },
  sheet: { backgroundColor: color.ground, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: "hidden" },
  sheetHeader: { flexDirection: "row", alignItems: "center", paddingLeft: space.xl, paddingRight: space.sm, paddingTop: space.md, minHeight: 56 },
  progress: { height: 6, borderRadius: radius.pill, backgroundColor: color.sunkenDeep, overflow: "hidden" },
}));
