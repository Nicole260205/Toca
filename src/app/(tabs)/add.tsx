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
import { searchBooks, SearchResult, Lang } from "../../services/booksApi";
import { StatusForm, emptyForm, formToBookFields } from "../../utils/bookForm";
import Mascot from "../../components/Mascot";
import StatusFields from "../../components/StatusFields";


const DEFAULT_PAGES = 250; // estimativa quando a API não informa

const LANGS: { key: Lang; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pt", label: "Português" },
  { key: "en", label: "Inglês" },
];

type Draft = {
  title: string;
  author: string;
  pages: number;
  pagesKnown: boolean;
  coverUrl?: string;
  genres: string[];
};

export default function Add() {
  const router = useRouter();
  const { addBook } = useBooks();

  // etapa 1: busca
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Lang>("todos");
  const [showTechnical, setShowTechnical] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  // etapa 2: confirmação
  const [draft, setDraft] = useState<Draft | null>(null);
  const [form, setForm] = useState<StatusForm>(emptyForm());
  const [color, setColor] = useState(spinePalette[0]);

  async function runSearch(language: Lang = lang) {
    if (!query.trim()) return;
    setLoading(true);
    setError(false);
    try {
      setResults(await searchBooks(query, language));
    } catch (e) {
      console.warn(e);
      setResults([]);
      setError(true);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  function changeLang(next: Lang) {
    setLang(next);
    if (searched) runSearch(next);
  }

  function randomColor() {
    return spinePalette[0];
  }

  function pick(r: SearchResult) {
    setDraft({
      title: r.title,
      genres: r.genres ?? [],
      author: r.author,
      pages: r.pageCount > 0 ? r.pageCount : DEFAULT_PAGES,
      pagesKnown: r.pageCount > 0,
      coverUrl: r.coverUrl,
    });
    setColor(randomColor());
    setForm(emptyForm());
  }

  function startManual() {
    setDraft({
      title: query.trim(),
      genres: [],
      author: "",
      pages: DEFAULT_PAGES,
      pagesKnown: false,
    });
    setColor(randomColor());
    setForm(emptyForm());
  }

  function reset() {
    setDraft(null);
    setForm(emptyForm());
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(false);
    setShowTechnical(false);
  }

  function save() {
    if (!draft) return;
    if (!draft.title.trim())
      return Alert.alert("Falta o título", "Digite o título do livro.");

    addBook({
      title: draft.title.trim(),
      author: draft.author.trim() || "Autor desconhecido",
      pageCount: draft.pages,
      coverUrl: draft.coverUrl,
      genres: draft.genres,
      spineColor: color,
      ...formToBookFields(form, draft.pages),
    });

    reset();
    router.navigate("/(tabs)/shelf");
  }

  // resultados visíveis, conforme o botão de técnicos
  const technicalCount = results.filter((r) => r.technical).length;
  const visible = showTechnical ? results : results.filter((r) => !r.technical);

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

            {/* status, página atual, datas, nota e anotação */}
            <StatusFields
              form={form}
              onChange={setForm}
              pageCount={draft.pages}
            />
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
          onSubmitEditing={() => runSearch()}
          returnKeyType="search"
          placeholder="Título ou autor"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
        />
        <Pressable style={styles.searchButton} onPress={() => runSearch()}>
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* idioma */}
      <View style={styles.langRow}>
        {LANGS.map((l) => (
          <Pressable
            key={l.key}
            onPress={() => changeLang(l.key)}
            style={[styles.langChip, lang === l.key && styles.langChipActive]}
          >
            <Text
              style={[styles.langText, lang === l.key && styles.langTextActive]}
            >
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* técnicos ocultos */}
      {searched && !loading && technicalCount > 0 && (
        <Pressable
          onPress={() => setShowTechnical(!showTechnical)}
          style={styles.technicalRow}
          hitSlop={6}
        >
          <Ionicons
            name={showTechnical ? "eye-outline" : "eye-off-outline"}
            size={16}
            color={colors.moss}
          />
          <Text style={styles.technicalText}>
            {showTechnical
              ? "Ocultar livros técnicos e científicos"
              : `${technicalCount} ${technicalCount === 1 ? "resultado técnico oculto" : "resultados técnicos ocultos"} · Mostrar`}
          </Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.moss} />
      ) : (
        <FlatList
          data={visible}
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
                  {[
                    item.year,
                    item.pageCount > 0
                      ? `${item.pageCount} páginas`
                      : "páginas não informadas",
                    item.genres?.slice(0, 2).join(", "),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Mascot
                pose={!searched ? "acenando" : error ? "confuso" : "procurando"}
                size={130}
              />
              <Text style={styles.empty}>
                {!searched
                  ? "Digite o nome de um livro e toque na lupa."
                  : error
                    ? "Não consegui buscar agora. Verifique a internet ou preencha à mão."
                    : technicalCount > 0
                      ? "Só encontrei livros técnicos para essa busca. Toque em Mostrar para vê-los."
                      : "Nenhum livro encontrado. Tente outro título ou preencha à mão."}
              </Text>
            </View>
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
  searchRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchButton: {
    backgroundColor: colors.moss,
    width: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  langRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  langChipActive: { backgroundColor: colors.moss },
  langText: { color: colors.muted, fontSize: 13 },
  langTextActive: { color: "#fff", fontWeight: "600" },

  technicalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  technicalText: { color: colors.moss, fontSize: 13, fontWeight: "600" },

  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyBox: { alignItems: "center", marginTop: 16, marginBottom: 8 },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 8,
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
  pagesInfo: { fontSize: 13, color: colors.muted, marginTop: 16 },
  input: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
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
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
