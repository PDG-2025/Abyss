import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('seed.user@test.local');
  const [password, setPassword] = useState('P@ssword123!');
  const [error, setError] = useState<string | null>(null);
  const restore = useAuthStore((s) => s.restore);
  const navigation = useNavigation<any>();

  useEffect(() => { restore(); }, []);

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      // La navigation vers Home est gérée par la Gate d’auth dans RootStack
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Connexion</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8 }}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Se connecter" onPress={onSubmit} />

      <View style={{ height: 8 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ color: '#0ea5e9' }}>Créer un compte</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
        <Text style={{ color: '#0ea5e9', marginTop: 8 }}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}
