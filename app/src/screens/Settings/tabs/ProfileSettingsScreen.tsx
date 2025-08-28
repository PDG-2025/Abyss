import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuthStore } from '../../../store/auth';
import { api } from '../../../services/api';

export default function ProfileSettingsScreen() {
  const user = useAuthStore(s => s.user);
  const setSession = useAuthStore(s => s.setSession);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  const saveProfile = async () => {
    const res = await api.patch('/users/me', { name });
    if (res.status === 200) {
      // Recharger user depuis API si besoin; ici on garde email même
      await setSession({ ...user!, name: res.data.name }, useAuthStore.getState().token!);
      Alert.alert('Profil', 'Mise à jour réussie');
    } else {
      Alert.alert('Erreur', res.data?.error || 'Echec mise à jour');
    }
  };

  const changePassword = async () => {
    // Si l’API propose /users/me/password: implémenter ici; sinon laisser placeholder
    Alert.alert('Mot de passe', 'Implémentez la route /users/me/password côté API.');
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Profil</Text>
      <Text>Email: {user?.email}</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Nom" style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Enregistrer" onPress={saveProfile} />
      <View style={{ height: 24 }} />
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Mot de passe</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="Nouveau mot de passe" secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Changer le mot de passe" onPress={changePassword} />
    </View>
  );
}
