import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation, useTheme } from '@react-navigation/native';
import { getEquipment, upsertEquipment, deleteEquipment } from '../../services/equipment';

type Params = { EditEquipment: { dive_id: number } };

export default function EditEquipmentScreen() {
  const route = useRoute<RouteProp<Params, 'EditEquipment'>>();
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

  const [wetsuit_thickness, setWetsuitThickness] = useState<string>('');
  const [tank_size, setTankSize] = useState<string>('');
  const [tank_pressure_start, setTankPressureStart] = useState<string>('');
  const [tank_pressure_end, setTankPressureEnd] = useState<string>('');
  const [weights_used, setWeightsUsed] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const eq = await getEquipment(dive_id); // GET /dives/:id/equipment [11]
        if (eq) {
          setWetsuitThickness(eq.wetsuit_thickness != null ? String(eq.wetsuit_thickness) : '');
          setTankSize(eq.tank_size != null ? String(eq.tank_size) : '');
          setTankPressureStart(eq.tank_pressure_start != null ? String(eq.tank_pressure_start) : '');
          setTankPressureEnd(eq.tank_pressure_end != null ? String(eq.tank_pressure_end) : '');
          setWeightsUsed(eq.weights_used != null ? String(eq.weights_used) : '');
        } else {
          setWetsuitThickness('');
          setTankSize('');
          setTankPressureStart('');
          setTankPressureEnd('');
          setWeightsUsed('');
        }
      } catch (e: any) {
        Alert.alert('Équipement', e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [dive_id]); // [11]

  const onSave = async () => {
    try {
      const payload = {
        wetsuit_thickness: wetsuit_thickness !== '' ? Number(wetsuit_thickness) : null,
        tank_size: tank_size !== '' ? Number(tank_size) : null,
        tank_pressure_start: tank_pressure_start !== '' ? Number(tank_pressure_start) : null,
        tank_pressure_end: tank_pressure_end !== '' ? Number(tank_pressure_end) : null,
        weights_used: weights_used !== '' ? Number(weights_used) : null,
      };
      await upsertEquipment(dive_id, payload); // PUT /dives/:id/equipment [11]
      Alert.alert('Équipement', 'Enregistré');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Équipement', e?.message || 'Erreur de sauvegarde');
    }
  };

  const onDelete = async () => {
    try {
      await deleteEquipment(dive_id); // DELETE /dives/:id/equipment [11]
      Alert.alert('Équipement', 'Supprimé');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Équipement', e?.message || 'Erreur suppression');
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
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Équipement</Text>

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Épaisseur combinaison (mm)</Text>
      <TextInput value={wetsuit_thickness} onChangeText={setWetsuitThickness} keyboardType="numeric" placeholder="5" placeholderTextColor={palette.hint} style={inputStyle} />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Taille bloc (L)</Text>
      <TextInput value={tank_size} onChangeText={setTankSize} keyboardType="numeric" placeholder="12" placeholderTextColor={palette.hint} style={inputStyle} />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Pression départ (psi/bar)</Text>
      <TextInput value={tank_pressure_start} onChangeText={setTankPressureStart} keyboardType="numeric" placeholder="200" placeholderTextColor={palette.hint} style={inputStyle} />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Pression fin (psi/bar)</Text>
      <TextInput value={tank_pressure_end} onChangeText={setTankPressureEnd} keyboardType="numeric" placeholder="50" placeholderTextColor={palette.hint} style={inputStyle} />

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Lest (kg)</Text>
      <TextInput value={weights_used} onChangeText={setWeightsUsed} keyboardType="numeric" placeholder="6" placeholderTextColor={palette.hint} style={inputStyle} />

      <View style={{ height: 12 }} />
      <Button title="Enregistrer" onPress={onSave} color={colors.primary} />
      <View style={{ height: 8 }} />
      <Button title="Supprimer" color={palette.danger} onPress={onDelete} />
    </ScrollView>
  );
}
