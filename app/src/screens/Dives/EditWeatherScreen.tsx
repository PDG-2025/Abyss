import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useRoute,
  RouteProp,
  useNavigation,
  useTheme,
} from "@react-navigation/native";
import {
  getWeather,
  updateWeather,
  deleteWeather,
} from "../../services/weather";

type Params = { EditWeather: { dive_id: number } };

export default function EditWeatherScreen() {
  const route = useRoute<RouteProp<Params, "EditWeather">>();
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();
  const dive_id = route.params.dive_id;

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
  const [weather, setWeather] = useState<any | null>(null);

  // états formulaire
  const [surfaceTemperature, setSurfaceTemperature] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [waveHeight, setWaveHeight] = useState("");
  const [visibilitySurface, setVisibilitySurface] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const w = await getWeather(dive_id);
        if (w) {
          setWeather(w);
          console.log(w.surface_temperature);
          setSurfaceTemperature(
            w.surface_temperature != null ? String(w.surface_temperature) : ""
          );
          setWindSpeed(w.wind_speed != null ? String(w.wind_speed) : "");
          setWaveHeight(w.wave_height != null ? String(w.wave_height) : "");
          setVisibilitySurface(
            w.visibility_surface != null ? String(w.visibility_surface) : ""
          );
          setDescription(w.description ?? "");
        } else {
          setWeather(null);
          setSurfaceTemperature("");
          setWindSpeed("");
          setWaveHeight("");
          setVisibilitySurface("");
          setDescription("");
        }
      } catch (e: any) {
        Alert.alert("Météo", e?.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [dive_id]);

  const validate = () => {
    const num = (s: string) => (s === "" ? null : Number(s));
    const temp = num(surfaceTemperature);
    const wind = num(windSpeed);
    const wave = num(waveHeight);
    const vis = num(visibilitySurface);
    if (temp != null && (Number.isNaN(temp) || temp < -50 || temp > 60))
      return "Température invalide";
    if (wind != null && (Number.isNaN(wind) || wind < 0))
      return "Vitesse du vent invalide";
    if (wave != null && (Number.isNaN(wave) || wave < 0))
      return "Hauteur de vague invalide";
    if (vis != null && (Number.isNaN(vis) || vis < 0))
      return "Visibilité invalide";
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation", err);

    const diff: any = {};
    const assign = (key: string, value: any, current: any) => {
      const normalized = value === "" ? null : Number(value) || value;
      if (normalized !== current) diff[key] = normalized;
    };

    assign(
      "surface_temperature",
      surfaceTemperature,
      weather?.surface_temperature
    );
    
    assign("wind_speed", windSpeed, weather?.wind_speed);
    assign("wave_height", waveHeight, weather?.wave_height);
    assign(
      "visibility_surface",
      visibilitySurface,
      weather?.visibility_surface
    );
    assign("description", description, weather?.description);

    if (Object.keys(diff).length === 0)
      return Alert.alert("Infos", "Aucun changement");

    try {
      const updated = await updateWeather(dive_id, diff);
      setWeather(updated);
      Alert.alert("Succès", "Météo mise à jour");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Échec de la mise à jour");
    }
  };

  const onDelete = async () => {
    try {
      await deleteWeather(dive_id);
      setWeather(null);
      setSurfaceTemperature("");
      setWindSpeed("");
      setWaveHeight("");
      setVisibilitySurface("");
      setDescription("");
      Alert.alert("Météo", "Supprimée");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Échec de la suppression");
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: palette.card,
    color: palette.text,
    marginBottom: 12,
  } as const;

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
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
          Météo
        </Text>

        <Text style={{ color: palette.sub, marginBottom: 4 }}>
          Température surface (°C)
        </Text>
        <TextInput
          value={surfaceTemperature}
          onChangeText={setSurfaceTemperature}
          keyboardType="numeric"
          placeholder="22"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <Text style={{ color: palette.sub, marginBottom: 4 }}>Vent (m/s)</Text>
        <TextInput
          value={windSpeed}
          onChangeText={setWindSpeed}
          keyboardType="numeric"
          placeholder="5"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <Text style={{ color: palette.sub, marginBottom: 4 }}>
          Hauteur de vague (m)
        </Text>
        <TextInput
          value={waveHeight}
          onChangeText={setWaveHeight}
          keyboardType="numeric"
          placeholder="0.6"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <Text style={{ color: palette.sub, marginBottom: 4 }}>
          Visibilité surface (m)
        </Text>
        <TextInput
          value={visibilitySurface}
          onChangeText={setVisibilitySurface}
          keyboardType="numeric"
          placeholder="15"
          placeholderTextColor={palette.hint}
          style={inputStyle}
        />

        <Text style={{ color: palette.sub, marginBottom: 4 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholder="Mer calme, ciel dégagé…"
          placeholderTextColor={palette.hint}
          style={[inputStyle, { minHeight: 90 }]}
        />

        <View style={{ height: 12 }} />
        <Button title="Enregistrer" onPress={onSave} color={colors.primary} />
        <View style={{ height: 8 }} />
        <Button title="Supprimer" color={palette.danger} onPress={onDelete} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
