import { useMemo, useState } from "react";
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
import { SortKey, sortBooks } from "../../utils/shelfSort";
import { NO_GENRE } from "../../utils/genres";
import ShelfRow from "../../components/ShelfRow";
import Mascot from "../../components/Mascot";
import ShelfFilterSheet from "../../components/ShelfFilterSheet";
import { Status } from "../../types";

type StatusFilter = "todos" | Status;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lidos" },
  { key: "quero_ler", label: "Quero ler" },
];

export default function Shelf() {
  const router = useRouter();
  const { books, loading } = useBooks();
  const { width } = useWindowDimensions();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("custom");
  const [year, setYear] = useState<number | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // opções que aparecem na folha de filtros
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          books
            .filter((b) => b.status === "lido" && b.finishedAt)
            .map((b) => new Date(b.finishedAt!).getFullYear()),
        ),
      ).sort((a, b) => b - a),
    [books],
  );
  const genreList = useMemo(
    () =>
      Array.from(new Set(books.flatMap((b) => b.genres ?? []))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [books],
  );
  const hasUngenred = books.some((b) => !b.genres || b.genres.length === 0);

  if (loading) return null;

  const q = normalize(search.trim());

  const filtered = books
    .filter((b) => statusFilter === "todos" || b.status === statusFilter)
    .filter(
      (b) =>
        !year ||
        (b.finishedAt && new Date(b.finishedAt).getFullYear() === year),
    )
    .filter((b) => {
      if (!genre) return true;
      if (genre === NO_GENRE) return !b.genres || b.genres.length === 0;
      return b.genres?.includes(genre) ?? false;
    })
    .filter(
      (b) =>
        !q || normalize(b.title).includes(q) || normalize(b.author).includes(q),
    );

  const visible = sortBooks(filtered, sort);
  const rows = packRows(visible, width - 32);

  const activeCount =
    (sort !== "custom" ? 1 : 0) + (year ? 1 : 0) + (genre ? 1 : 0);
  const hasFilters = !!(year || genre || q || statusFilter !== "todos");

  function clearAll() {
    setSort("custom");
    setYear(null);
    setGenre(null);
  }

  function clearEverything() {
    clearAll();
    setSearch("");
    setStatusFilter("todos");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Minha estante</Text>

      {/* busca + botão de filtros */}
      <View style={styles.searchRow}>
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

        <Pressable
          style={styles.filterButton}
          onPress={() => setSheetOpen(true)}
        >
          <Ionicons name="options-outline" size={22} color="#fff" />
          {activeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* status */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setStatusFilter(f.key)}
            style={[styles.chip, statusFilter === f.key && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === f.key && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* filtros ativos (toque para tirar) */}
      {(year || genre) && (
        <View style={styles.activeRow}>
          {year && (
            <Pressable style={styles.activeChip} onPress={() => setYear(null)}>
              <Text style={styles.activeText}>{year}</Text>
              <Ionicons name="close" size={14} color={colors.moss} />
            </Pressable>
          )}
          {genre && (
            <Pressable style={styles.activeChip} onPress={() => setGenre(null)}>
              <Text style={styles.activeText}>
                {genre === NO_GENRE ? "Sem gênero" : genre}
              </Text>
              <Ionicons name="close" size={14} color={colors.moss} />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {rows.length === 0 ? (
          <View style={styles.emptyBox}>
            {books.length === 0 || hasFilters ? (
              <Mascot pose="dormindo" size={170} />
            ) : null}
            <Text style={styles.empty}>
              {books.length === 0
                ? "Sua toca está vazia... o coelho cochilou esperando seu primeiro livro."
                : "Nenhum livro com esses filtros."}
            </Text>
            {books.length > 0 && hasFilters && (
              <Pressable onPress={clearEverything} hitSlop={8}>
                <Text style={styles.clearLink}>Limpar filtros</Text>
              </Pressable>
            )}
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

      <ShelfFilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        sort={sort}
        onSort={setSort}
        year={year}
        onYear={setYear}
        genre={genre}
        onGenre={setGenre}
        years={years}
        genres={genreList}
        hasUngenred={hasUngenred}
        onOrganize={() => {
          setSheetOpen(false);
          router.push("/organize");
        }}
        onClear={clearAll}
      />
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

  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  filterButton: {
    width: 46,
    borderRadius: 12,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
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

  activeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.moss,
  },
  activeText: { color: colors.moss, fontSize: 13, fontWeight: "600" },

  content: { paddingTop: 16, paddingBottom: 32 },
  emptyBox: { alignItems: "center", marginTop: 40 },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 8,
    paddingHorizontal: 32,
  },
  clearLink: { color: colors.moss, fontWeight: "600", marginTop: 12 },
});
