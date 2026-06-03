import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import CadastroScreen from '../screens/CadastroScreen';
import AlertasScreen from '../screens/AlertasScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#12121E',
            borderTopColor: '#2E2E4E',
            height: 65,
          },
          tabBarActiveTintColor: '#4A90D9',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Cadastro" component={CadastroScreen} />
        <Tab.Screen name="Alertas" component={AlertasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}