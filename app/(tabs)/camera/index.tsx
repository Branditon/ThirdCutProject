// app/(tabs)/camera/index.tsx
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as ExpoCamera from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

const CameraComponent: any = (
  (ExpoCamera as any).Camera ??
  ((ExpoCamera as any).default && (ExpoCamera as any).default.Camera) ??
  (ExpoCamera as any).default ??
  ExpoCamera
);

type CamMode = "back" | "front";

export default function CameraScreen() {
  const cameraRef = useRef<any>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);

  const [type, setType] = useState<CamMode>("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log("ExpoCamera keys:", Object.keys(ExpoCamera));
        console.log("ExpoCamera.default (if exists):", (ExpoCamera as any).default);

        const camPerm =
          await (ExpoCamera as any).requestCameraPermissionsAsync?.() ??
          await (ExpoCamera as any).getCameraPermissionsAsync?.();
        console.log("camera perm raw:", camPerm);
        setHasCameraPermission((camPerm && camPerm.status) === "granted");

        try {
          const micPerm = await (ExpoCamera as any).requestMicrophonePermissionsAsync?.();
          console.log("microphone perm raw:", micPerm);
        } catch (e) {
          console.log("microphone perm API not available:", e);
        }

        const mediaPerm = await MediaLibrary.requestPermissionsAsync();
        console.log("media perm raw:", mediaPerm);
        setHasMediaPermission((mediaPerm && mediaPerm.status) === "granted");
      } catch (err) {
        console.warn("perm request error:", err);
        setHasCameraPermission(false);
        setHasMediaPermission(false);
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      const result =
        (await cameraRef.current.takePictureAsync?.({ quality: 0.7 })) ??
        (await cameraRef.current.takePicture?.({ quality: 0.7 }));
      const uri = result?.uri ?? (Array.isArray(result) ? result[0]?.uri : null);
      if (uri) setPhotoUri(uri);
    } catch (err) {
      console.warn("takePhoto err:", err);
      Alert.alert("Error", "No se pudo tomar la foto.");
    }
    setIsTaking(false);
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = (result as any).assets ? (result as any).assets[0].uri : (result as any).uri;
        setPhotoUri(uri);
      }
    } catch (err) {
      console.warn("pickFromGallery err:", err);
      Alert.alert("Error", "No se pudo abrir la galería.");
    }
  };

  const saveToGallery = async () => {
    if (!photoUri) return;
    try {
      if (!hasMediaPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso denegado", "No se puede guardar sin permiso.");
          return;
        }
      }
      await MediaLibrary.saveToLibraryAsync(photoUri);
      Alert.alert("Guardado", "La foto se guardó en la galería.");
    } catch (err) {
      console.warn("saveToGallery err:", err);
      Alert.alert("Error", "No se pudo guardar la foto.");
    }
  };

  if (hasCameraPermission === null)
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Solicitando permisos...</Text>
      </View>
    );

  if (hasCameraPermission === false)
    return (
      <View style={styles.center}>
        <Text style={styles.info}>No se tiene permiso de cámara.</Text>
      </View>
    );

  // Si por alguna razón no resolvimos un componente de cámara válido, evitar crash
  if (!CameraComponent || (typeof CameraComponent !== "function" && typeof CameraComponent !== "object"))
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Componente de cámara no disponible en esta versión.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <View style={styles.cameraWrap}>
          <CameraComponent ref={cameraRef} style={styles.camera} type={type as any} ratio="16:9" />

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => setType((t) => (t === "back" ? "front" : "back"))}
            >
              <Text style={styles.smallBtnText}>Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shotBtn} onPress={takePhoto}>
              <Text style={styles.shotBtnText}>📸</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBtn} onPress={pickFromGallery}>
              <Text style={styles.smallBtnText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setPhotoUri(null)}>
              <Text style={styles.actionText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={saveToGallery}>
              <Text style={styles.actionText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 12 },
  cameraWrap: { flex: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  smallBtn: { backgroundColor: "#111827aa", padding: 10, borderRadius: 8 },
  smallBtnText: { color: "white" },
  shotBtn: {
    backgroundColor: "#2563eb",
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  shotBtnText: { fontSize: 28, color: "white" },

  previewWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewImage: { width: "100%", height: "80%", borderRadius: 12 },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 12,
  },
  actionBtn: { backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  actionText: { color: "white", fontWeight: "600" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  info: { color: "white" },
});
