import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setButtonStyleAsync('dark');
      NavigationBar.setVisibilityAsync('visible');
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: 'transparent',
          paddingBottom: insets.bottom, // garante que fique acima da barra do Android
        },
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
