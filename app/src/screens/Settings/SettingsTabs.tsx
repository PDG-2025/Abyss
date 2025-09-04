import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';
import { useAuthStore } from '../../store/auth';

type Nav = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsHome() {
  const nav = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const user = useAuthStore((s) => s.user);

  const palette = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    sub: dark ? '#96A2AE' : '#475569',
    border: dark ? '#223042' : '#E2E8F0',
  };

  const Row = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
    >
      <Text style={{ color: palette.text, flex: 1 }}>{title}</Text>
      <Text style={{ color: palette.sub, fontSize: 18 }}>➔</Text>
    </TouchableOpacity>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginTop: 18 }}>
      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: palette.bg, borderRadius: 12, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 12 }}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      {/* En-tête */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user?.name || 'Abyss')}` }}
          style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: palette.card, marginBottom: 10 }}
        />
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700' }}>{user?.name || '—'}</Text>
        <Text style={{ color: palette.sub }}>{user?.email || '—'}</Text>
      </View>

      <Section title="Général">
        <Row title="Informations personnelles" onPress={() => nav.navigate('SettingsProfile')} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Row title="Paramètres" onPress={() => nav.navigate('SettingsAppearance')} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Row title="Unités de mesure" onPress={() => nav.navigate('SettingsUnits')} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Row title="Notifications" onPress={() => nav.navigate('SettingsNotifications')} />
      </Section>

      <Section title="Support">
        <Row title="Aide" onPress={() => nav.navigate('SettingsHelp')} />
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <Row title="Contactez-nous" onPress={() => nav.navigate('SettingsContact')} />
      </Section>
    </ScrollView>
  );
}
