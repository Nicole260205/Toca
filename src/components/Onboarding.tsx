import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { colors, serif } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import Mascot from "./Mascot";

export default function Onboarding({ visible }: { visible: boolean }) {
  const { updateSettings } = useBooks();
  const [name, setName] = useState("");

  const enter = () => updateSettings({ name: name.trim(), onboarded: true });
  const skip = () => updateSettings({ name: "", onboarded: true });

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => {}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Mascot pose="acenando" size={190} />
        <Text style={styles.title}>Bem-vindo à Toca</Text>
        <Text style={styles.text}>
          Eu sou o coelho que cuida da sua estante. Como posso te chamar?
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="words"
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={enter}
        />

        <Pressable style={styles.button} onPress={enter}>
          <Text style={styles.buttonText}>Entrar na toca</Text>
        </Pressable>
        <Pressable onPress={skip} hitSlop={10}>
          <Text style={styles.skip}>Prefiro não dizer</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: {
    fontFamily: serif,
    fontSize: 34,
    color: colors.woodDark,
    marginTop: 8,
  },
  text: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    width: "100%",
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  skip: { color: colors.muted, marginTop: 16, fontSize: 14 },
});
