import { useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { API_ORIGIN } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { color, space } from "@/lib/theme";
import { Button, Checkbox, Field, Notice, Screen, T, type InputRef } from "@/ui";
import { GoogleButton, OrLine, googleAvailable, useAuthConfig } from "@/ui/AuthParts";
import { Juno } from "@/ui/Juno";

/** The privacy notice lives on the website; it opens in the browser. */
const PRIVACY_URL = `${API_ORIGIN || ""}/privacy`;

export default function Signup() {
  const { t, errorText } = useLang();
  const { signup } = useAuth();
  const config = useAuthConfig();
  const params = useLocalSearchParams<{ error?: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(params.error ? errorText(params.error) : null);
  const [busy, setBusy] = useState(false);
  const emailInput = useRef<InputRef>(null);
  const passwordInput = useRef<InputRef>(null);

  // The consent covers every way of signing up, Google included, so it comes first.
  const consented = () => {
    if (consent) return true;
    setError(t.auth.consentFirst);
    return false;
  };

  const submit = async () => {
    if (busy || !consented()) return;
    setBusy(true);
    setError(null);
    try {
      await signup({ name: name.trim(), email: email.trim(), password, inviteCode: inviteCode.trim() || undefined });
      // Signed in: the root layout now shows onboarding.
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <Screen back footer={<Button label={t.auth.signup} loading={busy} onPress={submit} />}>
      <View style={{ gap: space.sm, marginBottom: space.xl, marginTop: space.md }}>
        <Juno size={56} mood="idle" />
        <T variant="display" style={{ marginTop: space.sm }}>{t.auth.signupTitle}</T>
        <T tone={color.inkMuted}>{t.auth.signupLine}</T>
      </View>
      <Checkbox checked={consent} label={t.auth.consent} onChange={(checked) => { setConsent(checked); if (checked && error === t.auth.consentFirst) setError(null); }}>
        <T variant="small" tone={color.inkSoft}>{t.auth.consent}</T>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => Linking.openURL(PRIVACY_URL.startsWith("http") ? PRIVACY_URL : `${window.location.origin}${PRIVACY_URL}`)}>
          <T variant="small" tone={color.ink} style={{ fontFamily: "SchibstedGrotesk_600SemiBold", textDecorationLine: "underline", marginTop: 4 }}>{t.auth.consentLink}</T>
        </Pressable>
      </Checkbox>
      <View style={{ height: space.xl }} />
      {googleAvailable(config.data) ? (
        <>
          <GoogleButton intent="signup" guard={consented} />
          <OrLine />
        </>
      ) : null}
      <Field label={t.auth.name} value={name} onChangeText={setName} maxLength={40} autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailInput.current?.focus()} />
      <Field ref={emailInput} label={t.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false} returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} />
      <Field ref={passwordInput} label={t.auth.password} hint={t.auth.passwordHint} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} />
      {config.data?.inviteRequired ? <Field label={t.auth.invite} value={inviteCode} onChangeText={setInviteCode} autoCapitalize="none" /> : null}
      {error ? <Notice tone="error" text={error} /> : null}
      <Pressable accessibilityRole="link" onPress={() => router.replace("/login")} style={{ flexDirection: "row", gap: 6, marginTop: space.xl, minHeight: 44, alignItems: "center" }}>
        <T variant="small">{t.auth.haveAccount}</T>
        <T variant="small" tone={color.ink} style={{ fontFamily: "SchibstedGrotesk_600SemiBold", textDecorationLine: "underline" }}>{t.auth.login}</T>
      </Pressable>
    </Screen>
  );
}
