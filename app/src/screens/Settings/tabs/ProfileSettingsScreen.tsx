import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuthStore } from '../../../store/auth';
import { api } from '../../../services/api';

export default function ProfileSettingsScreen() {
  const { colors, dark } = useTheme();
  const palette = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    sub: dark ? '#96A2AE' : '#475569',
    border: colors.border,
    danger: dark ? '#F87171' : '#B91C1C',
    inputBg: dark ? '#0F1620' : '#FFFFFF',
  };

  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clearSession);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  const saveProfile = async () => {
    try {
      const res = await api.patch('/users/me', { name });
      if (res.status === 200) {
        await setSession({ ...user!, name: res.data.name }, useAuthStore.getState().token!);
        Alert.alert('Profil', 'Mise à jour réussie');
      } else {
        Alert.alert('Erreur', res.data?.error || 'Échec mise à jour');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Échec mise à jour');
    }
  };

  const changePassword = async () => {
    Alert.alert('Mot de passe', 'Implémentez /users/me/password côté API.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Profil</Text>

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Email</Text>
      <Text style={{ color: palette.text, marginBottom: 12 }}>{user?.email}</Text>

      <Text style={{ color: palette.sub, marginBottom: 4 }}>Nom</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nom"
        placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
        style={{
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 10,
          padding: 10,
          backgroundColor: palette.inputBg,
          color: palette.text,
          marginBottom: 12,
        }}
      />

      <Button title="Enregistrer" onPress={saveProfile} color={colors.primary} />

      <View style={{ height: 24 }} />

      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Mot de passe</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Nouveau mot de passe"
        placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 10,
          padding: 10,
          backgroundColor: palette.inputBg,
          color: palette.text,
          marginBottom: 12,
        }}
      />
      <Button title="Changer le mot de passe" onPress={changePassword} color={colors.primary} />

      <TouchableOpacity onPress={() => clear()} style={{ alignSelf: 'center', marginTop: 16 }}>
        <Text style={{ color: palette.danger }}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}
