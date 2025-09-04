import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Slider from "@react-native-community/slider";
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

  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [loadingScan, setLoadingScan] = useState(false);

  const linkRef = useRef<AbyssLink | null>(null);

  /** Récupère les devices enregistrés côté serveur */
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const devs = await listDevices();
      setDevices(devs.map((d) => ({ ...d, progress: 0, busy: false })));
    } catch (e: any) {
      Alert.alert("Appareils", e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    ble.onStatus = (s) => console.log("BLE status", s);
    ble.onError = (e) => Alert.alert("BLE Error", e.message);
    return () => {
      ble.onStatus = undefined as any;
      ble.onError = undefined as any;
    };
  }, []);

  /** Scan BLE pour appairage */
  const openPair = async () => {
    const ok = await requestBlePermissionsIfNeeded();
    if (!ok) return Alert.alert("Bluetooth", "Permissions refusées");
    setNearbyOpen(true);
    setNearby([]);
    setLoadingScan(true);
    try {
      await ble.scan((d) => {
        const id = d.id || d.deviceId || d.uuid || String(d.address || "");
        if (!id) return false;
        const exists = nearby.find((x) => x.id === id);
        if (exists) return false;
        setNearby((prev) => [
          ...prev,
          { id, name: d.name || "Appareil BLE", rssi: d.rssi },
        ]);
        return true;
      }, 8000);
    } catch (e: any) {
      Alert.alert("Scan BLE", e?.message || "Échec");
    } finally {
      setLoadingScan(false);
    }
  };

  /** Connecte et enregistre device côté serveur */
  const connectTo = async (dev: Nearby) => {
    try {
      // on peut bloquer tout bouton sur l'ensemble de l'écran ou seulement la tuile
      const link = new AbyssLink();
      linkRef.current = link;
      await ble.connectById(dev.id);
      const info = await link.handshake();
      const list = await listDevices();
      if (!list.find((d: any) => d.serial_number === info.serial)) {
        await createDevice({
          serial_number: info.serial,
          model: info.model,
          firmware_version: info.firmware,
        });
      }
      fetchDevices();
      setNearbyOpen(false);
      Alert.alert("Appairage", `${info.model} connecté`);
    } catch (e: any) {
      Alert.alert("Appairage", e?.message || "Échec");
    }
  };

  /** Synchronisation BLE */
  const sync = async (devIndex: number) => {
    const dev = devices[devIndex];
    try {
      updateDevice(devIndex, { busy: true });
      if (!ble.device)
        return Alert.alert("Synchronisation", "Aucun appareil connecté");
      const link = new AbyssLink();
      linkRef.current = link;
      const session = await link.getSession();
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
    } finally {
      updateDevice(devIndex, { busy: false });
    }
  };

  /** Mise à jour firmware OTA */
  const updateFw = async (devIndex: number) => {
    const dev = devices[devIndex];
    try {
      updateDevice(devIndex, { busy: true, progress: 0 });
      if (!ble.device)
        return Alert.alert("Firmware", "Aucun appareil connecté");
      const link = new AbyssLink();
      linkRef.current = link;
      const info = await link.handshake();
      const latest = await fetchLatestFirmware(info.model);
      if (!isNewer(latest.version, info.firmware))
        return Alert.alert("Firmware", `Déjà à jour (${info.firmware})`);
      const bytes = await downloadFirmwareBytes(latest.url);
      await otaUpdate(bytes, latest.version, {
        chunkSize: 180,
        opTimeoutMs: 15000,
        maxRetries: 5,
        onProgress: (o, t) => updateDevice(devIndex, { progress: o / t }),
      });
      Alert.alert("Mise à jour", "Terminée. L’appareil peut redémarrer.");
      fetchDevices();
    } catch (e: any) {
      Alert.alert("Mise à jour", e?.message || "Échec");
    } finally {
      updateDevice(devIndex, { busy: false, progress: 0 });
    }
  };

  /** Met à jour un device dans le state */
  const updateDevice = (index: number, update: Partial<any>) => {
    setDevices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...update };
      return copy;
    });
  };

  /** Rendu d’une tuile device avec boutons BLE */
  const renderDevice = ({ item, index }: { item: any; index: number }) => {
    const batteryLevel = item.battery ?? 80;
    return (
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.card,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: palette.text, fontWeight: "700", fontSize: 16 }}>
          {item.model}
        </Text>
        <Text style={{ color: palette.sub }}>S/N: {item.serial_number}</Text>
        <Text style={{ color: palette.text, marginBottom: 8 }}>
          Firmware: {item.firmware_version}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Slider
            style={{ flex: 1 }}
            value={(batteryLevel ?? 0) / 100}
            minimumValue={0}
            maximumValue={1}
            disabled
            minimumTrackTintColor={palette.accent}
            maximumTrackTintColor={dark ? "#223042" : "#E2E8F0"}
            thumbTintColor="transparent"
          />
          <Text style={{ color: palette.text }}>{batteryLevel ?? 0}%</Text>
        </View>

        {item.progress > 0 && item.progress < 1 && (
          <View
            style={{
              width: "100%",
              height: 8,
              borderRadius: 6,
              backgroundColor: dark ? "#223042" : "#E2E8F0",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: `${Math.round(item.progress * 100)}%`,
                height: 8,
                borderRadius: 6,
                backgroundColor: palette.accent,
              }}
            />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Button title="Appairer" onPress={openPair} disabled={item.busy} />
          <Button
            title="Synchroniser"
            onPress={() => sync(index)}
            disabled={item.busy}
          />
          <Button
            title="Mise à jour firmware"
            onPress={() => updateFw(index)}
            disabled={item.busy}
          />
        </View>
      </View>
    );
  };

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
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>

      {devices.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={{ color: palette.sub, fontSize: 16, marginBottom: 16 }}>
            Aucun appareil enregistré. Connectez-en un pour commencer.
          </Text>
          <Button title="Connecter un appareil" onPress={openPair} />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(d) => String(d.device_id)}
          renderItem={renderDevice}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

/** Helpers firmware */
async function fetchLatestFirmware(model: string) {
  const res = await fetch(
    `${
      process.env.EXPO_PUBLIC_API_BASE
    }/firmware/latest?model=${encodeURIComponent(model)}`
  );
  if (!res.ok) throw new Error("Firmware latest error");
  return res.json();
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
