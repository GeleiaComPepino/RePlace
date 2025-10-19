import locationsJson from '@/assets/db/postos_com_tags.json';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
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

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  timestamp: number; // Unix timestamp real
}

// Função para calcular tempo decorrido
const formatTimeAgo = (timestamp: number): string => {
  // Unix em segundos -> ms
  const diffMs = Date.now() - timestamp * 1000;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffSec < 60) return "agora mesmo";
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffHrs < 24) return `${diffHrs}h atrás`;

  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d atrás`;
};


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
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { 
      id: 1, 
      title: "Novo ponto adicionado", 
      description: "Um novo posto foi adicionado próximo a você.", 
      timestamp: 1758830160 // Unix timestamp
    },
    { 
      id: 2, 
      title: "Atualização de pontos", 
      description: "Os pontos foram atualizados recentemente.", 
      timestamp: 1758829080 // Unix timestamp
    },
    { 
      id: 3, 
      title: "Promoção exclusiva", 
      description: "Aproveite descontos especiais em postos parceiros.", 
      timestamp: 1758826680 // Unix timestamp
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Forçar atualização automática do tempo
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1); // força re-render
    }, 60 * 1000); // a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

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
              <Text style={styles.greeting}>Olá!</Text>
              <Text style={styles.subGreeting}>
                {notifications.length > 0 
                  ? `${notifications[0].title} • ${formatTimeAgo(notifications[0].timestamp)}`
                  : "Nenhuma notificação ainda"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowNotifications(true)}>
              <Image source={NOTIFICATION_ICON} style={styles.notificationIcon} />
            </TouchableOpacity>
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

        {/* Notifications Modal */}
        <Modal visible={showNotifications} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Notificações</Text>
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationDesc}>{item.description}</Text>
                    <Text style={styles.notificationTime}>{formatTimeAgo(item.timestamp)}</Text>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowNotifications(false)}>
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  notificationIcon: { width: 70, height: 70, borderRadius: 12 },

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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#000" },
  notificationItem: { borderBottomWidth: 1, borderBottomColor: "#EEE", paddingVertical: 10 },
  notificationTitle: { fontSize: 16, fontWeight: "bold", color: "#000" },
  notificationDesc: { fontSize: 14, color: "#333" },
  notificationTime: { fontSize: 12, color: "#777", marginTop: 4 },
  closeButton: { marginTop: 15, backgroundColor: "#25884F", padding: 12, borderRadius: 10, alignItems: "center" },
  closeText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
