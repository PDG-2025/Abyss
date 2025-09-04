import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons'; // Expo
import HomeScreen from '../screens/Home/HomeScreen';
import DivesListScreen from '../screens/Dives/DivesListScreen';
import MapScreen from '../screens/Map/MapScreen';
import DevicesScreen from '../screens/Devices/DevicesScreen';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let name: any = 'home-outline';
          if (route.name === 'Home') name = focused ? 'home' : 'home-outline';
          if (route.name === 'Dives') name = focused ? 'list' : 'list-outline';
          if (route.name === 'Map') name = focused ? 'map' : 'map-outline';
          if (route.name === 'Devices') name = focused ? 'watch' : 'watch-outline';
          if (route.name === 'Settings') name = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: '#0F1620', borderTopColor: '#223042' }, // thème sombre 
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Dives" component={DivesListScreen} options={{ title: 'Plongées' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Devices" component={DevicesScreen} options={{ title: 'Ordinateur' }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false, title: 'Paramètres' }} />
    </Tab.Navigator>
  );
}
