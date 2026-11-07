import { View, StyleSheet } from "react-native";
import { colors } from "../constants/theme";

type Props = { progress: number }; // de 0 a 1

export default function ProgressBar({ progress }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.sky },
});
