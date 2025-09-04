import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { API_BASE, api } from "../../services/api";
const IMAGES = [
  "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
  "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1200",
];

export default function WelcomeScreen() {
  const nav = useNavigation<any>();
  const { colors, dark } = useTheme();
  const width = Dimensions.get("window").width;
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [status, setStatus] = useState<string>("");

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? "#96A2AE" : "#475569",
      border: dark ? "#223042" : "#E2E8F0",
      accent: colors.primary,
      danger: dark ? "#F87171" : "#B91C1C",
    }),
    [colors, dark]
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    setPage(i);
  };

  // Test API
  const testApi = async () => {
    setStatus("Test en cours…");
    try {
      const res = await api.get("/users/me"); // ou un endpoint public si pas d’auth
      setStatus(`OK (${res.status})`);
    } catch (e: any) {
      setStatus(`Erreur: ${e?.response?.status || e?.message}`);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{ paddingBottom: 64 }}
    >
      {/* Carrousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ width, height: 360 }}
      >
        {IMAGES.map((uri) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width, height: 360 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={{ padding: 16 }}>
        <Text
          style={{
            color: palette.text,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          Welcome to Abyss diving!
        </Text>
        <Text style={{ color: palette.sub, lineHeight: 20, marginBottom: 16 }}>
          Track your dives, explore dive sites, and connect with fellow divers. Let’s dive in!
        </Text>

        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {IMAGES.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === page ? palette.accent : dark ? "#243140" : "#CBD5E1",
              }}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => nav.navigate("Register")}
          style={{
            backgroundColor: palette.accent,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => nav.navigate("Login")}
          style={{
            backgroundColor: dark ? "#0F1620" : "#F7F8FA",
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: palette.text, fontWeight: "700" }}>Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Indicateur API */}
      <View
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 6,
            backgroundColor:
              status.startsWith("OK")
                ? "#4caf50"
                : status.startsWith("Test")
                ? "#f0ad4e"
                : "#f44336",
          }}
        />
        <Text style={{ color: palette.text }}>
          {API_BASE} {status ? `(${status})` : ""}
        </Text>
      </View>
    </ScrollView>
  );
}
