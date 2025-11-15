// app/(tabs)/logout/index.tsx
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../../constants/firebaseConfig";

export default function LogoutScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, cerrar",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            // opcional: limpiar credenciales guardadas si usas AsyncStorage
            // await AsyncStorage.removeItem(CREDS_KEY);
          } catch {}
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cerrar sesión</Text>
      <Text style={styles.subtitle}>Toca el botón para salir de tu cuenta.</Text>

      <TouchableOpacity style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#9ca3af", marginBottom: 20, textAlign: "center" },
  btn: { backgroundColor: "#ef4444", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  btnText: { color: "white", fontWeight: "700" },
});
