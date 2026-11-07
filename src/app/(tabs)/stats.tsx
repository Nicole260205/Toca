import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import Mascot from "../../components/Mascot";
import StarRating, { formatRating } from "../../components/StarRating";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const CHART_HEIGHT = 120;

export default function Stats() {
  const { books, loading } = useBooks();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  if (loading) return null;

  // livros lidos que têm data de término
  const finished = books.filter((b) => b.status === "lido" && b.finishedAt);

  // anos que têm pelo menos um livro lido (sempre inclui o ano atual)
  const years = Array.from(
    new Set([
      currentYear,
      ...finished.map((b) => new Date(b.finishedAt!).getFullYear()),
    ]),
  ).sort((a, b) => a - b);
  const minYear = years[0];

  const readInYear = finished.filter(
    (b) => new Date(b.finishedAt!).getFullYear() === year,
  );
  const pagesInYear = readInYear.reduce((sum, b) => sum + b.pageCount, 0);

  const rated = readInYear.filter((b) => b.rating);
  const avgRating = rated.length
    ? rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) / rated.length
    : 0;

  // livros por mês
  const perMonth = Array(12).fill(0) as number[];
  readInYear.forEach((b) => {
    perMonth[new Date(b.finishedAt!).getMonth()] += 1;
  });
  const maxMonth = Math.max(1, ...perMonth);

  const best = [...rated].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Estatísticas</Text>

        {/* seletor de ano */}
        <View style={styles.yearRow}>
          <Pressable
            onPress={() => setYear(year - 1)}
            disabled={year <= minYear}
            hitSlop={12}
            style={{ opacity: year <= minYear ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.year}>{year}</Text>
          <Pressable
            onPress={() => setYear(year + 1)}
            disabled={year >= currentYear}
            hitSlop={12}
            style={{ opacity: year >= currentYear ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.ink} />
          </Pressable>
        </View>

        {/* números principais */}
        <View style={styles.grid}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{readInYear.length}</Text>
            <Text style={styles.statLabel}>livros lidos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{pagesInYear}</Text>
            <Text style={styles.statLabel}>páginas lidas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {avgRating ? formatRating(Number(avgRating.toFixed(2))) : "–"}
            </Text>
            <Text style={styles.statLabel}>nota média</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>na estante</Text>
          </View>
        </View>

        {/* gráfico por mês */}
        <Text style={styles.section}>Livros por mês</Text>
        <View style={styles.chart}>
          {perMonth.map((count, i) => (
            <View key={i} style={styles.barColumn}>
              <Text style={styles.barValue}>{count > 0 ? count : ""}</Text>
              <View
                style={[
                  styles.bar,
                  {
                    height:
                      count > 0
                        ? Math.max(10, (count / maxMonth) * CHART_HEIGHT)
                        : 4,
                    backgroundColor: count > 0 ? colors.sky : colors.paper,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{MONTHS[i]}</Text>
            </View>
          ))}
        </View>

        {/* destaque do ano */}
        {best ? (
          <View style={styles.highlight}>
            <View style={{ flex: 1 }}>
              <Text style={styles.highlightLabel}>
                Melhor avaliado de {year}
              </Text>
              <Text style={styles.highlightTitle} numberOfLines={3}>
                {best.title}
              </Text>
              <View style={styles.stars}>
                <StarRating value={best.rating ?? 0} size={20} />
                <Text style={styles.ratingText}>
                  {formatRating(best.rating ?? 0)}
                </Text>
              </View>
            </View>
            <Mascot pose="estrela" size={90} />
          </View>
        ) : readInYear.length === 0 ? (
          <View style={styles.emptyBox}>
            <Mascot pose="dormindo" size={130} />
            <Text style={styles.emptyText}>
              {year === currentYear
                ? "Nenhum livro terminado ainda neste ano. O coelho está esperando!"
                : `Nenhum livro terminado em ${year}.`}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 40 },
  heading: {
    fontSize: 28,
    color: colors.ink,
    fontWeight: "700",
    paddingTop: 8,
  },

  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginVertical: 16,
  },
  year: { fontFamily: serif, fontSize: 32, color: colors.woodDark },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.paper,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  statNumber: { fontFamily: serif, fontSize: 32, color: colors.woodDark },
  statLabel: { fontSize: 13, color: colors.muted, marginTop: 2 },

  section: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 28,
    marginBottom: 12,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: CHART_HEIGHT + 40,
  },
  bar: { width: 14, borderRadius: 4 },
  barValue: { fontSize: 11, color: colors.muted, marginBottom: 4, height: 14 },
  barLabel: { fontSize: 12, color: colors.muted, marginTop: 6 },

  highlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  highlightLabel: { fontSize: 13, color: colors.moss, fontWeight: "600" },
  highlightTitle: {
    fontFamily: serif,
    fontSize: 20,
    color: colors.ink,
    marginTop: 4,
  },
  stars: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  ratingText: { fontSize: 14, color: colors.muted },

  emptyBox: { alignItems: "center", marginTop: 24 },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },
});
