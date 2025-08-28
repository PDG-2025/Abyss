import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../../store/auth';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clearSession);
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20 }}>Bienvenue {user?.name}</Text>
      <Button title="Se déconnecter" onPress={() => clear()} />
    </View>
  );
}
