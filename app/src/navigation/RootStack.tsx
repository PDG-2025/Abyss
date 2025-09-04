import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import DiveDetailScreen from "../screens/Dives/DiveDetailScreen";
import ForgotScreen from "../screens/Auth/ForgotScreen";
import EditWeatherScreen from "../screens/Dives/EditWeatherScreen";
import EditEquipmentScreen from "../screens/Dives/EditEquipmentScreen";
import DiveMediaScreen from "../screens/Dives/DiveMediaScreen";
import EditDiveInfoScreen from "../screens/Dives/EditDiveInfoScreen";
import WelcomeScreen from "../screens/Auth/WelcomeScreen";
import { useAuthStore } from "../store/auth";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Forgot: undefined;
  Welcome: undefined;
  DiveDetail: { dive_id: number };
  EditDiveInfo: { dive_id: number };
  EditWeather: { dive_id: number };
  EditEquipment: { dive_id: number };
  DiveMedia: { dive_id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator id="RootStack" screenOptions={{ headerShown: true }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DiveDetail"
            component={DiveDetailScreen}
            options={{ title: "Détail plongée" }}
          />
          <Stack.Screen
            name="EditDiveInfo"
            component={EditDiveInfoScreen}
            options={{ title: "Infos générales" }}
          />
          <Stack.Screen
            name="EditWeather"
            component={EditWeatherScreen}
            options={{ title: "Météo" }}
          />
          <Stack.Screen
            name="EditEquipment"
            component={EditEquipmentScreen}
            options={{ title: "Équipement" }}
          />
          <Stack.Screen
            name="DiveMedia"
            component={DiveMediaScreen}
            options={{ title: "Médias" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Connexion" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Inscription" }}
          />
          <Stack.Screen
            name="Forgot"
            component={ForgotScreen}
            options={{ title: "Mot de passe oublié" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
