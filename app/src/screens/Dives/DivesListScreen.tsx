import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { useTheme, useNavigation } from "@react-navigation/native";
import { initPageState, loadNextPage, PageState } from "../../utils/paginate";
import { listDives } from "../../services/dives";
import { listMedia } from "../../services/media";
import type { Dive } from "../../types/dto";

const PLACEHOLDER = "https://picsum.photos/128/96";

export default function DivesListScreen() {
  const [state, setState] = useState<PageState<Dive>>(initPageState<Dive>(20));
  const [covers, setCovers] = useState<Record<number, string>>({});
  const nav = useNavigation<any>();
  const { colors, dark } = useTheme();

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      sub: dark ? "#96A2AE" : "#475569",
      chevron: dark ? "#A7B4C2" : "#64748B",
    }),
    [colors, dark]
  );

  const fetcher = (page: number, limit: number) => listDives({ page, limit });

  useEffect(() => {
    loadNextPage(state, setState, fetcher);
  }, []);

  // Charger les couvertures manquantes
  useEffect(() => {
    (async () => {
      const missing = state.items.filter((d) => !covers[d.dive_id]);
      if (!missing.length) return;
      const next: Record<number, string> = {};
      await Promise.all(
        missing.map(async (d) => {
          try {
            const med = await listMedia(d.dive_id, 1, 1);
            const arr = Array.isArray(med?.data) ? med.data : [];
            const first = arr;
            next[d.dive_id] = first?.url || PLACEHOLDER;
          } catch {
            next[d.dive_id] = PLACEHOLDER;
          }
        })
      );
      setCovers((prev) => ({ ...prev, ...next }));
    })();
  }, [state.items]); // re-run when new items load

  const loadMore = useCallback(
    () => loadNextPage(state, setState, fetcher),
    [state, setState]
  );

  const renderItem = useCallback(
    ({ item }: { item: Dive }) => {
      const cover = covers[item.dive_id] || PLACEHOLDER;
      const when = new Date(item.date);
      const dateLabel = when.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timeLabel = when.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <TouchableOpacity
          onPress={() => nav.navigate("DiveDetail", { dive_id: item.dive_id })}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: palette.bg,
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <Image
            source={{ uri: cover }}
            style={{
              width: 84,
              height: 60,
              borderRadius: 10,
              backgroundColor: palette.card,
              marginRight: 12,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ color: palette.text, fontWeight: "700" }}
            >
              {item.location_name || "Sans lieu"}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: palette.sub, marginTop: 2 }}
            >
              {dateLabel} · {timeLabel}
            </Text>
          </View>
          <Text style={{ color: palette.chevron, marginLeft: 8 }}>›</Text>
        </TouchableOpacity>
      );
    },
    [covers, nav, palette]
  );

  const itemSeparator = useCallback(
    () => (
      <View
        style={{ height: 1, backgroundColor: palette.border, marginLeft: 108 }}
      />
    ),
    [palette.border]
  );

  if (!state.items.length && state.loading) {
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
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <FlatList
        data={state.items}
        keyExtractor={(d) => String(d.dive_id)}
        renderItem={renderItem}
        ItemSeparatorComponent={itemSeparator}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          state.loading ? (
            <ActivityIndicator style={{ marginVertical: 12 }} />
          ) : null
        }
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        getItemLayout={(_, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      {state.error ? (
        <Text style={{ color: "#ef4444", padding: 12 }}>{state.error}</Text>
      ) : null}
    </View>
  );
}
