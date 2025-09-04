import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  useRoute,
  RouteProp,
  useNavigation,
  useTheme,
} from "@react-navigation/native";
import { getDive, updateDive } from "../../services/dives";
import { getLocation, updateLocation } from "../../services/locations";

type RootStackParamList = { EditDiveInfo: { dive_id: number } };

export default function EditDiveInfoScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "EditDiveInfo">>();
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();
  const dive_id = route.params?.dive_id;

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? "#96A2AE" : "#475569",
      border: colors.border,
      hint: dark ? "#6B7280" : "#94A3B8",
      danger: dark ? "#F87171" : "#B91C1C",
    }),
    [colors, dark]
  );

  const [loading, setLoading] = useState(true);
  const [dive, setDive] = useState<any | null>(null);

  // états formulaire
  const [title, setTitle] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState<string>(""); // latitude
  const [lng, setLng] = useState<string>(""); // longitude
  const [duration, setDuration] = useState<string>(""); // minutes
  const [depthMax, setDepthMax] = useState<string>(""); // m
  const [avgDepth, setAvgDepth] = useState<string>(""); // m
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getDive(dive_id);
        setDive(d);
        setTitle(d?.title ?? "");
        setDateIso(d?.date ?? "");
        setDuration(d?.duration?.toString() ?? "");
        setDepthMax(d?.depth_max?.toString() ?? "");
        setAvgDepth(d?.average_depth?.toString() ?? "");
        setNotes(d?.notes ?? "");

        if (d?.location_id) {
          const loc = await getLocation(d.location_id);
          setLocationName(loc.name ?? "");
          setLat(loc.latitude?.toString() ?? "");
          setLng(loc.longitude?.toString() ?? "");
        }
      } catch (e: any) {
        Alert.alert("Erreur", e.message || "Chargement impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, [dive_id]);

  const validate = () => {
    const num = (s: string) => (s === "" ? null : Number(s));
    const latN = num(lat);
    const lngN = num(lng);
    if (latN != null && (Number.isNaN(latN) || latN < -90 || latN > 90))
      return "Latitude invalide";
    if (lngN != null && (Number.isNaN(lngN) || lngN < -180 || lngN > 180))
      return "Longitude invalide";
    const dmax = num(depthMax);
    const davg = num(avgDepth);
    if (dmax != null && davg != null && davg > dmax)
      return "La profondeur moyenne ne peut pas dépasser la profondeur max";
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation", err);

    try {
      // 1) Mise à jour plongée
      const diveDiff: any = {};
      const assign = (key: string, v: any, current: any) => {
        const normalized = v === "" ? null : v;
        if (normalized !== current) diveDiff[key] = normalized;
      };

      assign("date", dateIso || null, dive?.date ?? null);
      assign(
        "duration",
        duration === "" ? null : Number(duration),
        dive?.duration ?? null
      );
      assign(
        "depth_max",
        depthMax === "" ? null : Number(depthMax),
        dive?.depth_max ?? null
      );
      assign(
        "average_depth",
        avgDepth === "" ? null : Number(avgDepth),
        dive?.average_depth ?? null
      );
      assign("notes", notes.trim() || null, dive?.notes ?? null);

      if (Object.keys(diveDiff).length > 0) {
        await updateDive(dive_id, diveDiff);
      }

      // 2) Mise à jour lieu
      if (dive?.location_id) {
        const locDiff: any = {};
        if (locationName !== "") locDiff.name = locationName;
        if (lat !== "") locDiff.latitude = Number(lat);
        if (lng !== "") locDiff.longitude = Number(lng);

        if (Object.keys(locDiff).length > 0) {
          await updateLocation(dive.location_id, locDiff);
        }
      }

      Alert.alert("Succès", "Mise à jour réussie");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Échec de la mise à jour");
    }
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

  const inputStyle = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: palette.card,
    color: palette.text,
    marginBottom: 12,
  } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            color: palette.text,
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Infos générales
        </Text>

        <Text style={{ color: palette.sub, marginBottom: 4 }}>
          Date
        </Text>
        <TextInput
          value={dateIso}
          onChangeText={setDateIso}
          autoCapitalize="none"
          placeholder="2025-08-26T10:00:00Z"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <Text style={{ color: palette.sub, marginBottom: 4 }}>Lieu (nom)</Text>
        <TextInput
          value={locationName}
          onChangeText={setLocationName}
          placeholder="Récif de Corail…"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.sub, marginBottom: 4 }}>
              Latitude
            </Text>
            <TextInput
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
              placeholder="46.5197"
              placeholderTextColor={palette.hint}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.sub, marginBottom: 4 }}>
              Longitude
            </Text>
            <TextInput
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
              placeholder="6.6323"
              placeholderTextColor={palette.hint}
              style={inputStyle}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.sub, marginBottom: 4 }}>
              Durée (min)
            </Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor={palette.hint}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.sub, marginBottom: 4 }}>
              Profondeur max (m)
            </Text>
            <TextInput
              value={depthMax}
              onChangeText={setDepthMax}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor={palette.hint}
              style={inputStyle}
            />
          </View>
        </View>

        <Text style={{ color: palette.sub, marginBottom: 4 }}>
          Profondeur moyenne (m)
        </Text>
        <TextInput
          value={avgDepth}
          onChangeText={setAvgDepth}
          keyboardType="numeric"
          placeholder="12"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        {/* Note */}
        <Text style={{ color: palette.sub, marginBottom: 4 }}>Note</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top" // Android: placer le texte en haut
          placeholder="Ajouter une note…"
          placeholderTextColor={palette.hint}
          style={[inputStyle, { minHeight: 110 }]}
        />

        <Button title="Enregistrer" onPress={save} color={colors.primary} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
