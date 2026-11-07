import { View, StyleSheet } from "react-native";
import { Book } from "../types";
import { colors } from "../constants/theme";
import Spine from "./Spine";

type Props = { books: Book[]; onPressBook: (book: Book) => void };

export default function ShelfRow({ books, onPressBook }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.books}>
        {books.map((b) => (
          <Spine key={b.id} book={b} onPress={() => onPressBook(b)} />
        ))}
      </View>
      <View style={styles.board} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  books: {
    height: 162,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    paddingHorizontal: 16,
  },
  board: {
    height: 14,
    backgroundColor: colors.boardEdge,
    borderBottomWidth: 4,
    borderBottomColor: colors.woodDark,
    borderRadius: 2,
  },
});
