import locationsJson from '@/assets/db/postos_com_tags.json';
import logos from '@/logos';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect, useState } from "react";
import { FlatList, Image, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type LogosKeys = keyof typeof logos;

interface LocationItem {
  nome_estabelecimento: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  tag: LogosKeys;
}

const locations = locationsJson as LocationItem[];

// Função para calcular distância em km
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Abrir mapas
const openMaps = (latitude: number, longitude: number, label?: string) => {
  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${latitude},${longitude}`;
  const query = label ? `${latLng}(${label})` : latLng;
  const url = `${scheme}${query}`;
  Linking.openURL(url).catch(err => console.error('Erro ao abrir o mapa:', err));
};

// Botão redondo
const RoundButton: React.FC<{ children: React.ReactNode; style?: any; onPress?: () => void }> = ({ children, style, onPress }) => (
  <TouchableOpacity style={[styles.roundButton, style]} onPress={onPress}>{children}</TouchableOpacity>
);

// Card de localização
const LocationCard: React.FC<{ image: any; name: string; address: string; distance: string }> = ({ image, name, address, distance }) => (
  <View style={styles.cardContainer}>
    <Image source={typeof image === 'number' ? image : { uri: image }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardSubtitle}>{address}</Text>
    </View>
    <View style={styles.distanceButton}>
      <Text style={styles.distanceText}>{distance}</Text>
    </View>
  </View>
);

// Função para formatar cidade (primeira letra maiúscula)
const formatCityName = (city: string) => {
  return city
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showCityList, setShowCityList] = useState(false);

  const uniqueCities = Array.from(
    new Map(
      locations.map(loc => [loc.cidade.toLowerCase(), loc.cidade])
    ).values()
  ).sort();

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        NavigationBar.setBehaviorAsync('overlay-swipe');
        NavigationBar.setBackgroundColorAsync('transparent');
        NavigationBar.setButtonStyleAsync('dark');
        NavigationBar.setVisibilityAsync('visible');
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const userCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(userCoords);

      // Encontra a loja mais próxima e seleciona sua cidade
      let nearestLocation: LocationItem | null = null;
      let minDistance = Number.MAX_SAFE_INTEGER;

      for (const location of locations) {
        const distance = getDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          location.latitude,
          location.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestLocation = location;
        }
      }

      if (nearestLocation) {
        setSelectedCity(nearestLocation.cidade);
      }
    })();
  }, []);

  const filteredLocations = selectedCity
    ? locations
        .filter(loc => loc.cidade.toLowerCase() === selectedCity.toLowerCase())
        .map(loc => {
          let distanceKm = Number.MAX_SAFE_INTEGER;
          if (userLocation)
            distanceKm = getDistanceKm(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude);
          return { ...loc, distanceKm };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map(loc => ({
          ...loc,
          distance: loc.distanceKm !== Number.MAX_SAFE_INTEGER ? `${loc.distanceKm.toFixed(1)} Km` : "N/A"
        }))
    : [];

  const renderItem = ({ item }: { item: LocationItem & { distance: string } }) => (
    <TouchableOpacity
      onPress={() => openMaps(item.latitude, item.longitude, item.nome_estabelecimento)}
      style={{ marginBottom: 10 }}
    >
      <LocationCard
        image={logos[item.tag]}
        name={item.nome_estabelecimento}
        address={item.endereco}
        distance={item.distance}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom + (Platform.OS === 'android' ? 20 : 0) }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        <Image source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/qvsbmwyi_expires_30_days.png" }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <RoundButton style={styles.locationButton} onPress={() => setShowCityList(prev => !prev)}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {selectedCity ? formatCityName(selectedCity) : "Carregando..."}
            </Text>
          </RoundButton>
          {showCityList && (
            <View style={styles.cityListContainer}>
              <FlatList
                data={uniqueCities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => { setSelectedCity(item); setShowCityList(false); }}
                  >
                    <Text style={styles.cityText}>{formatCityName(item)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
        <RoundButton style={styles.statusButton} onPress={() => alert('Pressed!')}>
          <Text style={styles.statusText}>Aberto</Text>
        </RoundButton>
        <RoundButton style={styles.filterButton} onPress={() => alert('Filtros')}>
          <Text style={styles.filterText}>Filtros</Text>
          <Image source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/o8k806wb_expires_30_days.png" }} style={styles.filterIcon} />
        </RoundButton>
      </View>

      <FlatList
        data={filteredLocations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 30 + 20 : 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", margin: 16 },
  logo: { width: 48, height: 48 },
  roundButton: { borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 12 },
  locationButton: { backgroundColor: "#000", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  statusButton: { backgroundColor: "#000", marginLeft: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  statusText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  filterButton: { flexDirection: "row", backgroundColor: "#EEEFEF", borderColor: "#BBBDC0", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginLeft: 6 },
  filterText: { color: "#000", fontWeight: "bold", fontSize: 14, marginRight: 6 },
  filterIcon: { width: 16, height: 16 },
  cardContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  cardImage: { width: 55, height: 55, marginRight: 12, borderRadius: 8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#222427" },
  distanceButton: { backgroundColor: "#EEEFEF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  distanceText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  cityListContainer: { position: 'absolute', top: 50, left: 8, right: 8, maxHeight: 200, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#ccc", zIndex: 1000, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  cityItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  cityText: { fontSize: 16, color: "#000" },
});
