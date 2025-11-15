// app/auth/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AnimatedAlert from "../../components/animatedAlert";
import { auth } from "../../constants/firebaseConfig";

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "El correo no tiene un formato válido.";
    case "auth/user-not-found":
      return "No existe una cuenta con este correo.";
    case "auth/wrong-password":
      return "Contraseña incorrecta.";
    default:
      return "No se pudo iniciar sesión, revisa tus datos.";
  }
}

// Clave donde vamos a guardar las credenciales en AsyncStorage
const CREDS_KEY = "@auth_credentials";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  const [canUseBiometric, setCanUseBiometric] = useState(false);

  const showAlert = (msg: string, type: "success" | "error" = "error") => {
    setAlertType(type);
    setAlertMsg(msg);
    setAlertVisible(true);
  };

  // Ver si podemos mostrar el botón de Face ID / huella
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const savedCreds = await AsyncStorage.getItem(CREDS_KEY);

        if (hasHardware && isEnrolled && savedCreds) {
          setCanUseBiometric(true);
        } else {
          setCanUseBiometric(false);
        }
      } catch {
        setCanUseBiometric(false);
      }
    };

    checkBiometric();
  }, []);

  // Login normal con correo + contraseña
  const loginUser = async () => {
    if (!email || !password) {
      showAlert("Completa correo y contraseña.", "error");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // Guardamos credenciales para futuros logins con Face ID / huella
      await AsyncStorage.setItem(
        CREDS_KEY,
        JSON.stringify({ email: email.trim(), password })
      );

      showAlert("Inicio de sesión exitoso ✅", "success");
      setTimeout(() => {
        router.replace("/home");
      }, 500);
    } catch (e: any) {
      showAlert(getFirebaseErrorMessage(e.code || "auth/unknown"), "error");
    }
  };

  // Login usando Face ID / huella + credenciales guardadas
  const loginWithBiometric = async () => {
    try {
      const saved = await AsyncStorage.getItem(CREDS_KEY);

      if (!saved) {
        showAlert(
          "No hay credenciales guardadas. Inicia sesión una vez con correo y contraseña.",
          "error"
        );
        return;
      }

      const creds = JSON.parse(saved) as { email: string; password: string };

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        showAlert(
          "Face ID / huella no está disponible o no está configurado en este dispositivo.",
          "error"
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Iniciar sesión con biometría",
        fallbackLabel: "Usar correo y contraseña",
      });

      if (!result.success) {
        showAlert("No se pudo verificar tu identidad.", "error");
        return;
      }

      await signInWithEmailAndPassword(auth, creds.email, creds.password);

      showAlert("Bienvenido de nuevo 👌", "success");
      setTimeout(() => {
        router.replace("/home");
      }, 500);
    } catch (e) {
      showAlert("Ocurrió un error al usar la biometría.", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#020617" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión 🔐</Text>

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
            placeholder="Contraseña"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={loginUser}>
            <Text style={styles.btnText}>Entrar</Text>
          </TouchableOpacity>

          {canUseBiometric && (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={loginWithBiometric}
            >
              <Text style={styles.btnText}>
                Iniciar sesión con Face ID / huella
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.smallText}>
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" style={styles.link}>
              Regístrate
            </Link>
          </Text>
        </View>

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
  btnPrimary: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  btnSecondary: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
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
