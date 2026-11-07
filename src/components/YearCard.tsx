import { forwardRef, type ComponentRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../constants/theme";
import { Book } from "../types";
import { textColorFor } from "../utils/spine";
import { formatRating } from "./StarRating";
import Mascot from "./Mascot";

type Props = {
  year: number;
  name: string;
  books: Book[];
  favorites: (string | null)[];
};

function MiniCover({ book }: { book: Book }) {
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
        numberOfLines={4}
        style={[styles.noCoverText, { color: textColorFor(book.spineColor) }]}
      >
        {book.title}
      </Text>
    </View>
  );
}

const YearCard = forwardRef<ComponentRef<typeof View>, Props>(function YearCard(
  { year, name, books, favorites },
  ref,
) {
  const readInYear = books.filter(
    (b) =>
      b.status === "lido" &&
      b.finishedAt &&
      new Date(b.finishedAt).getFullYear() === year,
  );
  const pages = readInYear.reduce((sum, b) => sum + b.pageCount, 0);
  const best = readInYear
    .filter((b) => b.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const tops = favorites
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean) as Book[];

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.brand}>Toca</Text>
        <Text style={styles.year}>{year}</Text>
      </View>
      <Text style={styles.subtitle}>
        {name ? `O ano de ${name} em livros` : "Meu ano em livros"}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{readInYear.length}</Text>
          <Text style={styles.statLabel}>
            {readInYear.length === 1 ? "livro lido" : "livros lidos"}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{pages.toLocaleString("pt-BR")}</Text>
          <Text style={styles.statLabel}>páginas</Text>
        </View>
      </View>

      {tops.length > 0 && (
        <>
          <Text style={styles.section}>Meus favoritos</Text>
          <View style={styles.covers}>
            {tops.map((b) => (
              <View key={b.id} style={styles.cover}>
                <MiniCover book={b} />
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Mascot
          pose={readInYear.length > 0 ? "feliz" : "lendo"}
          size={84}
          animated={false}
        />
        {best ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.bestLabel}>Melhor avaliado</Text>
            <Text style={styles.bestTitle} numberOfLines={2}>
              {best.title}
            </Text>
            <View style={styles.bestRating}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.bestRatingText}>
                {formatRating(best.rating ?? 0)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.bestLabel, { flex: 1 }]}>Seguimos lendo!</Text>
        )}
      </View>
    </View>
  );
});

export default YearCard;

const styles = StyleSheet.create({
  card: { width: 320, backgroundColor: colors.cream, padding: 22 },
  top: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  brand: { fontFamily: serif, fontSize: 34, color: colors.woodDark },
  year: { fontFamily: serif, fontSize: 26, color: colors.accent },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statNumber: { fontFamily: serif, fontSize: 30, color: colors.woodDark },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },

  section: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 18,
    marginBottom: 8,
  },
  covers: { flexDirection: "row", gap: 8 },
  cover: {
    flex: 1,
    aspectRatio: 0.68,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  noCover: { alignItems: "center", justifyContent: "center", padding: 4 },
  noCoverText: { fontSize: 9, fontWeight: "600", textAlign: "center" },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  bestLabel: { fontSize: 12, color: colors.moss, fontWeight: "600" },
  bestTitle: {
    fontFamily: serif,
    fontSize: 17,
    color: colors.ink,
    marginTop: 2,
  },
  bestRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  bestRatingText: { fontSize: 13, color: colors.muted },
});
