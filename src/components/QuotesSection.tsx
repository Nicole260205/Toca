import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import { Book, Quote } from "../types";
import { success } from "../utils/feedback";

export default function QuotesSection({ book }: { book: Book }) {
  const { updateBook } = useBooks();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const quotes = book.quotes ?? [];

  function add() {
    const t = text.trim();
    if (!t)
      return Alert.alert(
        "Falta a citação",
        "Escreva o trecho que você quer guardar.",
      );
    const p = parseInt(page, 10);
    const quote: Quote = {
      id: Date.now().toString(),
      text: t,
      page: isNaN(p) ? undefined : p,
    };
    updateBook(book.id, { quotes: [...quotes, quote] });
    success();
    setText("");
    setPage("");
    setAdding(false);
  }

  function remove(id: string) {
    Alert.alert("Remover citação", "Apagar este trecho?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          updateBook(book.id, { quotes: quotes.filter((q) => q.id !== id) }),
      },
    ]);
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>
          Citações{quotes.length > 0 ? `  ·  ${quotes.length}` : ""}
        </Text>
        {!adding && (
          <Pressable
            onPress={() => setAdding(true)}
            style={styles.addButton}
            hitSlop={8}
          >
            <Ionicons name="add" size={18} color={colors.moss} />
            <Text style={styles.addText}>Nova citação</Text>
          </Pressable>
        )}
      </View>

      {quotes.length === 0 && !adding && (
        <Text style={styles.empty}>
          Guarde aqui os trechos que marcaram você.
        </Text>
      )}

      {quotes.map((q) => (
        <View key={q.id} style={styles.quote}>
          <View style={styles.bar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteText}>{q.text}</Text>
            {q.page !== undefined && (
              <Text style={styles.quotePage}>página {q.page}</Text>
            )}
          </View>
          <Pressable onPress={() => remove(q.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={18} color={colors.muted} />
          </Pressable>
        </View>
      ))}

      {adding && (
        <View style={styles.form}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Digite o trecho"
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.input, styles.textInput]}
          />
          <TextInput
            value={page}
            onChangeText={(t) => setPage(t.replace(/[^0-9]/g, ""))}
            placeholder="Página (opcional)"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={styles.input}
          />
          <View style={styles.formButtons}>
            <Pressable
              onPress={() => {
                setAdding(false);
                setText("");
                setPage("");
              }}
              hitSlop={8}
            >
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={add}>
              <Text style={styles.saveText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
  },
  label: { fontSize: 15, fontWeight: "600", color: colors.ink },
  addButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  addText: { fontSize: 14, color: colors.moss, fontWeight: "600" },
  empty: { fontSize: 13, color: colors.muted },
  quote: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  bar: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  quoteText: {
    fontFamily: serif,
    fontSize: 15,
    color: colors.ink,
    fontStyle: "italic",
    lineHeight: 22,
  },
  quotePage: { fontSize: 12, color: colors.muted, marginTop: 6 },
  form: { gap: 8, marginTop: 4 },
  input: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  textInput: { minHeight: 90, textAlignVertical: "top" },
  formButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 4,
  },
  cancel: { color: colors.muted, fontWeight: "600" },
  saveButton: {
    backgroundColor: colors.moss,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
