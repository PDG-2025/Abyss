import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { listDives } from "../../services/dives";
import { getLocationsBulk, LocationItem } from "../../services/locations";

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
        const divesData = await listDives({ page: 1, limit: 300 });
        const divesRaw = divesData.data;

        const locationIds = Array.from(
          new Set(
            divesRaw
              .map((d) => d.location_id)
              .filter((id): id is number => typeof id === "number")
          )
        );

        const locations = await getLocationsBulk(locationIds);
        const locationsById = new Map<number, LocationItem>();
        locations.forEach((loc) => locationsById.set(loc.location_id, loc));

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
        setError(e?.message || "Erreur inattendue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;

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
                <Text>Max {d.depth_max} m — Moy {d.average_depth} m</Text>
              </View>
            </Callout>
          </Marker>
        ) : null
      )}
    </MapView>
  );
}
