import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { api } from "../../services/api";
import type { Paged } from "../../types/dto";

type DiveItem = {
  dive_id: number;
  date: string;
  depth_max: number;
  average_depth: number;
  location_id?: number | null;
};

type LocationItem = {
  location_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type MapDive = {
  dive_id: number;
  date: string;
  depth_max: number;
  average_depth: number;
  location?: { name: string; latitude: number; longitude: number };
};

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dives, setDives] = useState<MapDive[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Récupération des dives
        const res = await api.get("/dives?page=1&limit=300");
        if (res.status !== 200) {
          setError(res.data?.error || "Erreur chargement des plongées");
          return;
        }

        const payload = res.data as Paged<DiveItem>;
        const divesRaw = payload.data;

        // 2) Récupération des locations uniques par ID
        const locationIds = Array.from(
          new Set(
            divesRaw
              .map((d) => d.location_id)
              .filter((id): id is number => typeof id === "number")
          )
        );
        
        const locationsById = new Map<number, LocationItem>();
        if (locationIds.length > 0) {
          const requests = locationIds.map((id) => api.get(`/locations/${id}`));
          const responses = await Promise.allSettled(requests);
          responses.forEach((r) => {
            if (r.status === "fulfilled" && r.value.status === 200) {
              const loc = r.value.data as LocationItem;
              locationsById.set(loc.location_id, loc);
            }
          });
        }

        // 3) Fusion dives + locations
        const enriched: MapDive[] = divesRaw.map((d) => {
          const loc = d.location_id ? locationsById.get(d.location_id) : undefined;
          return {
            dive_id: d.dive_id,
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
        setError(e?.response?.data?.error || e?.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  return (
    <MapView
      style={{ flex: 1 }}
      initialCamera={{
        center: { latitude: 46, longitude: 6 },
        pitch: 0,
        heading: 0,
        altitude: 10000000,
        zoom: 4,
      }}
    >
      {dives.map((d) =>
        d.location ? (
          <Marker
            key={d.dive_id}
            coordinate={{
              latitude: d.location.latitude,
              longitude: d.location.longitude,
            }}
          >
            <Callout>
              <View style={{ maxWidth: 240 }}>
                <Text style={{ fontWeight: "600" }}>{d.location.name}</Text>
                <Text>Plongée #{d.dive_id}</Text>
                <Text>{new Date(d.date).toLocaleString()}</Text>
                <Text>
                  Max {d.depth_max} m — Moy {d.average_depth} m
                </Text>
              </View>
            </Callout>
          </Marker>
        ) : null
      )}
    </MapView>
  );
}
