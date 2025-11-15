// app/auth/register.tsx
import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import AnimatedAlert from "../../components/animatedAlert";
import { auth } from "../../constants/firebaseConfig";

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "El correo no tiene un formato válido.";
    case "auth/email-already-in-use":
      return "Este correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña es muy débil (mínimo 6 caracteres).";
    default:
      return "No se pudo crear la cuenta, inténtalo otra vez.";
  }
}

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  const showError = (code: string) => {
    setAlertType("error");
    setAlertMsg(getFirebaseErrorMessage(code));
    setAlertVisible(true);
  };

  const showSuccess = (msg: string) => {
    setAlertType("success");
    setAlertMsg(msg);
    setAlertVisible(true);
  };

  const registerUser = async () => {
    if (!email || !password) {
      showError("auth/empty-fields");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      showSuccess("Cuenta creada correctamente. Ahora inicia sesión.");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 800);
    } catch (e: any) {
      showError(e.code || "auth/unknown");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#020617" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.duration(500).springify()}
          style={styles.card}
        >
          <Text style={styles.title}>Crear Cuenta ✨</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña (mín. 6 caracteres)"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={registerUser}>
            <Text style={styles.btnText}>Registrarme</Text>
          </TouchableOpacity>

          <Text style={styles.smallText}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" style={styles.link}>
              Inicia sesión
            </Link>
          </Text>
        </Animated.View>

        <AnimatedAlert
          visible={alertVisible}
          message={alertMsg}
          type={alertType}
          onHide={() => setAlertVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "white",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  smallText: {
    color: "#94a3b8",
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
  },
  link: {
    color: "#38bdf8",
    fontWeight: "600",
  },
});
