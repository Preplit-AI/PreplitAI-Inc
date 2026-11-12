import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { color, space } from "@/lib/theme";
import { Button, Field, Notice, Screen, T, type InputRef } from "@/ui";
import { GoogleButton, OrLine, googleAvailable, useAuthConfig } from "@/ui/AuthParts";
import { Juno } from "@/ui/Juno";

export default function Login() {
  const { t, errorText } = useLang();
  const { login } = useAuth();
  const config = useAuthConfig();
  // A Google sign-in that did not finish comes back here with ?error=<code>.
  const params = useLocalSearchParams<{ error?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.error ? errorText(params.error) : null);
  const [busy, setBusy] = useState(false);
  const passwordInput = useRef<InputRef>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      // Signed in: the root layout now shows onboarding or home.
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <Screen back footer={<Button label={t.auth.login} loading={busy} onPress={submit} />}>
      <View style={{ gap: space.sm, marginBottom: space.xxl, marginTop: space.md }}>
        <Juno size={56} mood="happy" />
        <T variant="display" style={{ marginTop: space.sm }}>{t.auth.loginTitle}</T>
      </View>
      {googleAvailable(config.data) ? (
        <>
          <GoogleButton intent="login" />
          <OrLine />
        </>
      ) : null}
      <Field label={t.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false} returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} />
      <Field ref={passwordInput} label={t.auth.password} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" returnKeyType="go" onSubmitEditing={submit} />
      {error ? <Notice tone="error" text={error} /> : null}
      <Pressable accessibilityRole="link" onPress={() => router.replace("/signup")} style={{ flexDirection: "row", gap: 6, marginTop: space.xl, minHeight: 44, alignItems: "center" }}>
        <T variant="small">{t.auth.noAccount}</T>
        <T variant="small" tone={color.ink} style={{ fontFamily: "SchibstedGrotesk_600SemiBold", textDecorationLine: "underline" }}>{t.auth.createOne}</T>
      </Pressable>
    </Screen>
  );
}
