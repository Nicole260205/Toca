import { useRef } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";
import { tap } from "../utils/feedback";

// 3.75 vira "3,75"; 4 vira "4"
export function formatRating(v: number) {
  return String(v).replace(".", ",");
}

type Props = {
  value: number; // de 0 a 5, em passos de 0.25
  onChange?: (value: number) => void; // sem isso, vira só exibição
  size?: number;
};

export default function StarRating({ value, onChange, size = 40 }: Props) {
  const last = useRef(value);
  last.current = value;

  // posição do dedo -> nota (cada estrela ocupa "size" de largura)
  function fromX(x: number) {
    if (x <= 0) return 0;
    return Math.min(5, Math.ceil((x / size) * 4) / 4);
  }

  function handle(e: GestureResponderEvent) {
    const v = fromX(e.nativeEvent.locationX);
    if (v !== last.current) {
      last.current = v;
      tap();
      onChange?.(v);
    }
  }

  return (
    <View style={{ width: size * 5, height: size }}>
      <View style={styles.row} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((i) => {
          const fraction = Math.max(0, Math.min(1, value - i));
          return (
            <View key={i} style={{ width: size, height: size }}>
              {/* estrela cheia, cortada na fração da nota */}
              <View
                style={{
                  position: "absolute",
                  width: size * fraction,
                  height: size,
                  overflow: "hidden",
                }}
              >
                <Ionicons name="star" size={size} color={colors.accent} />
              </View>
              {/* contorno por cima */}
              <Ionicons
                name="star-outline"
                size={size}
                color={colors.accent}
                style={{ position: "absolute" }}
              />
            </View>
          );
        })}
      </View>

      {/* camada transparente que recebe o toque e o arrastar */}
      {onChange && (
        <View
          style={StyleSheet.absoluteFill}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={handle}
          onResponderMove={handle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
});
