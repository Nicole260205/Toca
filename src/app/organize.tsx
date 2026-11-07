import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import { tap } from "../utils/feedback";

export default function Organize() {
  const router = useRouter();
  const { books, moveBook } = useBooks();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
          <Text style={styles.backText}>Estante</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.done}>Concluir</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Organizar minha ordem</Text>
      <Text style={styles.sub}>
        Use as setas para mover os livros. Na estante, escolha "Minha ordem"
        para ver o resultado.
      </Text>

      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum livro cadastrado ainda.</Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>

            {item.coverUrl ? (
              <Image source={{ uri: item.coverUrl }} style={styles.thumb} />
            ) : (
              <View
                style={[styles.thumb, { backgroundColor: item.spineColor }]}
              />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {item.author}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                hitSlop={6}
                disabled={index === 0}
                onPress={() => {
                  tap();
                  moveBook(item.id, "top");
                }}
                style={{ opacity: index === 0 ? 0.25 : 1 }}
              >
                <Ionicons
                  name="chevron-up-circle-outline"
                  size={26}
                  color={colors.moss}
                />
              </Pressable>
              <Pressable
                hitSlop={6}
                disabled={index === 0}
                onPress={() => {
                  tap();
                  moveBook(item.id, "up");
                }}
                style={{ opacity: index === 0 ? 0.25 : 1 }}
              >
                <Ionicons name="arrow-up" size={24} color={colors.moss} />
              </Pressable>
              <Pressable
                hitSlop={6}
                disabled={index === books.length - 1}
                onPress={() => {
                  tap();
                  moveBook(item.id, "down");
                }}
                style={{ opacity: index === books.length - 1 ? 0.25 : 1 }}
              >
                <Ionicons name="arrow-down" size={24} color={colors.moss} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  back: { flexDirection: "row", alignItems: "center" },
  backText: { fontSize: 16, color: colors.ink },
  done: { fontSize: 16, color: colors.moss, fontWeight: "600" },
  title: {
    fontFamily: serif,
    fontSize: 28,
    color: colors.woodDark,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sub: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  list: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  index: { width: 24, textAlign: "center", color: colors.muted, fontSize: 13 },
  thumb: {
    width: 36,
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.paper,
  },
  bookTitle: { fontSize: 15, fontWeight: "600", color: colors.ink },
  author: { fontSize: 12, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
});
