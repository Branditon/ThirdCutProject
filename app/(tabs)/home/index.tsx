// app/(tabs)/home/index.tsx
import { StyleSheet, Text, View } from "react-native";
import { auth } from "../../../constants/firebaseConfig";

export default function Home() {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido{user ? `, ${user.email}` : ""} 🎉</Text>
      <Text style={styles.subtitle}>
        Aquí puedes ver el demo. Ve a la pestaña Cámara para tomar o elegir fotos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#020617", justifyContent: "center" },
  title: { color: "white", fontSize: 26, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { color: "#9ca3af", fontSize: 15, textAlign: "center" },
});
