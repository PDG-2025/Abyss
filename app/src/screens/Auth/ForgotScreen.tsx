import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
// Option: créer un service forgotPassword() côté services/auth
export default function ForgotScreen() {
  const [email, setEmail] = useState('');

  const submit = async () => {
    if (!email.includes('@')) {
      return Alert.alert('Erreur', 'Email invalide');
    }
    // Placeholder tant que l’API n’existe pas
    // await forgotPassword(email);
    Alert.alert('Mot de passe', 'Si un compte existe, un email a été envoyé.');
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Mot de passe oublié</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8 }}
      />
      <Button title="Envoyer" onPress={submit} />
    </View>
  );
}
