import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { register } from '../../services/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('Abyss User');
  const [email, setEmail] = useState(`seed.${Date.now()}@test.local`);
  const [password, setPassword] = useState('P@ssword123!');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await register(name, email.trim().toLowerCase(), password);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur inscription');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Inscription</Text>
      <TextInput placeholder="Nom" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8 }} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Créer le compte" onPress={onSubmit} />
    </View>
  );
}
