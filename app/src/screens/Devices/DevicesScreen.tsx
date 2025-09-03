import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
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

  const [connected, setConnected] = useState<any>(null);
  const [battery, setBattery] = useState<number | null>(80);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [progress, setProgress] = useState(0);
  const linkRef = useRef<AbyssLink | null>(null);

  /** Récupère les devices enregistrés côté serveur */
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const devs = await listDevices();
      setDevices(devs);
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

  /** Scan et appairage BLE */
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
        setNearby((prev) => [...prev, { id, name: d.name || "Appareil BLE", rssi: d.rssi }]);
        return true;
      }, 8000);
    } catch (e: any) {
      Alert.alert("Scan BLE", e?.message || "Échec");
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
      const info = await link.handshake();
      setConnected({ model: info.model, serial: info.serial, firmware: info.firmware });
      // Enregistre côté serveur si pas déjà existant
      const list = await listDevices();
      if (!list.find((d: any) => d.serial_number === info.serial)) {
        await createDevice({
          serial_number: info.serial,
          model: info.model,
          firmware_version: info.firmware,
        });
        fetchDevices();
      }
      setNearbyOpen(false);
      Alert.alert("Appairage", `${info.model} connecté`);
    } catch (e: any) {
      Alert.alert("Appairage", e?.message || "Échec");
    } finally {
      setLoadingCard(false);
    }
  };

  const sync = async () => {
    if (!ble.device) return Alert.alert("Synchronisation", "Aucun appareil connecté");
    try {
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
    }
  };

  const renderDevice = ({ item }: { item: any }) => {
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
        <Text style={{ color: palette.sub, marginBottom: 8 }}>
          S/N: {item.serial_number}
        </Text>
        <Text style={{ color: palette.text, marginBottom: 8 }}>
          Firmware: {item.firmware_version}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>

      {/* Actions BLE */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Button title="Appairer un appareil" onPress={openPair} />
        <Button title="Synchroniser" onPress={sync} disabled={!connected} />
      </View>

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
