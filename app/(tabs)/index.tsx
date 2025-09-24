import locationsJson from '@/assets/db/postos_com_tags.json';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from "expo-router"; // 👈 import router
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Assets
const NOTIFICATION_ICON = require('@/assets/images/notification.png');
const IMG_MAP = require('@/assets/images/map.png');
const IMG_ALL_POINTS = require('@/assets/images/allpoints.png');

// Tipos
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

// Cálculo de distância (Haversine)
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

// Abrir localização no app de mapas
const openMaps = (latitude: number, longitude: number, label?: string) => {
  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${latitude},${longitude}`;
  const query = label ? `${latLng}(${label})` : latLng;
  const url = `${scheme}${query}`;
  Linking.openURL(url).catch(err => console.error('Erro ao abrir o mapa:', err));
};

// Componente principal
export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // 👈 inicializa router
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Configuração inicial
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#EEEFEF');
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

  // Ordena locais pela distância
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <StatusBar translucent={false} backgroundColor="#EEEFEF" barStyle="dark-content" />

        <ScrollView 
          contentContainerStyle={{ paddingBottom: insets.bottom, flexGrow: 1 }}
          style={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Olá Bryan!</Text>
              <Text style={styles.subGreeting}>Pontos atualizados há 32 minutos</Text>
            </View>
            <Image source={NOTIFICATION_ICON} style={styles.notificationIcon} />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {/* Ver no mapa */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/mapa")}>
              <Image source={IMG_MAP} style={styles.actionIcon} />
              <Text style={styles.actionText}>Ver no Mapa</Text>
            </TouchableOpacity>

            {/* Ver todos os pontos */}
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/points")}>
              <View style={styles.iconWrapper}>
                <Image source={IMG_ALL_POINTS} style={styles.smallIcon} />
              </View>
              <Text style={styles.actionText}>Ver todos os pontos</Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Points */}
          <Text style={styles.sectionTitle}>Pontos mais próximos</Text>

          {sortedLocations.map((point, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openMaps(point.latitude, point.longitude, point.nome_estabelecimento)}
              style={styles.pointWrapper}
            >
              <View style={styles.pointCard}>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointName}>{point.nome_estabelecimento}</Text>
                  <Text style={styles.pointAddress}>{point.endereco}</Text>
                </View>
                <Text style={styles.pointDistance}>{point.distance}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eeeeeeff" },
  container: { flex: 1 },
  scroll: { flex: 1, backgroundColor: "#EEEFEF" },

  // Header
  header: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 7, alignItems: "center" },
  headerTextContainer: { flex: 1 },
  greeting: { color: "#000", fontSize: 20, fontWeight: "bold" },
  subGreeting: { color: "#222", fontSize: 16 },
  notificationIcon: { width: 80, height: 76, borderRadius: 12 },

  // Quick Actions
  quickActions: { flexDirection: "row", justifyContent: "center", marginHorizontal: 13, marginBottom: 12 },
  actionCard: { 
    backgroundColor: "#FFF", 
    borderRadius: 16, 
    paddingVertical: 24, 
    paddingHorizontal: 20, 
    marginHorizontal: 8, 
    alignItems: "center" 
  },
  actionIcon: { width: 56, height: 56, marginBottom: 8, resizeMode: "contain" },
  actionText: { fontSize: 16, fontWeight: "bold", color: "#000", textAlign: "center" },
  iconWrapper: { borderWidth: 1, borderColor: "#00000012", borderRadius: 12, padding: 8, marginBottom: 8 },
  smallIcon: { width: 40, height: 40, resizeMode: "contain" },

  // Section
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginLeft: 16, marginBottom: 8 },

  // Points
  pointWrapper: { marginHorizontal: 13, marginBottom: 5 },
  pointCard: { flexDirection: "row", backgroundColor: "#FFF", padding: 16, borderRadius: 12 },
  pointInfo: { flex: 1 },
  pointName: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#000" },
  pointAddress: { fontSize: 14, color: "#222" },
  pointDistance: { fontSize: 16, fontWeight: "bold", color: "#25884F", alignSelf: "center" },
});
