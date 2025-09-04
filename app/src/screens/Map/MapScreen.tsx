import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  MapStyleElement,
} from "react-native-maps";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listDives } from "../../services/dives";
import { getLocationsBulk, LocationItem } from "../../services/locations";

type MapDive = {
  dive_id: number;
  title?: string | null;
  date: string;
  depth_max: number;
  average_depth: number;
  location?: { name: string; latitude: number; longitude: number };
};

const DARK_MAP: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a7b4c2" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a2538" }],
  },
]; // simple style; remplacez par un style Google plus complet si besoin [2]

export default function MapScreen() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  const palette = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    sub: dark ? "#96A2AE" : "#475569",
    border: dark ? "#2B3540" : "#E2E8F0",
    chipBg: dark ? "#0F1620" : "#F7F8FA",
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dives, setDives] = useState<MapDive[]>([]);

  // Filtres
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<string>(""); // ISO ou vide
  const [dateTo, setDateTo] = useState<string>("");
  const [depthMin, setDepthMin] = useState<string>(""); // m
  const [depthMax, setDepthMax] = useState<string>(""); // m
  const [place, setPlace] = useState<string>(""); // lieu exact/partiel

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const divesData = await listDives({ page: 1, limit: 300 }); // GET /dives?page=&limit= [1]
        const divesRaw = divesData.data;

        const locationIds = Array.from(
          new Set(
            divesRaw
              .map((d: any) => d.location_id)
              .filter((id: any): id is number => typeof id === "number")
          )
        );

        const locations = locationIds.length
          ? await getLocationsBulk(locationIds)
          : [];
        const locationsById = new Map<number, LocationItem>();
        locations.forEach((loc) => locationsById.set(loc.location_id, loc));

        const enriched: MapDive[] = divesRaw.map((d: any) => {
          const loc = d.location_id
            ? locationsById.get(d.location_id)
            : undefined;
          return {
            dive_id: d.dive_id,
            title: d.title,
            date: d.date,
            depth_max: d.depth_max,
            average_depth: d.average_depth,
            location: loc
              ? {
                  name: loc.name,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }
              : undefined,
          };
        });

        setDives(enriched.filter((d) => d.location));
      } catch (e: any) {
        setError(e?.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() : null;
    const dmin = depthMin !== "" ? Number(depthMin) : null;
    const dmax = depthMax !== "" ? Number(depthMax) : null;
    const q = query.trim().toLowerCase();
    const p = place.trim().toLowerCase();

    return dives.filter((d) => {
      const t = new Date(d.date).getTime();
      if (from != null && t < from) return false;
      if (to != null && t > to) return false;
      if (dmin != null && d.depth_max < dmin) return false;
      if (dmax != null && d.depth_max > dmax) return false;
      if (p && !(d.location?.name || "").toLowerCase().includes(p))
        return false;
      if (q) {
        const hay = `${d.title || ""} ${d.location?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dives, dateFrom, dateTo, depthMin, depthMax, place, query]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error)
    return (
      <Text style={{ color: dark ? "#F87171" : "#B91C1C", padding: 16 }}>
        {error}
      </Text>
    );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        customMapStyle={dark ? DARK_MAP : []} // thème carte [4]
        initialCamera={{
          center: { latitude: 46, longitude: 6 },
          pitch: 0,
          heading: 0,
          altitude: 10000000,
          zoom: 4,
        }}
      >
        {filtered.map((d) =>
          d.location ? (
            <Marker
              key={d.dive_id}
              coordinate={{
                latitude: d.location.latitude,
                longitude: d.location.longitude,
              }}
              title={d.location.name}
              description={d.title || undefined}
            >
              <Callout>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: "700" }}>{d.location.name}</Text>
                  <Text>Plongée #{d.dive_id}</Text>
                  <Text>{new Date(d.date).toLocaleString()}</Text>
                  <Text>
                    Max {Math.round(d.depth_max)} m — Moy{" "}
                    {Math.round(d.average_depth || 0)} m
                  </Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* Overlay filtres + recherche */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: insets.top + 8,
          paddingHorizontal: 12,
        }}
      >
        {/* Chips */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {/* Date chip: ouvre/ferme inputs inline simples */}
          <Chip
            label="Date"
            palette={palette}
            content={
              <View style={{ flexDirection: "row", gap: 8 }}>
                <SmallInput
                  value={dateFrom}
                  onChangeText={setDateFrom}
                  placeholder="de (ISO)"
                  palette={palette}
                  width={120}
                />
                <SmallInput
                  value={dateTo}
                  onChangeText={setDateTo}
                  placeholder="à (ISO)"
                  palette={palette}
                  width={120}
                />
              </View>
            }
          />
          <Chip
            label="Profondeur"
            palette={palette}
            content={
              <View style={{ flexDirection: "row", gap: 8 }}>
                <SmallInput
                  value={depthMin}
                  onChangeText={setDepthMin}
                  placeholder="min"
                  palette={palette}
                  width={70}
                  keyboardType="numeric"
                />
                <SmallInput
                  value={depthMax}
                  onChangeText={setDepthMax}
                  placeholder="max"
                  palette={palette}
                  width={70}
                  keyboardType="numeric"
                />
              </View>
            }
          />
          <Chip
            label="Lieu"
            palette={palette}
            content={
              <SmallInput
                value={place}
                onChangeText={setPlace}
                placeholder="nom du lieu"
                palette={palette}
                width={150}
              />
            }
          />
        </View>

        {/* Barre de recherche */}
        <View
          style={{
            backgroundColor: palette.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: palette.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher"
            placeholderTextColor={dark ? "#6B7280" : "#94A3B8"}
            style={{ color: palette.text }}
          />
        </View>
      </View>

      {/* Boutons flottants à droite */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: 12,
          bottom: insets.bottom + 20,
          gap: 10,
          alignItems: "center",
        }}
      >
        <Fab
          label="+"
          onPress={() => {
            /* zoom + via ref si besoin */
          }}
          palette={palette}
        />
        <Fab
          label="−"
          onPress={() => {
            /* zoom - via ref si besoin */
          }}
          palette={palette}
        />
      </View>
    </View>
  );
}

/* Composants utilitaires */

function Chip({
  label,
  palette,
  content,
}: {
  label: string;
  palette: any;
  content: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        style={{
          backgroundColor: palette.chipBg,
          borderWidth: 1,
          borderColor: palette.border,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: palette.text }}>{label} ▾</Text>
      </TouchableOpacity>
      {open ? (
        <View
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            padding: 10,
            backgroundColor: palette.card,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: palette.border,
            gap: 8,
            zIndex: 10,
          }}
        >
          {content}
        </View>
      ) : null}
    </View>
  );
}

function SmallInput({
  value,
  onChangeText,
  placeholder,
  palette,
  width = 100,
  keyboardType,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  palette: any;
  width?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
}) {
  return (
    <View
      style={{
        width,
        backgroundColor: palette.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.border,
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={palette.sub}
        style={{ color: palette.text }}
      />
    </View>
  );
}

function Fab({
  label,
  onPress,
  palette,
}: {
  label: string;
  onPress: () => void;
  palette: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.card,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
