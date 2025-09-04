import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme, useNavigation } from "@react-navigation/native";
import { login } from "../../services/auth";
import { useAuthStore } from "../../store/auth";

export default function LoginScreen() {
  const { colors, dark } = useTheme();
  const nav = useNavigation<any>();
  const restore = useAuthStore((s) => s.restore);

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? "#96A2AE" : "#475569",
      border: colors.border,
      hint: dark ? "#6B7280" : "#94A3B8",
      accent: colors.primary,
    }),
    [colors, dark]
  );

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    restore();
  }, []);

  const submit = async () => {
    setError(null);

    const e = email.trim().toLowerCase();
    const p = pwd;

    if (!e || !p) {
      setError("Email et mot de passe requis");
      return;
    }

    try {
      await login(e, p);
      // navigation éventuelle post-login ici
    } catch (err: any) {
      const resp = err?.response; // peut être undefined si offline/CORS/etc.
      if (!resp) {
        setError("Réseau indisponible");
        return;
      }
      const { status, data } = resp;

      // Zod 400 avec details.flatten()
      const fieldErrors = data?.details?.fieldErrors as
        | Record<string, string[]>
        | undefined;
      if (status === 400 && fieldErrors) {
        const msgs = Object.values(fieldErrors).flat().filter(Boolean);
        setError(msgs.join("\n") || data?.error || "Erreur de validation");
        return;
      }

      if (status === 401) {
        setError(data?.error || "Identifiants invalides");
        return;
      }

      setError(data?.error || "Erreur de connexion");
    }
  };

  const inputPwd = {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    color: palette.text,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  } as const;

  const Btn = ({
    title,
    onPress,
    variant = "primary" as "primary" | "ghost",
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor:
          variant === "primary" ? palette.accent : dark ? "#0F1620" : "#F7F8FA",
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 8,
      }}
    >
      <Text
        style={{
          color: variant === "primary" ? "#fff" : palette.text,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Log In
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={palette.hint}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={inputPwd}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={palette.hint}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        importantForAutofill="yes"
        value={pwd}
        onChangeText={setPwd}
        style={inputPwd}
      />

      {error ? (
        <Text style={{ color: dark ? "#F87171" : "#B91C1C", marginBottom: 6 }}>
          {error}
        </Text>
      ) : null}

      <Btn title="Log In" onPress={submit} />
      <Btn
        title="Create Account"
        onPress={() => nav.navigate("Register")}
        variant="ghost"
      />
      <TouchableOpacity
        onPress={() => nav.navigate("Forgot")}
        style={{ marginTop: 8 }}
      >
        <Text style={{ color: palette.sub, textAlign: "center" }}>
          Forgot password?
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
