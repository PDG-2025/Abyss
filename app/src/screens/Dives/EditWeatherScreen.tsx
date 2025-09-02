import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation, useTheme } from '@react-navigation/native';
import { getWeather, upsertWeather, deleteWeather } from '../../services/weather';

type Params = { EditWeather: { dive_id: number } };

export default function EditWeatherScreen() {
  const route = useRoute<RouteProp<Params, 'EditWeather'>>();
  const navigation = useNavigation<any>();
  const { colors, dark } = useTheme();
  const dive_id = route.params.dive_id;

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? '#96A2AE' : '#475569',
      border: colors.border,
      hint: dark ? '#6B7280' : '#94A3B8',
      danger: dark ? '#F87171' : '#B91C1C',
    }),
    [colors, dark]
  );

  const [surface_temperature, setSurfaceTemperature] = useState<string>('');
  const [wind_speed, setWindSpeed] = useState<string>('');
  const [wave_height, setWaveHeight] = useState<string>('');
  const [visibility_surface, setVisibilitySurface] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const w = await getWeather(dive_id); // GET /dives/:id/weather
        if (w) {
          setSurfaceTemperature(w.surface_temperature != null ? String(w.surface_temperature) : '');
          setWindSpeed(w.wind_speed != null ? String(w.wind_speed) : '');
          setWaveHeight(w.wave_height != null ? String(w.wave_height) : '');
          setVisibilitySurface(w.visibility_surface != null ? String(w.visibility_surface) : '');
          setDescription(w.description ?? '');
        } else {
          setSurfaceTemperature('');
          setWindSpeed('');
          setWaveHeight('');
          setVisibilitySurface('');
          setDescription('');
        }
      } catch (e: any) {
        Alert.alert('Météo', e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [dive_id]); // [11]

  const onSave = async () => {
    try {
      const payload = {
        surface_temperature: surface_temperature !== '' ? Number(surface_temperature) : null,
        wind_speed: wind_speed !== '' ? Number(wind_speed) : null,
        wave_height: wave_height !== '' ? Number(wave_height) : null,
        visibility_surface: visibility_surface !== '' ? Number(visibility_surface) : null,
        description: description || null,
      };
      await upsertWeather(dive_id, payload); // PUT /dives/:id/weather [11]
      Alert.alert('Météo', 'Enregistré');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Météo', e?.message || 'Erreur de sauvegarde');
    }
  };

  const onDelete = async () => {
    try {
      await deleteWeather(dive_id); // DELETE /dives/:id/weather [11]
      Alert.alert('Météo', 'Supprimé');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Météo', e?.message || 'Erreur suppression');
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
      <View style={{ flex: 1, backgroundColor: palette.bg, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Météo</Text>

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Température surface (°C)</Text>
      <TextInput
        value={surface_temperature}
        onChangeText={setSurfaceTemperature}
        keyboardType="numeric"
        placeholder="22"
        placeholderTextColor={palette.hint}
        style={inputStyle}
      />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Vent (m/s)</Text>
      <TextInput
        value={wind_speed}
        onChangeText={setWindSpeed}
        keyboardType="numeric"
        placeholder="5"
        placeholderTextColor={palette.hint}
        style={inputStyle}
      />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Hauteur de vague (m)</Text>
      <TextInput
        value={wave_height}
        onChangeText={setWaveHeight}
        keyboardType="numeric"
        placeholder="0.6"
        placeholderTextColor={palette.hint}
        style={inputStyle}
      />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Visibilité surface (m)</Text>
      <TextInput
        value={visibility_surface}
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
        placeholder="Mer calme, ciel dégagé…"
        placeholderTextColor={palette.hint}
        style={[inputStyle, { height: 90 }]}
      />

      <View style={{ height: 12 }} />
      <Button title="Enregistrer" onPress={onSave} color={colors.primary} />
      <View style={{ height: 8 }} />
      <Button title="Supprimer" color={palette.danger} onPress={onDelete} />
    </ScrollView>
  );
}
