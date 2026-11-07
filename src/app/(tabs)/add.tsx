import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spinePalette } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import { searchBooks, SearchResult } from "../../services/booksApi";
import { Status } from "../../types";

const STATUS_OPTIONS: { key: Status; label: string }[] = [
  { key: "quero_ler", label: "Quero ler" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lido" },
];

const DEFAULT_PAGES = 250;

type Draft = {
  title: string;
  author: string;
  pages: number;
  pagesKnown: boolean;
  coverUrl?: string;
};

export default function Add() {
  const router = useRouter();
  const { addBook } = useBooks();

  // etapa 1: busca
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  // etapa 2: confirmação
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState<Status>("quero_ler");
  const [color, setColor] = useState(spinePalette[0]);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(false);
    try {
      setResults(await searchBooks(query));
    } catch (e) {
      console.warn(e);
      setResults([]);
      setError(true);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  function pick(r: SearchResult) {
    setDraft({
      title: r.title,
      author: r.author,
      pages: r.pageCount > 0 ? r.pageCount : DEFAULT_PAGES,
      pagesKnown: r.pageCount > 0,
      coverUrl: r.coverUrl,
    });
    setColor(spinePalette[0]);
    setStatus("quero_ler");
  }

  function startManual() {
    setDraft({
      title: query.trim(),
      author: "",
      pages: DEFAULT_PAGES,
      pagesKnown: false,
    });
    setColor(spinePalette[0]);
    setStatus("quero_ler");
  }

  function reset() {
    setDraft(null);
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(false);
  }

  function save() {
    if (!draft) return;
    if (!draft.title.trim())
      return Alert.alert("Falta o título", "Digite o título do livro.");

    const pageCount = draft.pages;
    if (isNaN(pageCount) || pageCount <= 0) {
      return Alert.alert(
        "Falta o número de páginas",
        "Ele define a espessura da lombada.",
      );
    }

    const now = new Date().toISOString();
    addBook({
      title: draft.title.trim(),
      author: draft.author.trim() || "Autor desconhecido",
      pageCount,
      coverUrl: draft.coverUrl,
      spineColor: color,
      status,
      currentPage: status === "lido" ? pageCount : 0,
      startedAt: status === "quero_ler" ? undefined : now,
      finishedAt: status === "lido" ? now : undefined,
    });

    reset();
    router.navigate("/(tabs)/shelf");
  }

  // ---------- etapa 2: confirmar ----------
  if (draft) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => setDraft(null)}
              style={styles.back}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
              <Text style={styles.backText}>Voltar à busca</Text>
            </Pressable>

            <View style={styles.confirmHeader}>
              {draft.coverUrl ? (
                <Image
                  source={{ uri: draft.coverUrl }}
                  style={styles.bigCover}
                />
              ) : (
                <View
                  style={[
                    styles.bigCover,
                    styles.noCover,
                    { backgroundColor: color },
                  ]}
                >
                  <Ionicons name="book" size={32} color="#FFF8EC" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Título</Text>
                <TextInput
                  value={draft.title}
                  onChangeText={(t) => setDraft({ ...draft, title: t })}
                  style={styles.input}
                  placeholderTextColor={colors.muted}
                />
                <Text style={styles.label}>Autor</Text>
                <TextInput
                  value={draft.author}
                  onChangeText={(t) => setDraft({ ...draft, author: t })}
                  style={styles.input}
                  placeholder="Opcional"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <Text style={styles.pagesInfo}>
              {draft.pagesKnown
                ? `${draft.pages} páginas`
                : `Páginas não informadas: vamos usar ${DEFAULT_PAGES} como estimativa. Você pode ajustar depois em Editar.`}
            </Text>

            <Text style={styles.label}>Status</Text>
            <View style={styles.row}>
              {STATUS_OPTIONS.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setStatus(s.key)}
                  style={[styles.chip, status === s.key && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      status === s.key && styles.chipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Cor da lombada</Text>
            <View style={[styles.row, { flexWrap: "wrap" }]}>
              {spinePalette.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    color === c && styles.swatchActive,
                  ]}
                />
              ))}
            </View>

            <Pressable style={styles.saveButton} onPress={save}>
              <Text style={styles.saveText}>Guardar na estante</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---------- etapa 1: buscar ----------
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Adicionar livro</Text>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          placeholder="Título ou autor"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
        />
        <Pressable style={styles.searchButton} onPress={runSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.moss} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => r.key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.result} onPress={() => pick(item)}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.noCover]}>
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color={colors.muted}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.resultAuthor} numberOfLines={1}>
                  {item.author}
                </Text>
                <Text style={styles.resultPages}>
                  {item.pageCount > 0
                    ? `${item.pageCount} páginas`
                    : "páginas não informadas"}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            searched ? (
              <Text style={styles.empty}>
                {error
                  ? "Não consegui buscar agora. Verifique a internet ou preencha à mão."
                  : "Nenhum livro encontrado."}
              </Text>
            ) : (
              <Text style={styles.empty}>
                Digite o nome de um livro e toque na lupa.
              </Text>
            )
          }
          ListFooterComponent={
            <Pressable onPress={startManual} style={styles.manual}>
              <Text style={styles.manualText}>
                Não achei, preencher manualmente
              </Text>
            </Pressable>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48 },
  heading: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchRow: { flexDirection: "row", gap: 8, padding: 16 },
  searchButton: {
    backgroundColor: colors.moss,
    width: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  result: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  thumb: {
    width: 56,
    height: 84,
    borderRadius: 4,
    backgroundColor: colors.cream,
  },
  noCover: { alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 15, fontWeight: "600", color: colors.ink },
  resultAuthor: { fontSize: 13, color: colors.muted, marginTop: 2 },
  resultPages: { fontSize: 12, color: colors.muted, marginTop: 6 },
  manual: { alignItems: "center", paddingVertical: 16 },
  manualText: { color: colors.moss, fontWeight: "600" },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { fontSize: 16, color: colors.ink },
  confirmHeader: { flexDirection: "row", gap: 16 },
  bigCover: {
    width: 100,
    height: 150,
    borderRadius: 6,
    backgroundColor: colors.paper,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 16,
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
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.moss },
  chipText: { color: colors.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
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
    marginTop: 32,
  },
  pagesInfo: { fontSize: 13, color: colors.muted, marginTop: 16 },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
