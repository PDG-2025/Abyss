import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUIStore } from '../../../store/ui';

function Radio({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? '#0ea5e9' : '#94a3b8',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#0ea5e9',
            }}
          />
        ) : null}
      </View>
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export default function AppearanceSettingsScreen() {
  const mode = useUIStore((s) => s.themeMode);
  const setMode = useUIStore((s) => s.setThemeMode);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Apparence</Text>
      <Radio label="Système" selected={mode === 'system'} onPress={() => setMode('system')} />
      <Radio label="Clair" selected={mode === 'light'} onPress={() => setMode('light')} />
      <Radio label="Sombre" selected={mode === 'dark'} onPress={() => setMode('dark')} />
      <Text style={{ marginTop: 16, color: '#64748b' }}>
        Le mode “Système” suit automatiquement le thème du téléphone.
      </Text>
    </View>
  );
}
