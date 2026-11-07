import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import { Status } from "../../types";
import { success, tap } from "../../utils/feedback";
import ProgressBar from "../../components/ProgressBar";
import CelebrationModal from "../../components/CelebrationModal";
import StarRating, { formatRating } from "../../components/StarRating";
import QuotesSection from "../../components/QuotesSection";

const STATUS_OPTIONS: { key: Status; label: string }[] = [
  { key: "quero_ler", label: "Quero ler" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lido" },
];

type Mode = "pagina" | "percent";

function formatDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
}

// o que aparece no campo, conforme o modo escolhido
function toText(page: number, total: number, mode: Mode) {
  if (mode === "percent")
    return String(total > 0 ? Math.round((page / total) * 100) : 0);
  return String(page);
}

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { books, getBook, updateBook, removeBook } = useBooks();
  const book = getBook(id);

  const [mode, setMode] = useState<Mode>("pagina");
  const [pageText, setPageText] = useState(
    toText(book?.currentPage ?? 0, book?.pageCount ?? 0, "pagina"),
  );
  const [note, setNote] = useState(book?.note ?? "");
  const [celebrate, setCelebrate] = useState(false);

  // mantém o campo em dia quando a página muda (ex.: depois de editar) ou o modo troca
  useEffect(() => {
    setPageText(toText(book?.currentPage ?? 0, book?.pageCount ?? 0, mode));
  }, [book?.currentPage, book?.pageCount, mode]);

  useEffect(() => {
    setNote(book?.note ?? "");
  }, [book?.note]);

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>Livro não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const progress = book.pageCount > 0 ? book.currentPage / book.pageCount : 0;

  const year = new Date().getFullYear();
  const readThisYear = books.filter(
    (b) =>
      b.status === "lido" &&
      b.finishedAt &&
      new Date(b.finishedAt).getFullYear() === year,
  ).length;

  function changeStatus(status: Status) {
    if (status === "quero_ler") {
      updateBook(book!.id, {
        status,
        currentPage: 0,
        startedAt: undefined,
        finishedAt: undefined,
      });
    } else if (status === "lendo") {
      updateBook(book!.id, {
        status,
        startedAt: book!.startedAt ?? new Date().toISOString(),
        finishedAt: undefined,
      });
    } else {
      const wasAlreadyRead = book!.status === "lido";
      updateBook(book!.id, {
        status,
        currentPage: book!.pageCount,
        startedAt: book!.startedAt ?? new Date().toISOString(),
        finishedAt: wasAlreadyRead
          ? book!.finishedAt
          : new Date().toISOString(),
      });
      if (!wasAlreadyRead) {
        success();
        setCelebrate(true);
      }
    }
  }

  function savePage() {
    const total = book!.pageCount;
    const parsed = parseInt(pageText, 10);
    const raw = isNaN(parsed) ? 0 : parsed;

    let page: number;
    if (mode === "percent") {
      const pct = Math.max(0, Math.min(100, raw));
      page = Math.round((pct / 100) * total);
      // menos de 100% nunca conta como livro terminado
      if (pct < 100 && page >= total) page = total - 1;
    } else {
      page = Math.max(0, Math.min(total, raw));
    }

    setPageText(toText(page, total, mode));

    if (page >= total) {
      changeStatus("lido");
    } else if (page > 0 && book!.status === "quero_ler") {
      updateBook(book!.id, {
        currentPage: page,
        status: "lendo",
        startedAt: new Date().toISOString(),
      });
    } else {
      updateBook(book!.id, { currentPage: page });
    }
  }

  function confirmRemove() {
    Alert.alert("Remover livro", `Tirar "${book!.title}" da estante?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          router.back();
          removeBook(book!.id);
        },
      },
    ]);
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
          {/* topo */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.back}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
              <Text style={styles.backText}>Estante</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/edit/${book.id}`)}
              style={styles.editButton}
              hitSlop={12}
            >
              <Ionicons name="create-outline" size={20} color={colors.moss} />
              <Text style={styles.editText}>Editar</Text>
            </Pressable>
          </View>

          {/* capa + informações */}
          <View style={styles.header}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.cover} />
            ) : (
              <View
                style={[styles.cover, { backgroundColor: book.spineColor }]}
              >
                <Ionicons name="book" size={36} color="#FFF8EC" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
              <Text style={styles.meta}>{book.pageCount} páginas</Text>
              {book.genres && book.genres.length > 0 && (
                <Text style={styles.meta}>{book.genres.join(" · ")}</Text>
              )}
              {book.startedAt && (
                <Text style={styles.meta}>
                  Início: {formatDate(book.startedAt)}
                </Text>
              )}
              {book.finishedAt && (
                <Text style={styles.meta}>
                  Fim: {formatDate(book.finishedAt)}
                </Text>
              )}
            </View>
          </View>

          {/* status */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.row}>
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => {
                  tap();
                  changeStatus(s.key);
                }}
                style={[
                  styles.chip,
                  book.status === s.key && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    book.status === s.key && styles.chipTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* progresso */}
          <Text style={styles.label}>Progresso</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.meta}>
            {book.currentPage} de {book.pageCount} páginas (
            {Math.round(progress * 100)}%)
          </Text>

          {/* alternar entre página e porcentagem */}
          <View style={[styles.row, { marginTop: 14 }]}>
            <Text style={styles.smallLabel}>Informar por:</Text>
            {(["pagina", "percent"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  tap();
                  setMode(m);
                }}
                style={[styles.modeChip, mode === m && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, mode === m && styles.chipTextActive]}
                >
                  {m === "pagina" ? "Página" : "%"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 10 }]}>
            <TextInput
              value={pageText}
              onChangeText={(t) => setPageText(t.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              style={styles.input}
              placeholder={
                mode === "percent" ? "Porcentagem (0 a 100)" : "Página atual"
              }
              placeholderTextColor={colors.muted}
              onSubmitEditing={savePage}
            />
            <Pressable style={styles.button} onPress={savePage}>
              <Text style={styles.buttonText}>Atualizar</Text>
            </Pressable>
          </View>

          {/* nota e anotação (só quando lido) */}
          {book.status === "lido" && (
            <>
              <Text style={styles.label}>
                Sua nota{book.rating ? `  ·  ${formatRating(book.rating)}` : ""}
              </Text>
              <StarRating
                value={book.rating ?? 0}
                onChange={(v) =>
                  updateBook(book.id, { rating: v > 0 ? v : undefined })
                }
              />
              <Text style={styles.hint}>
                Toque ou arraste sobre as estrelas (de 0,25 em 0,25).
              </Text>
              {book.rating ? (
                <Pressable
                  onPress={() => updateBook(book.id, { rating: undefined })}
                  hitSlop={8}
                >
                  <Text style={styles.clear}>Limpar nota</Text>
                </Pressable>
              ) : null}

              <Text style={styles.label}>Anotação</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                onBlur={() => updateBook(book.id, { note })}
                multiline
                style={[styles.input, styles.noteInput]}
                placeholder="O que você achou do livro?"
                placeholderTextColor={colors.muted}
              />
            </>
          )}
          {book.status !== "quero_ler" && <QuotesSection book={book} />}
          {/* remover */}
          <Pressable style={styles.remove} onPress={confirmRemove}>
            <Ionicons name="trash-outline" size={18} color="#A33A3A" />
            <Text style={styles.removeText}>Remover da estante</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CelebrationModal
        visible={celebrate}
        title={book.title}
        readCount={readThisYear}
        onClose={() => setCelebrate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 48 },
  empty: { textAlign: "center", marginTop: 48, color: colors.muted },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { flexDirection: "row", alignItems: "center" },
  backText: { fontSize: 16, color: colors.ink },
  editButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  editText: { fontSize: 15, color: colors.moss, fontWeight: "600" },
  header: { flexDirection: "row", gap: 16, marginBottom: 8 },
  cover: {
    width: 110,
    height: 160,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  author: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 8 },
  meta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 24,
    marginBottom: 8,
  },
  smallLabel: { fontSize: 13, color: colors.muted },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8 },
  clear: { fontSize: 13, color: colors.moss, fontWeight: "600", marginTop: 8 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  modeChip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.moss },
  chipText: { color: colors.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  input: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  noteInput: { minHeight: 100, textAlignVertical: "top", flex: undefined },
  button: {
    backgroundColor: colors.moss,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  remove: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  removeText: { color: "#A33A3A", fontWeight: "600" },
});
