import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useAuthStore } from "../../store/auth";
import { listDives } from "../../services/dives";
import { listMedia } from "../../services/media";

const PLACEHOLDER = "https://picsum.photos/200/120";

type DiveItem = {
  dive_id: number;
  title?: string | null;
  duration: number;
  depth_max: number;
  date: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();

  const palette = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    sub: dark ? "#96A2AE" : "#475569",
    border: colors.border,
    badge: dark ? "#1F2A36" : "#EDF2F7",
  };

  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clearSession);

  const [loading, setLoading] = useState(true);
  const [dives, setDives] = useState<DiveItem[]>([]);
  const [coverByDive, setCoverByDive] = useState<Record<number, string>>({});
  const [stats, setStats] = useState({ total: 0, maxDepth: 0, totalMin: 0 });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await listDives({ page: 1, limit: 5 });
        const items = (r.data || []) as DiveItem[];
        setDives(items);

        const total = (r as any).total ?? items.length;
        const maxDepth = items.reduce(
          (m, d) => Math.max(m, Number(d.depth_max || 0)),
          0
        );
        const totalMin =
          (r as any).aggregate_minutes ??
          items.reduce((s, d) => s + Number(d.duration || 0), 0);
        setStats({ total, maxDepth, totalMin });

        const covers: Record<number, string> = {};
        await Promise.all(
          items.map(async (d) => {
            try {
              const med = await listMedia(d.dive_id, 1, 1);
              const arr = Array.isArray(med?.data) ? med.data : [];
              const first = arr;
              covers[d.dive_id] = first?.url || PLACEHOLDER;
            } catch {
              covers[d.dive_id] = PLACEHOLDER;
            }
          })
        );
        setCoverByDive(covers);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalTimeLabel = useMemo(() => {
    const h = Math.floor(stats.totalMin / 60);
    const m = stats.totalMin % 60;
    return `${h}h ${m}m`;
  }, [stats.totalMin]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.bg,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
              user?.name || "Abyss"
            )}`,
          }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: palette.card,
          }}
        />
        <Text
          style={{
            color: palette.text,
            fontSize: 20,
            fontWeight: "700",
            marginTop: 8,
          }}
        >
          {user?.name || "—"}
        </Text>
        <Text style={{ color: palette.sub, fontSize: 13 }}>Divemaster</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: palette.card,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text style={{ color: palette.sub, marginBottom: 6 }}>
            Total Dives
          </Text>
          <Text
            style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}
          >
            {stats.total}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: palette.card,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text style={{ color: palette.sub, marginBottom: 6 }}>Max Depth</Text>
          <Text
            style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}
          >
            {stats.maxDepth}m
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: palette.border,
          marginTop: 12,
        }}
      >
        <Text style={{ color: palette.sub, marginBottom: 6 }}>Total Time</Text>
        <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>
          {totalTimeLabel}
        </Text>
      </View>

      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: "700",
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        Recent Dives
      </Text>
      {dives.map((d) => (
        <TouchableOpacity
          key={d.dive_id}
          onPress={() =>
            navigation.navigate("DiveDetail", { dive_id: d.dive_id })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: palette.card,
            borderRadius: 12,
            padding: 8,
            borderWidth: 1,
            borderColor: palette.border,
            marginBottom: 10,
          }}
        >
          <Image
            source={{ uri: coverByDive[d.dive_id] || PLACEHOLDER }}
            style={{
              width: 84,
              height: 60,
              borderRadius: 8,
              backgroundColor: palette.badge,
            }}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ color: palette.text, fontWeight: "700" }}
            >
              {d.location_name || "Sans lieu"}
            </Text>
            <Text style={{ color: palette.sub, fontSize: 12 }}>
              {Math.round(d.depth_max)}m | {d.duration}min
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
