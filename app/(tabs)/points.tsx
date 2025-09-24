// Imports
import * as Location from "expo-location";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import locationsJson from "@/assets/db/postos_com_tags.json";
import logos from "@/logos";

// Types
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

// ================= Utils =================

// Distância entre coordenadas (em km)
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Abre Google Maps / Apple Maps
const openMaps = (latitude: number, longitude: number, label?: string) => {
  const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
  const latLng = `${latitude},${longitude}`;
  const query = label ? `${latLng}(${label})` : latLng;
  const url = `${scheme}${query}`;

  Linking.openURL(url).catch((err) =>
    console.error("Erro ao abrir o mapa:", err)
  );
};

// Nome da cidade capitalizado
const formatCityName = (city: string) =>
  city
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ================= Components =================

// Botão redondo reutilizável
const RoundButton: React.FC<{
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}> = ({ children, style, onPress }) => (
  <TouchableOpacity style={[styles.roundButton, style]} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

// Card de estabelecimento
const LocationCard: React.FC<{
  image: any;
  name: string;
  address: string;
  distance: string;
}> = ({ image, name, address, distance }) => (
  <View style={styles.cardContainer}>
    <Image
      source={typeof image === "number" ? image : { uri: image }}
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardSubtitle}>{address}</Text>
    </View>
    <View style={styles.distanceButton}>
      <Text style={styles.distanceText}>{distance}</Text>
    </View>
  </View>
);

// ================= Main App =================

export default function App() {
  const insets = useSafeAreaInsets();

  // States
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [isCityListVisible, setCityListVisible] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Lista de cidades únicas
  const uniqueCities = Array.from(
    new Map(locations.map((loc) => [loc.cidade.toLowerCase(), loc.cidade])).values()
  ).sort();

  // Função para carregar localização e cidade mais próxima
  const loadUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);

      let nearest: LocationItem | null = null;
      let minDistance = Number.MAX_SAFE_INTEGER;

      for (const l of locations) {
        const dist = getDistanceKm(coords.latitude, coords.longitude, l.latitude, l.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = l;
        }
      }

      if (nearest) setSelectedCity(nearest.cidade);
    } catch (err) {
      console.error("Erro ao carregar localização:", err);
    }
  };

  // Primeiro carregamento
  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        NavigationBar.setBehaviorAsync("overlay-swipe");
        NavigationBar.setBackgroundColorAsync("transparent");
        NavigationBar.setButtonStyleAsync("dark");
        NavigationBar.setVisibilityAsync("visible");
      }
      await loadUserLocation();
    })();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserLocation(); //recarrega pontos
    setRefreshing(false);
  };

  // Filtra estabelecimentos
  const filteredLocations = selectedCity
    ? locations
        .filter((loc) => loc.cidade.toLowerCase() === selectedCity.toLowerCase())
        .filter(
          (loc) =>
            loc.nome_estabelecimento.toLowerCase().includes(searchText.toLowerCase()) ||
            loc.endereco.toLowerCase().includes(searchText.toLowerCase())
        )
        .map((loc) => {
          let distKm = Number.MAX_SAFE_INTEGER;
          if (userLocation) {
            distKm = getDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              loc.latitude,
              loc.longitude
            );
          }
          return {
            ...loc,
            distance: distKm !== Number.MAX_SAFE_INTEGER ? `${distKm.toFixed(1)} Km` : "N/A",
            distanceKm: distKm,
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : [];

  // Render item da lista
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
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          {/* Botão de busca */}
          <RoundButton
            style={styles.searchButton}
            onPress={() => setSearchVisible(!isSearchVisible)}
          >
            <Image source={require("@/assets/images/search.png")} style={styles.searchIcon} />
          </RoundButton>

          {isSearchVisible && (
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          )}

          {/* Seletor de cidade */}
          <View style={{ flex: 1 }}>
            <RoundButton style={styles.locationButton} onPress={() => setCityListVisible(!isCityListVisible)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {selectedCity ? formatCityName(selectedCity) : "Carregando..."}
              </Text>
            </RoundButton>

            {isCityListVisible && (
              <View style={styles.cityListContainer}>
                <FlatList
                  data={uniqueCities}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.cityItem}
                      onPress={() => {
                        setSelectedCity(item);
                        setCityListVisible(false);
                      }}
                    >
                      <Text style={styles.cityText}>{formatCityName(item)}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Botões extra */}
          <RoundButton style={styles.filterButton} onPress={() => alert("Filtros")}>
            <Text style={styles.filterText}>Filtros</Text>
            <Image source={require("@/assets/images/filter.png")} style={styles.filterIcon} />
          </RoundButton>
        </View>

        {/* Lista de estabelecimentos */}
        <FlatList
          data={filteredLocations}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "android" ? 50 : 30,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

// ================= Styles =================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eeeeeeff" },
  header: { flexDirection: "row", alignItems: "center", margin: 16 },

  roundButton: { borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 12 },
  locationButton: { backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  statusButton: {
    backgroundColor: "#000",
    marginLeft: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  searchButton: {
    backgroundColor: "#EEEFEF",
    borderColor: "#BBBDC0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 6,
    marginRight: 6,
  },

  statusText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#EEEFEF",
    borderColor: "#BBBDC0",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 6,
  },
  filterText: { color: "#000", fontWeight: "bold", fontSize: 14, marginRight: 6 },
  filterIcon: { width: 16, height: 16 },
  searchIcon: { width: 16, height: 16 },

  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 6,
  },

  // Cards
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  cardImage: { width: 55, height: 55, marginRight: 12, borderRadius: 8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#222427" },
  distanceButton: {
    backgroundColor: "#EEEFEF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  distanceText: { color: "#000", fontWeight: "bold", fontSize: 14 },

  // Lista de cidades
  cityListContainer: {
    position: "absolute",
    top: 50,
    left: 8,
    right: 8,
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cityText: { fontSize: 16, color: "#000" },
});
