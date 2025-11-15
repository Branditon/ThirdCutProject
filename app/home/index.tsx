// app/home/index.tsx
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../constants/firebaseConfig";

export default function Home() {
    const router = useRouter();

    const logout = async () => {
        await signOut(auth);
        router.replace("/auth/login");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido 🎉</Text>

            <TouchableOpacity style={styles.btn} onPress={logout}>
                <Text style={styles.btnText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" },
    title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
    btn: { backgroundColor: "#ef4444", padding: 14, borderRadius: 8 },
    btnText: { color: "white", fontWeight: "bold" },
});
