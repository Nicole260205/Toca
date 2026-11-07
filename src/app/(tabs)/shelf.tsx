import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import { packRows } from "../../utils/spine";
import { normalize } from "../../utils/text";
import ShelfRow from "../../components/ShelfRow";
import Mascot from "../../components/Mascot";
import { Status } from "../../types";

type Filter = "todos" | Status;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lidos" },
  { key: "quero_ler", label: "Quero ler" },
];

export default function Shelf() {
  const router = useRouter();
  const { books, loading } = useBooks();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");

  if (loading) return null;

  const q = normalize(search.trim());
  const visible = books
    .filter((b) => filter === "todos" || b.status === filter)
    .filter(
      (b) =>
        !q || normalize(b.title).includes(q) || normalize(b.author).includes(q),
    );

  const rows = packRows(visible, width - 32);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Minha estante</Text>

      {/* busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título ou autor"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                filter === f.key && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {rows.length === 0 ? (
          <View style={styles.emptyBox}>
            {books.length === 0 && <Mascot pose="dormindo" size={170} />}
            <Text style={styles.empty}>
              {books.length === 0
                ? "Sua toca está vazia... o coelho cochilou esperando seu primeiro livro."
                : q
                  ? `Nenhum livro encontrado para "${search.trim()}".`
                  : "Nenhum livro nesta categoria."}
            </Text>
          </View>
        ) : (
          rows.map((row, i) => (
            <ShelfRow
              key={i}
              books={row}
              onPressBook={(b) => router.push(`/book/${b.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  heading: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.moss },
  chipText: { color: colors.muted, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  content: { paddingTop: 12, paddingBottom: 32 },
  emptyBox: { alignItems: "center", marginTop: 40 },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
