import React from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Componente de Botão Redondo
const RoundButton = ({ children, style, onPress }) => (
  <TouchableOpacity style={[styles.roundButton, style]} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

// Componente de Card de Local
const LocationCard = ({ image, name, address, distance }) => (
  <View style={styles.cardContainer}>
    <Image source={{ uri: image }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardSubtitle}>{address}</Text>
    </View>

    {/* Distância com estilo de botão, mas não clicável */}
    <View style={styles.distanceButton}>
      <Text style={styles.distanceText}>{distance}</Text>
    </View>
  </View>
);
export default function App() {
    
  return (
    <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/qvsbmwyi_expires_30_days.png" }}
            style={styles.logo}
          />
          
          <RoundButton style={styles.locationButton} onPress={() => alert('Pressed!')}>
            <Image
                source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/77xzknzn_expires_30_days.png" }}
                style={styles.locationIcon}
            />

            {/* Container com largura limitada */}
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                style={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                >
                Ponta Grossa
                </Text>
            </View>
          </RoundButton>
          <RoundButton style={styles.statusButton} onPress={() => alert('Pressed!')}>
            <Text style={styles.statusText}>Aberto</Text>
          </RoundButton>
          <RoundButton style={styles.filterButton} onPress={() => alert('Pressed!')}>
            <Text style={styles.filterText}>Filtros</Text>
            <Image
              source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/o8k806wb_expires_30_days.png" }}
              style={styles.filterIcon}
            />
          </RoundButton>
        </View>
      <ScrollView style={styles.scroll}>

        {/* Lista de Locais */}
        {[
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/l1spw51r_expires_30_days.png",
            name: "Supermercado Condor",
            address: "Av. João Manoel dos Santos Ribas, 555 - Nova Rússia",
            distance: "5.7 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/rx7b2biy_expires_30_days.png",
            name: "Supermercado Atacadão",
            address: "Av. Visc. de Taunay, S/N - Contorno",
            distance: "1.8 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/440tlkwq_expires_30_days.png",
            name: "Droga Raia - Boa Vista",
            address: "Droga Raia, R. Nicolau Kluppel Neto, 1580 - Contorno",
            distance: "1.6 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/ji7mhzo0_expires_30_days.png",
            name: "Lojas Casas Bahia",
            address: "Av. Dr. Vicente Machado, 216 - Centro",
            distance: "6.2 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/ymmzglkv_expires_30_days.png",
            name: "Kalunga - Shopping Palladium",
            address: "Shopping Palladium - R. Ermelino de Leão, 703 - Olarias",
            distance: "7.3 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/tl0yhexs_expires_30_days.png",
            name: "Multicoisas -  Shopping Palladium",
            address: "Shopping Palladium - R. Ermelino de Leão, 703 - Olarias",
            distance: "7.2 Km",
        },
        {
            image: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/cp18ysee_expires_30_days.png",
            name: "Rede Superpão",
            address: "R. Balduíno Taques, Órfãs",
            distance: "7.2 Km",
        },
        ].map((location, index) => (
        <TouchableOpacity
            key={index}
            onPress={() => alert(`Você clicou em ${location.name}`)}
            style={{ marginBottom: 10 }}
        >
            <LocationCard
            image={location.image}
            name={location.name}
            address={location.address}
            distance={location.distance}
            />
        </TouchableOpacity>
        ))}
        {/* Add margin bottom to avoid cutting off last item */}
        <View style={{ height: 30 }} />
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: 10 },
  scroll: { flex: 1, backgroundColor: "#EEEFEF", paddingTop: 10 },
  header: { flexDirection: "row", alignItems: "center", margin: 16 },
  logo: { width: 48, height: 48},
  roundButton: { borderRadius: 9999, paddingVertical: 10, paddingHorizontal: 12 },
  locationButton: { flex: 1, flexDirection: "row", backgroundColor: "#000", marginRight: 6, alignItems: "center" },
  locationIcon: { width: 16, height: 16, marginRight: 2 },
  locationText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  statusButton: { backgroundColor: "#000", marginRight: 6 },
  statusText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  filterButton: { flexDirection: "row", backgroundColor: "#EEEFEF", borderColor: "#BBBDC0", borderWidth: 1 },
  filterText: { color: "#000", fontWeight: "bold", fontSize: 14, marginRight: 11 },
  filterIcon: { width: 16, height: 16 },
  cardContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  cardImage: { width: 55, height: 55, marginRight: 12, borderRadius: 8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#222427" },
  distanceButton: { backgroundColor: "#EEEFEF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  distanceText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", paddingVertical: 7, paddingHorizontal: 51 },
  footerItem: { alignItems: "center" },
  footerIcon: { width: 24, height: 24, marginBottom: 2 },
  footerText: { fontSize: 12, color: "#222427" },
});
