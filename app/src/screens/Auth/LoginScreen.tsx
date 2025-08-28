import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('seed.user@test.local');
  const [password, setPassword] = useState('P@ssword123!');
  const [error, setError] = useState<string | null>(null);
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => { restore(); }, []);

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Connexion</Text>
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8 }} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Se connecter" onPress={onSubmit} />
    </View>
  );
}
