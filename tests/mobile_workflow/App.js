import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function App() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <Text>Hello from React Native 👋</Text>
      <Button title="Click me" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

