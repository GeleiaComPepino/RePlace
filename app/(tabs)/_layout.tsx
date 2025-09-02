import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000', // <-- muda a cor ativa para branco
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'white',
            borderTopWidth: 0,       // <-- remove The line
            shadowColor: 'transparent', // <-- remove iOS shadow
            elevation: 0,            // <-- remove Android shadow
          },
          default: {
            backgroundColor: 'white',
            borderTopWidth: 0,       // remove The line on Android
            elevation: 0,            // remove shadow on Android
          },
        }),

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Casa',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/mappin.png')}
              style={{ width: 28, height: 28, tintColor: focused ? '#000' : '#888' }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="points"
        options={{
          title: 'Pontos',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/points.png')}
              style={{ width: 28, height: 28, tintColor: focused ? '#000' : '#888' }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
