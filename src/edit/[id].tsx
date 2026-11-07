import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spine from "../components/Spine";
import { colors, spinePalette } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import { success, tap } from "../utils/feedback";
import { spineHeight } from "../utils/spine";

export default function EditBook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getBook, updateBook } = useBooks();
  const book = getBook(id);

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [pages, setPages] = useState(String(book?.pageCount ?? ""));
  const [color, setColor] = useState(book?.spineColor ?? spinePalette[0]);

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>Livro não encontrado.</Text>
      </SafeAreaView>
    );
  }

  // se a cor atual não está na paleta (ex.: cadastro antigo), ela entra na lista
  const colorOptions = spinePalette.includes(book.spineColor)
    ? spinePalette
    : [book.spineColor, ...spinePalette];

  const parsedPages = parseInt(pages, 10);
  const previewPages =
    !isNaN(parsedPages) && parsedPages > 0 ? parsedPages : book.pageCount;

  function save() {
    if (!title.trim())
      return Alert.alert("Falta o título", "Digite o título do livro.");
    if (isNaN(parsedPages) || parsedPages <= 0) {
      return Alert.alert(
        "Páginas inválidas",
        "Digite um número de páginas maior que zero.",
      );
    }

    updateBook(book!.id, {
      title: title.trim(),
      author: author.trim() || "Autor desconhecido",
      pageCount: parsedPages,
      spineColor: color,
      // livro lido acompanha o novo total; os demais não passam do total
      currentPage:
        book!.status === "lido"
          ? parsedPages
          : Math.min(book!.currentPage, parsedPages),
    });
    success();
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.back}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
            <Text style={styles.backText}>Cancelar</Text>
          </Pressable>

          <Text style={styles.heading}>Editar livro</Text>

          {/* prévia da lombada com o que está sendo digitado */}
          <View style={styles.preview}>
            <View
              style={{
                height: spineHeight(book.id),
                justifyContent: "flex-end",
              }}
            >
              <Spine
                book={{
                  ...book,
                  title: title || "Título",
                  pageCount: previewPages,
                  spineColor: color,
                }}
              />
            </View>
            <View style={styles.board} />
          </View>

          <Text style={styles.label}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Autor</Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Número de páginas</Text>
          <TextInput
            value={pages}
            onChangeText={(t) => setPages(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Cor da lombada</Text>
          <View style={styles.swatches}>
            {colorOptions.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  tap();
                  setColor(c);
                }}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchActive,
                ]}
              />
            ))}
          </View>

          <Pressable style={styles.saveButton} onPress={save}>
            <Text style={styles.saveText}>Salvar alterações</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48 },
  empty: { textAlign: "center", marginTop: 48, color: colors.muted },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backText: { fontSize: 16, color: colors.ink },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 16,
  },
  preview: { alignItems: "center", marginBottom: 8 },
  board: {
    height: 14,
    alignSelf: "stretch",
    backgroundColor: colors.wood,
    borderBottomWidth: 4,
    borderBottomColor: colors.woodDark,
    borderRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchActive: { borderColor: colors.ink },
  saveButton: {
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 36,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
