import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function ForgotScreen() {
  const { colors, dark } = useTheme();
  const palette = useMemo(() => ({
    bg: colors.background, card: colors.card, text: colors.text, sub: dark ? '#96A2AE' : '#475569',
    border: colors.border, hint: dark ? '#6B7280' : '#94A3B8', accent: colors.primary,
  }), [colors, dark]);

  const [email, setEmail] = useState('');

  const submit = async () => {
    if (!email.includes('@')) return Alert.alert('Erreur', 'Email invalide');
    Alert.alert('Mot de passe', 'Si un compte existe, un email a été envoyé.');
  };

  const input = {
    borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, color: palette.text,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 12,
  } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Reset Password</Text>
      <TextInput placeholder="Email" placeholderTextColor={palette.hint} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={input} />
      <TouchableOpacity onPress={submit} style={{ backgroundColor: palette.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
