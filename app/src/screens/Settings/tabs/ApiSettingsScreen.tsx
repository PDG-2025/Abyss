import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { API_BASE, api } from '../../../services/api';

export default function ApiSettingsScreen() {
  const [base, setBase] = useState<string>(API_BASE);
  const [status, setStatus] = useState<string>('');

  const testApi = async () => {
    setStatus('Test en cours...');
    try {
      const res = await api.get('/users/me'); // nécessitera un token si authentifié
      setStatus(`OK (${res.status})`);
    } catch (e: any) {
      setStatus(`Erreur: ${e?.response?.status || e?.message}`);
    }
  };

  useEffect(() => { setStatus(''); }, [base]);

  const saveBase = async () => {
    // Option: rendre API_BASE dynamique avec MMKV et recréer l’instance axios
    Alert.alert('API', 'Implémentez la bascule dynamique d’API si nécessaire (MMKV + recréer axios).');
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Connexion API</Text>
      <Text>Base actuelle: {API_BASE}</Text>
      <TextInput value={base} onChangeText={setBase} placeholder="https://api.example.com" autoCapitalize="none" style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Tester la connexion" onPress={testApi} />
      <Text>Statut: {status}</Text>
      <Button title="Sauvegarder" onPress={saveBase} />
    </View>
  );
}
