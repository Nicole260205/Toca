import * as Sharing from "expo-sharing";
import { useRef, type ComponentRef } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { colors } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import YearCard from "./YearCard";

type Props = { visible: boolean; onClose: () => void };

export default function YearShareModal({ visible, onClose }: Props) {
  const { books, favorites, settings } = useBooks();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const year = new Date().getFullYear();

  async function share() {
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Compartilhar meu ano",
        });
      } else {
        Alert.alert(
          "Compartilhar indisponível",
          "Este aparelho não permite compartilhar arquivos.",
        );
      }
    } catch (e) {
      console.warn(e);
      Alert.alert(
        "Não consegui gerar a imagem",
        "Espere as capas carregarem e tente de novo.",
      );
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <View ref={cardRef} style={styles.preview}>
              <YearCard
                year={year}
                name={settings.name}
                books={books}
                favorites={favorites}
              />
            </View>

            <Pressable style={styles.button} onPress={share}>
              <Text style={styles.buttonText}>Compartilhar</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,58,50,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: { alignItems: "center", padding: 20, paddingBottom: 32, gap: 16 },
  preview: { borderRadius: 16, overflow: "hidden" },
  button: {
    alignSelf: "stretch",
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  close: { color: colors.muted, fontWeight: "600" },
});
