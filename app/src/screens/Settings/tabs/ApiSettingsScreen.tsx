import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { API_BASE, api } from '../../../services/api';

export default function ApiSettingsScreen() {
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
      danger: dark ? '#F87171' : '#B91C1C',
    }),
    [colors, dark]
  );

  const [base, setBase] = useState<string>(API_BASE);
  const [status, setStatus] = useState<string>('');

  const input = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: palette.card,
    color: palette.text,
    marginBottom: 12,
  } as const;

  const Btn = ({ title, onPress, variant = 'primary' as 'primary' | 'ghost' }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: variant === 'primary' ? palette.accent : (dark ? '#0F1620' : '#F7F8FA'),
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
      }}
    >
      <Text style={{ color: variant === 'primary' ? '#fff' : palette.text, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );

  const testApi = async () => {
    setStatus('Test en cours…');
    try {
      const res = await api.get('/users/me'); // nécessite un token si connecté
      setStatus(`OK (${res.status})`);
    } catch (e: any) {
      setStatus(`Erreur: ${e?.response?.status || e?.message}`);
    }
  };

  useEffect(() => {
    setStatus('');
  }, [base]);

  const saveBase = async () => {
    // À implémenter selon votre archi: persister base (MMKV) + recréer axios avec la nouvelle base
    // Ex: saveApiBase(base); api = createApiInstance(base);
    setStatus('Sauvegarde locale non implémentée. Voir commentaire dans le code.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Connexion API</Text>

      <View style={{ backgroundColor: palette.bg, borderRadius: 12, borderWidth: 1, borderColor: palette.border, padding: 12 }}>
        <Text style={{ color: palette.sub, marginBottom: 6 }}>Base actuelle</Text>
        <Text style={{ color: palette.text, marginBottom: 12 }}>{API_BASE}</Text>

        <Text style={{ color: palette.sub, marginBottom: 6 }}>Nouvelle base (URL)</Text>
        <TextInput
          value={base}
          onChangeText={setBase}
          placeholder="https://api.example.com"
          placeholderTextColor={palette.hint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={input}
        />

        <Btn title="Tester la connexion" onPress={testApi} />
        <Text style={{ color: status.startsWith('OK') ? palette.text : palette.danger, marginTop: 8 }}>
          {status ? `Statut: ${status}` : ''}
        </Text>

        <Btn title="Sauvegarder" onPress={saveBase} variant="ghost" />
        <Text style={{ color: palette.sub, fontSize: 12, marginTop: 8 }}>
          Conseil: persistez l’URL (MMKV) et recréez l’instance axios pour appliquer la nouvelle base sans redémarrage.
        </Text>
      </View>
    </View>
  );
}
