import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import DivesListScreen from '../screens/Dives/DivesListScreen';
import MapScreen from '../screens/Map/MapScreen';
import DevicesScreen from '../screens/Devices/DevicesScreen';
import SettingsStack from './SettingsStack'; // Onglets internes
// Option: import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Dives" component={DivesListScreen} options={{ title: 'Plongées' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Devices" component={DevicesScreen} options={{ title: 'Ordinateur' }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false, title: 'Paramètres' }} />
    </Tab.Navigator>
  );
}
