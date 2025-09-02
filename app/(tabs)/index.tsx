import * as NavigationBar from 'expo-navigation-bar';
import React from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

//TODO: Permanent image links
const IMG_PROFILE = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/bw1o78ag_expires_30_days.png";
const IMG_MAP = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/idppdcln_expires_30_days.png";
const IMG_ALL_POINTS = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/M9a925XVH8/bwm3f7v7_expires_30_days.png";

export default function App() {
  const insets = useSafeAreaInsets();

  // Down Bar fix color
  React.useEffect(() => {
    NavigationBar.setVisibilityAsync('visible');
    NavigationBar.setButtonStyleAsync('dark');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Status Bar fix color */}
      <StatusBar barStyle="dark-content" backgroundColor="#EEEFEF" />

      <ScrollView style={{ flex: 1, backgroundColor: "#EEEFEF" }} contentContainerStyle={{ paddingTop: insets.top }}>
        
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

        {[
          { name: "Droga Raia - Boa Vista", address: "Droga Raia, R. Nicolau Kluppel Neto, 1580 - Contorno", distance: "1.6 Km" },
          { name: "Supermercado Atacadão", address: "Av. Visc. de Taunay, S/N - Contorno", distance: "1.8 Km" },
          { name: "Supermercado Condor", address: "Av. João Manoel dos Santos Ribas, 555 - Nova Rússia", distance: "5.7 Km" },
          { name: "Loja Casas Bahia", address: "Av. Dr. Vicente Machado, 216 - Centro", distance: "6.2 Km" },
          { name: "Kalunga - Shopping Palladium", address: "Shopping Palladium - R. Ermelino de Leão, 703 - Olarias", distance: "7.3 Km" },
        ].map((point, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => alert(`Redirecionando para ${point.address}`)}
            style={{ marginHorizontal: 13, marginBottom: 5 }}
          >
            <View style={{ flexDirection: "row", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#000" }}>
                  {point.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#222" }}>
                  {point.address}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#25884F", alignSelf: "center" }}>
                {point.distance}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add margin bottom to avoid cutting off last item */}
        <View style={{ height: insets.bottom - 20 }} />

      </ScrollView>
    </SafeAreaView>
  );
}
