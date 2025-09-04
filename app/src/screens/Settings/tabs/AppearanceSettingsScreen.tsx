import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useUIStore } from "../../../store/ui";

function RadioRow({
  label,
  selected,
  onPress,
  palette,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? palette.accent : palette.sub,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          backgroundColor: "transparent",
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: palette.accent,
            }}
          />
        ) : null}
      </View>
      <Text style={{ color: palette.text, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export default function AppearanceSettingsScreen() {
  const { colors, dark } = useTheme();
  const mode = useUIStore((s) => s.themeMode);
  const setMode = useUIStore((s) => s.setThemeMode);

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? "#96A2AE" : "#475569",
      border: dark ? "#223042" : "#E2E8F0",
      accent: colors.primary,
    }),
    [colors, dark]
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Apparence
      </Text>

      <View
        style={{
          backgroundColor: palette.bg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          paddingHorizontal: 12,
        }}
      >
        <RadioRow
          label="Système"
          selected={mode === "system"}
          onPress={() => setMode("system")}
          palette={palette}
        />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <RadioRow
          label="Clair"
          selected={mode === "light"}
          onPress={() => setMode("light")}
          palette={palette}
        />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <RadioRow
          label="Sombre"
          selected={mode === "dark"}
          onPress={() => setMode("dark")}
          palette={palette}
        />
      </View>

      <Text style={{ color: palette.sub, marginTop: 16 }}>
        Le mode “Système” suit automatiquement le thème du téléphone.
      </Text>
    </View>
  );
}
