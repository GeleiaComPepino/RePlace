import locationsJson from '@/assets/db/postos_com_tags.json';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect, useState } from "react";
import { Alert, Image, Linking, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const IMG_PROFILE = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/bw1o78ag_expires_30_days.png";
const IMG_MAP = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/idppdcln_expires_30_days.png";
const IMG_ALL_POINTS = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/bwm3f7v7_expires_30_days.png";

interface LocationItem {
  nome_estabelecimento: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  tag: string;
}

// Haversine formula
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Função para abrir o mapa do dispositivo
const openMaps = (latitude: number, longitude: number, label?: string) => {
  const scheme = Platform.select({
    ios: 'maps:0,0?q=',
    android: 'geo:0,0?q='
  });

  const latLng = `${latitude},${longitude}`;
  const query = label ? `${latLng}(${label})` : latLng;
  const url = `${scheme}${query}`;

  Linking.openURL(url).catch(err => console.error('Erro ao abrir o mapa:', err));
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Configura NavigationBar para Android
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('sticky'); // mantém altura normal
      NavigationBar.setBackgroundColorAsync('#EEEFEF'); // combina com o app
      NavigationBar.setButtonStyleAsync('dark');
      NavigationBar.setVisibilityAsync('visible');
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const sortedLocations = locationsJson
    .map((loc: LocationItem) => {
      let distance = "N/A";
      if (userLocation) {
        const km = getDistanceKm(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude);
        distance = `${km.toFixed(1)} Km`;
      }
      return { ...loc, distance };
    })
    .sort((a, b) => userLocation ? parseFloat(a.distance) - parseFloat(b.distance) : 0)
    .slice(0, 6);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EEEFEF", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar translucent={false} backgroundColor="#EEEFEF" barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom, flexGrow: 1 }}
        style={{ flex: 1, backgroundColor: "#EEEFEF" }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 7, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>Olá Bryan!</Text>
            <Text style={{ color: "#222", fontSize: 16 }}>Pontos atualizados à 32 minutos atrás</Text>
          </View>
          <Image source={{ uri: IMG_PROFILE }} resizeMode="cover" style={{ width: 80, height: 76, borderRadius: 12 }} />
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginHorizontal: 13, marginBottom: 12 }}>
          <View style={{ backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 24, paddingHorizontal: 24, marginHorizontal: 8, alignItems: "center" }}>
            <Image source={{ uri: IMG_MAP }} resizeMode="contain" style={{ width: 56, height: 56, marginBottom: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>Ver no Mapa</Text>
          </View>

          <View style={{ backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, marginHorizontal: 8, alignItems: "center" }}>
            <View style={{ borderWidth: 1, borderColor: "#00000012", borderRadius: 12, padding: 8, marginBottom: 8 }}>
              <Image source={{ uri: IMG_ALL_POINTS }} resizeMode="contain" style={{ width: 40, height: 40 }} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: "#000" }}>Ver todos os pontos</Text>
          </View>
        </View>

        {/* Nearby Points */}
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000", marginLeft: 16, marginBottom: 8 }}>
          Pontos mais próximos
        </Text>

        {sortedLocations.map((point, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openMaps(point.latitude, point.longitude, point.nome_estabelecimento)}
            style={{ marginHorizontal: 13, marginBottom: 5 }}
          >
            <View style={{ flexDirection: "row", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#000" }}>
                  {point.nome_estabelecimento}
                </Text>
                <Text style={{ fontSize: 14, color: "#222" }}>
                  {point.endereco}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#25884F", alignSelf: "center" }}>
                {point.distance}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
