// components/AnimatedAlert.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type AlertType = "success" | "error";

interface Props {
  visible: boolean;
  message: string;
  type?: AlertType;
  onHide?: () => void;
}

export default function AnimatedAlert({
  visible,
  message,
  type = "error",
  onHide,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      // cuando visible pasa a true, aseguramos que se renderice
      setShouldRender(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // auto-ocultar después de 3s
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShouldRender(false);
          onHide && onHide();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    } else if (!visible && shouldRender) {
      // si visible pasa a false desde el padre, hacemos fade-out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onHide && onHide();
      });
    }
  }, [visible]);

  if (!shouldRender) return null;

  const containerStyle: ViewStyle = {
    backgroundColor: type === "error" ? "#b91c1c" : "#16a34a",
  };

  return (
    <View pointerEvents="none">
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
