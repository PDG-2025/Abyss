import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { register } from "../../services/auth";

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const { colors, dark } = useTheme();

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (pwd !== pwd2) return setError("Les mots de passe ne correspondent pas");
    try {
      await register(name.trim(), email.trim().toLowerCase(), pwd);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Erreur inscription");
    }
  };

  const input = {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    color: palette.text,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  } as const;
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
        Create Account
      </Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={palette.hint}
        value={name}
        onChangeText={setName}
        style={input}
      />
      <TextInput
        placeholder="Email Address"
        placeholderTextColor={palette.hint}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={palette.hint}
        secureTextEntry
        value={pwd}
        onChangeText={setPwd}
        style={inputPwd}
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor={palette.hint}
        secureTextEntry
        value={pwd2}
        onChangeText={setPwd2}
        style={inputPwd}
      />

      <Text
        style={{
          color: palette.sub,
          fontSize: 12,
          lineHeight: 18,
          marginBottom: 6,
        }}
      >
        Password must be at least 8 characters long and include a number, a
        special character, and an uppercase letter.
      </Text>
      {error ? (
        <Text style={{ color: dark ? "#F87171" : "#B91C1C", marginBottom: 6 }}>
          {error}
        </Text>
      ) : null}

      <Btn
        title="Continue with Google"
        onPress={() => {
          /* TODO: Google */
        }}
        variant="ghost"
      />
      <Btn
        title="Continue with Facebook"
        onPress={() => {
          /* TODO: Facebook */
        }}
        variant="ghost"
      />

      <View style={{ height: 12 }} />
      <Btn title="Create Account" onPress={submit} />
    </ScrollView>
  );
}
