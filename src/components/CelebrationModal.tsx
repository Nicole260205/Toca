import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, serif } from "../constants/theme";
import Mascot from "./Mascot";

const PHRASES = [
  "Mais um para a toca!",
  "Fim de capítulo... e de livro!",
  "O coelho aprovou essa leitura.",
  "Lombada nova na estante!",
];

type Props = {
  visible: boolean;
  title: string;
  readCount: number; // livros lidos no ano
  onClose: () => void;
};

export default function CelebrationModal({
  visible,
  title,
  readCount,
  onClose,
}: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    if (visible) {
      setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale]);

  const year = new Date().getFullYear();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Mascot size={150} />
          <Text style={styles.phrase}>{phrase}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.count}>
            Você já terminou {readCount} {readCount === 1 ? "livro" : "livros"}{" "}
            em {year}.
          </Text>
          <Text style={styles.hint}>Que tal dar uma nota para ele?</Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continuar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(59,42,32,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: colors.cream,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  phrase: {
    fontFamily: serif,
    fontSize: 26,
    color: colors.woodDark,
    textAlign: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  count: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
  hint: { fontSize: 13, color: colors.moss, marginTop: 14 },
  button: {
    backgroundColor: colors.moss,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
