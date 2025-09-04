import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSettingsStore } from '../../../store/settings';

function Radio({ label, selected, onPress, palette }: { label: string; selected: boolean; onPress: () => void; palette: any }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
      <View
        style={{
          width: 20, height: 20, borderRadius: 10, borderWidth: 2,
          borderColor: selected ? palette.accent : palette.sub,
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
        }}
      >
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: palette.accent }} /> : null}
      </View>
      <Text style={{ color: palette.text }}>{label}</Text>
    </Pressable>
  );
}

function Card({ children, palette, title }: { children: React.ReactNode; palette: any; title: string }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: palette.bg, borderRadius: 12, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 12, paddingVertical: 4 }}>
        {children}
      </View>
    </View>
  );
}

const COMMON_TZS = [
  'UTC',
  'Europe/Paris',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Africa/Johannesburg',
];

export default function SettingsUnits() {
  const { colors, dark } = useTheme();

  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? '#96A2AE' : '#475569',
      border: colors.border,
      hint: dark ? '#6B7280' : '#94A3B8',
      accent: colors.primary,
    }),
    [colors, dark]
  );

  const distance = useSettingsStore((s) => s.distance);
  const pressure = useSettingsStore((s) => s.pressure);
  const temperature = useSettingsStore((s) => s.temperature);
  const volume = useSettingsStore((s) => s.volume);
  const weight = useSettingsStore((s) => s.weight);
  const timezone = useSettingsStore((s) => s.timezone);

  const setDistance = useSettingsStore((s) => s.setDistance);
  const setPressure = useSettingsStore((s) => s.setPressure);
  const setTemperature = useSettingsStore((s) => s.setTemperature);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const setWeight = useSettingsStore((s) => s.setWeight);
  const setTimezone = useSettingsStore((s) => s.setTimezone);

  const [tzModal, setTzModal] = useState(false);
  const [tzQuery, setTzQuery] = useState('');

  const tzList = useMemo(() => {
    const base = COMMON_TZS;
    if (!tzQuery.trim()) return base;
    const q = tzQuery.trim().toLowerCase();
    return base.filter((z) => z.toLowerCase().includes(q));
  }, [tzQuery]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700' }}>Unités & Fuseau</Text>

      <Card title="Distance" palette={palette}>
        <Radio label="Mètres (m)" selected={distance === 'm'} onPress={() => setDistance('m')} palette={palette} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Radio label="Pieds (ft)" selected={distance === 'ft'} onPress={() => setDistance('ft')} palette={palette} />
      </Card>

      <Card title="Pression" palette={palette}>
        <Radio label="bar" selected={pressure === 'bar'} onPress={() => setPressure('bar')} palette={palette} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Radio label="psi" selected={pressure === 'psi'} onPress={() => setPressure('psi')} palette={palette} />
      </Card>

      <Card title="Température" palette={palette}>
        <Radio label="Celsius (°C)" selected={temperature === 'C'} onPress={() => setTemperature('C')} palette={palette} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Radio label="Fahrenheit (°F)" selected={temperature === 'F'} onPress={() => setTemperature('F')} palette={palette} />
      </Card>

      <Card title="Volume" palette={palette}>
        <Radio label="Litres (L)" selected={volume === 'L'} onPress={() => setVolume('L')} palette={palette} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Radio label="Cubic feet (cu ft)" selected={volume === 'cuft'} onPress={() => setVolume('cuft')} palette={palette} />
      </Card>

      <Card title="Poids" palette={palette}>
        <Radio label="Kilogrammes (kg)" selected={weight === 'kg'} onPress={() => setWeight('kg')} palette={palette} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Radio label="Livres (lb)" selected={weight === 'lb'} onPress={() => setWeight('lb')} palette={palette} />
      </Card>

      <Card title="Fuseau horaire" palette={palette}>
        <Pressable onPress={() => setTzModal(true)} style={{ paddingVertical: 12 }}>
          <Text style={{ color: palette.sub, marginBottom: 4 }}>Actuel</Text>
          <Text style={{ color: palette.text, fontWeight: '600' }}>{timezone}</Text>
        </Pressable>
      </Card>

      <Text style={{ color: palette.sub, fontSize: 12, marginTop: 12 }}>
        Astuce: ces préférences s’appliquent à l’affichage des plongées et des métriques dans toute l’application.
      </Text>

      {/* Modal Timezone */}
      <Modal visible={tzModal} animationType="slide" onRequestClose={() => setTzModal(false)}>
        <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Choisir un fuseau</Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: palette.card,
              marginBottom: 12,
            }}
          >
            <TextInput
              value={tzQuery}
              onChangeText={setTzQuery}
              placeholder="Rechercher (ex: Europe/Paris)"
              placeholderTextColor={palette.hint}
              style={{ color: palette.text }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={tzList}
            keyExtractor={(z) => z}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setTimezone(item);
                  setTzModal(false);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border,
                }}
              >
                <Text style={{ color: palette.text }}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: palette.sub }}>Aucun résultat</Text>}
          />

          <TouchableOpacity
            onPress={() => setTzModal(false)}
            style={{
              marginTop: 16,
              backgroundColor: palette.card,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
