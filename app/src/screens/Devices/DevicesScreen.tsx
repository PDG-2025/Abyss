import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Slider from "@react-native-community/slider"; // jauge batterie 
import { useTheme } from "@react-navigation/native";
import { ble } from "../../ble/BleService";
import { AbyssLink } from "../../ble/AbyssLink";
import { requestBlePermissionsIfNeeded } from "../../ble/permissions";
import { otaUpdate } from "../../ble/ota";
import { syncDive } from "../../services/sync";
import { listDevices, createDevice } from "../../services/devices";

type Nearby = { id: string; name?: string | null; rssi?: number | null };

export default function DevicesScreen() {
  const { colors, dark } = useTheme();
  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? "#96A2AE" : "#475569",
      border: colors.border,
      accent: colors.primary,
    }),
    [colors, dark]
  );

  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [connected, setConnected] = useState<{
    model?: string;
    serial?: string;
    firmware?: string;
  } | null>(null);
  const [battery, setBattery] = useState<number | null>(80);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);

  const linkRef = useRef<AbyssLink | null>(null);

  useEffect(() => {
    ble.onStatus = (s) => setStatus(s);
    ble.onError = (e) => setError(e.message);
    return () => {
      ble.onStatus = undefined as any;
      ble.onError = undefined as any;
    };
  }, []);

  const openPair = async () => {
    setError(null);
    const ok = await requestBlePermissionsIfNeeded();
    if (!ok) return Alert.alert("Bluetooth", "Permissions refusées");
    setNearbyOpen(true);
    setNearby([]);
    setLoadingScan(true);
    try {
      await ble.scan((d) => {
        setNearby((prev) => {
          const id = d.id || d.deviceId || d.uuid || String(d.address || "");
          if (!id) return prev;
          const exists = prev.find((x) => x.id === id);
          const name = d.name || d.localName || "Appareil BLE";
          if (exists) return prev;
          return [...prev, { id, name, rssi: d.rssi }];
        });
        return true;
      }, 8000); // scan 8s
    } catch (e: any) {
      setError(e?.message || "Scan BLE échoué");
    } finally {
      setLoadingScan(false);
    }
  };

  const connectTo = async (dev: Nearby) => {
    try {
      setLoadingCard(true);
      await ble.connectById(dev.id);
      const link = new AbyssLink();
      linkRef.current = link;
      const info = await link.handshake(); // { model, serial, firmware }
      setConnected({
        model: info.model,
        serial: info.serial,
        firmware: info.firmware,
      });
      try {
        const list = await listDevices();
        if (!list.find((d: any) => d.serial_number === info.serial)) {
          await createDevice({
            serial_number: info.serial,
            model: info.model,
            firmware_version: info.firmware,
          });
        }
      } catch {}
      setNearbyOpen(false);
      Alert.alert("Appairage", `${info.model} connecté`);
    } catch (e: any) {
      Alert.alert("Appairage", e?.message || "Échec");
    } finally {
      setLoadingCard(false);
    }
  };

  const sync = async () => {
    setError(null);
    if (!ble.device)
      return Alert.alert("Synchronisation", "Aucun appareil connecté");
    try {
      const link = new AbyssLink();
      linkRef.current = link;
      const session = await link.getSession();
      // TODO: extraire et uploader les mesures; maquette: feedback simple
      const payload = {
        dive: {
          date: new Date(session.start_ts * 1000).toISOString(),
          duration: session.duration,
          depth_max: 18,
          average_depth: 12,
          notes: "Synced via BLE",
        },
      };
      const r = await syncDive(payload as any);
      Alert.alert("Synchronisation", `Plongée synchronisée #${r.dive_id}`);
    } catch (e: any) {
      Alert.alert("Synchronisation", e?.message || "Échec");
    }
  };

  const updateFw = async () => {
    if (!ble.device)
      return Alert.alert("Mise à jour", "Aucun appareil connecté");
    try {
      setProgress(0);
      const link = new AbyssLink();
      const info = await link.handshake();
      const latest = await fetchLatestFirmware(info.model);
      if (!isNewer(latest.version, info.firmware))
        return Alert.alert("Firmware", `Déjà à jour (${info.firmware})`);
      const bytes = await downloadFirmwareBytes(latest.url);
      await otaUpdate(bytes, latest.version, {
        chunkSize: 180,
        opTimeoutMs: 15000,
        maxRetries: 5,
        onProgress: (o, t) => setProgress(o / t),
      });
      Alert.alert("Mise à jour", "Terminée. L’appareil peut redémarrer.");
    } catch (e: any) {
      Alert.alert("Mise à jour", e?.message || "Échec");
    }
  };

  const labelRow = (label: string, value?: React.ReactNode) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: palette.text, flex: 1 }}>{label}</Text>
      <Text style={{ color: palette.text, opacity: 0.85 }}>{value ?? "—"}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Ordinateur
      </Text>

      {/* Carte identité */}
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.bg,
          paddingHorizontal: 8,
        }}
      >
        {labelRow("Ordinateur", connected?.model || (ble.device?.name ?? "—"))}
        <View style={{ height: 1, backgroundColor: palette.border }} />
        {labelRow("Numéro de série", connected?.serial || "—")}
        <View style={{ height: 1, backgroundColor: palette.border }} />
        {labelRow("Version du micrologiciel", connected?.firmware || "—")}
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: palette.text, flex: 1 }}>Batterie</Text>
          <View
            style={{
              width: 140,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Slider
              style={{ width: 110 }}
              value={(battery ?? 0) / 100}
              minimumValue={0}
              maximumValue={1}
              disabled
              minimumTrackTintColor={palette.accent}
              maximumTrackTintColor={dark ? "#223042" : "#E2E8F0"}
              thumbTintColor="transparent"
            />
            <Text style={{ color: palette.text }}>{battery ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={{ height: 16 }} />
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Button title="Appairer" onPress={openPair} />
        <Button title="Synchroniser" onPress={sync} />
      </View>

      <View style={{ height: 24 }} />
      <View style={{ alignItems: "center" }}>
        {Platform.OS === "android" ? (
          <View style={{ width: 220 }}>
            {/* Android: la barre système n’est pas uniforme, on garde le bouton direct */}
          </View>
        ) : null}
        <Button
          title="Vérifier les mises à jour"
          onPress={updateFw}
          color={colors.primary}
        />
        {progress > 0 && progress < 1 ? (
          <View
            style={{
              width: 260,
              height: 8,
              borderRadius: 6,
              backgroundColor: dark ? "#223042" : "#E2E8F0",
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: `${Math.round(progress * 100)}%`,
                height: 8,
                borderRadius: 6,
                backgroundColor: palette.accent,
              }}
            />
          </View>
        ) : null}
      </View>

      {!!error && (
        <Text style={{ color: dark ? "#F87171" : "#B91C1C", marginTop: 12 }}>
          {String(error)}
        </Text>
      )}

      {/* Modale de connexion (liste appareils proches) */}
      <Modal
        visible={nearbyOpen}
        animationType="slide"
        onRequestClose={() => setNearbyOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setNearbyOpen(false)}
              style={{ padding: 8 }}
            >
              <Text style={{ color: palette.text, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text
              style={{
                color: palette.text,
                fontSize: 18,
                fontWeight: "700",
                marginLeft: 8,
              }}
            >
              Connect your dive computer
            </Text>
          </View>

          <Text
            style={{
              color: palette.text,
              fontSize: 22,
              fontWeight: "700",
              marginVertical: 12,
            }}
          >
            Searching for nearby devices
          </Text>
          <Text style={{ color: palette.sub, marginBottom: 16 }}>
            Make sure your dive computer is in pairing mode and within range.
          </Text>

          {loadingScan ? <ActivityIndicator /> : null}

          <FlatList
            data={nearby}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => connectTo(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: dark ? "#0F1620" : "#F7F8FA",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <Text style={{ color: palette.text }}>▣</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.text, fontWeight: "700" }}>
                    {item.name || "Appareil BLE"}
                  </Text>
                  <Text style={{ color: palette.sub }}>{item.id}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loadingScan ? (
                <Text style={{ color: palette.sub }}>
                  Aucun appareil trouvé.
                </Text>
              ) : null
            }
          />

          <View style={{ marginTop: 20 }}>
            <Button
              title={loadingCard ? "Connexion…" : "Connect"}
              disabled={loadingCard || nearby.length === 0}
              onPress={() => nearby && connectTo(nearby)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* Helpers firmware */
async function fetchLatestFirmware(
  model: string
): Promise<{ version: string; url: string }> {
  const res = await fetch(
    `${
      process.env.EXPO_PUBLIC_API_BASE
    }/firmware/latest?model=${encodeURIComponent(model)}`
  );
  if (!res.ok) throw new Error("Firmware latest error");
  const j = await res.json();
  return { version: j.version, url: j.url };
}
async function downloadFirmwareBytes(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Download firmware failed");
  const ab = await r.arrayBuffer();
  return new Uint8Array(ab);
}
function isNewer(a: string, b: string) {
  const A = a.split(".").map(Number);
  const B = b.split(".").map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const ai = A[i] || 0,
      bi = B[i] || 0;
    if (ai > bi) return true;
    if (ai < bi) return false;
  }
  return false;
}
