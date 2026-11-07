import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../constants/theme";
import { useBooks } from "../context/BooksContext";
import { Book } from "../types";
import { textColorFor } from "../utils/spine";
import { tap } from "../utils/feedback";

// capa do livro, ou um bloco colorido com o título quando não há capa
function Cover({ book }: { book: Book }) {
  if (book.coverUrl) {
    return (
      <Image
        source={{ uri: book.coverUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.noCover,
        { backgroundColor: book.spineColor },
      ]}
    >
      <Text
        numberOfLines={5}
        style={[styles.noCoverText, { color: textColorFor(book.spineColor) }]}
      >
        {book.title}
      </Text>
    </View>
  );
}

export default function TopFour() {
  const router = useRouter();
  const { books, favorites, setFavorite } = useBooks();
  const [editing, setEditing] = useState(false);
  const [slot, setSlot] = useState<number | null>(null); // posição sendo escolhida

  const findBook = (id: string | null) =>
    id ? books.find((b) => b.id === id) : undefined;

  // candidatos: livros lidos que ainda não estão no top 4, os mais recentes primeiro
  const candidates = books
    .filter((b) => b.status === "lido" && !favorites.includes(b.id))
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  const currentInSlot = slot !== null ? findBook(favorites[slot]) : undefined;

  function pressSlot(i: number, book?: Book) {
    tap();
    if (book && !editing) {
      router.push(`/book/${book.id}`);
    } else {
      setSlot(i);
    }
  }

  function choose(book: Book) {
    if (slot === null) return;
    setFavorite(slot, book.id);
    setSlot(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus 4 favoritos</Text>
        <Pressable onPress={() => setEditing(!editing)} hitSlop={10}>
          <Text style={styles.editText}>{editing ? "Concluir" : "Editar"}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        {favorites.map((id, i) => {
          const book = findBook(id);
          return (
            <Pressable
              key={i}
              onPress={() => pressSlot(i, book)}
              style={[styles.slot, !book && styles.slotEmpty]}
            >
              {book ? (
                <>
                  <Cover book={book} />
                  {editing && (
                    <View style={styles.editBadge}>
                      <Ionicons name="swap-horizontal" size={16} color="#fff" />
                    </View>
                  )}
                </>
              ) : (
                <Ionicons name="add" size={28} color={colors.muted} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* escolher o livro de uma posição */}
      <Modal
        visible={slot !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSlot(null)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSlot(null)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Favorito nº {(slot ?? 0) + 1}</Text>

            {currentInSlot && (
              <Pressable
                style={styles.removeButton}
                onPress={() => {
                  if (slot !== null) setFavorite(slot, null);
                  setSlot(null);
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#A33A3A"
                />
                <Text style={styles.removeText}>
                  Tirar &quot;{currentInSlot.title}&quot; daqui
                </Text>
              </Pressable>
            )}

            <FlatList
              data={candidates}
              keyExtractor={(b) => b.id}
              style={{ flexGrow: 0 }}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  Nenhum livro disponível. Marque um livro como Lido para poder
                  escolhê-lo aqui.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable style={styles.item} onPress={() => choose(item)}>
                  <View style={styles.itemCover}>
                    <Cover book={item} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                  </View>
                </Pressable>
              )}
            />

            <Pressable style={styles.closeButton} onPress={() => setSlot(null)}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontFamily: serif, fontSize: 20, color: colors.woodDark },
  editText: { fontSize: 14, color: colors.moss, fontWeight: "600" },

  row: { flexDirection: "row", gap: 10 },
  slot: {
    flex: 1,
    aspectRatio: 0.68,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  slotEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.wood,
  },
  noCover: { alignItems: "center", justifyContent: "center", padding: 6 },
  noCoverText: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  editBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(58,33,25,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "75%",
  },
  sheetTitle: {
    fontFamily: serif,
    fontSize: 22,
    color: colors.woodDark,
    marginBottom: 12,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  removeText: { color: "#A33A3A", fontWeight: "600", flexShrink: 1 },
  empty: { color: colors.muted, textAlign: "center", paddingVertical: 24 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  itemCover: {
    width: 44,
    height: 64,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  itemTitle: { fontSize: 15, fontWeight: "600", color: colors.ink },
  itemAuthor: { fontSize: 13, color: colors.muted, marginTop: 2 },
  closeButton: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  closeText: { color: colors.moss, fontWeight: "600" },
});
