import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import ProgressBar from "../../components/ProgressBar";
import Mascot from "../../components/Mascot";
import TopFour from "../../components/TopFour";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Home() {
  const router = useRouter();
  const { books, settings, loading } = useBooks();


  if (loading) return null;

  // o livro "lendo" adicionado mais recentemente
  const current = [...books].reverse().find((b) => b.status === "lendo");

  const year = new Date().getFullYear();
  const readThisYear = books.filter(
    (b) =>
      b.status === "lido" &&
      b.finishedAt &&
      new Date(b.finishedAt).getFullYear() === year,
  ).length;
  const reading = books.filter((b) => b.status === "lendo").length;
  const wishlist = books.filter((b) => b.status === "quero_ler").length;

  const progress =
    current && current.pageCount > 0
      ? current.currentPage / current.pageCount
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* cabeçalho com o coelho */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {greeting()}
              {settings.name ? `, ${settings.name}` : ""}
            </Text>
            <Text style={styles.brand}>Toca</Text>
            <Text style={styles.tagline}>Seu cantinho de leitura</Text>
          </View>
          {/* MUDANÇA 1: o coelho lê quando há um livro em andamento e dorme quando não há */}
          <Mascot
            pose={current ? "lendo" : "dormindo"}
            size={170}
            style={styles.mascot}
          />
        </View>

        {/* continuar lendo */}
        {current ? (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/book/${current.id}`)}
          >
            {current.coverUrl ? (
              <Image source={{ uri: current.coverUrl }} style={styles.cover} />
            ) : (
              <View
                style={[
                  styles.cover,
                  styles.noCover,
                  { backgroundColor: current.spineColor },
                ]}
              >
                <Ionicons name="book" size={28} color="#FFF8EC" />
              </View>
            )}

            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>Continuar lendo</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {current.title}
              </Text>
              <Text style={styles.cardAuthor} numberOfLines={1}>
                {current.author}
              </Text>

              <View style={{ marginTop: 12 }}>
                <ProgressBar progress={progress} />
                <Text style={styles.cardMeta}>
                  {current.currentPage} de {current.pageCount} páginas (
                  {Math.round(progress * 100)}%)
                </Text>
              </View>
            </View>

            <View style={styles.playButton}>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyTitle}>Nada em leitura agora</Text>
            <Text style={styles.emptyText}>
              Que tal escolher um livro para o coelho te fazer companhia?
            </Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.navigate("/(tabs)/add")}
            >
              <Text style={styles.addButtonText}>Adicionar um livro</Text>
            </Pressable>
          </View>
        )}

        {/* resumo */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{readThisYear}</Text>
            <Text style={styles.statLabel}>lidos em {year}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{reading}</Text>
            <Text style={styles.statLabel}>lendo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{wishlist}</Text>
            <Text style={styles.statLabel}>quero ler</Text>
          </View>
        </View>

        {/* MUDANÇA 2: top 4 favoritos */}
        <TopFour />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 40 },

  header: { height: 200, paddingHorizontal: 20, justifyContent: "center" },
  headerText: { maxWidth: "60%" },
  greeting: { fontSize: 16, color: colors.muted },
  brand: {
    fontFamily: serif,
    fontSize: 64,
    color: colors.woodDark,
    lineHeight: 72,
  },
  tagline: { fontSize: 14, color: colors.muted },
  mascot: { position: "absolute", right: 8, bottom: 0 },

  card: {
    flexDirection: "row",
    gap: 14,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cover: {
    width: 84,
    height: 126,
    borderRadius: 6,
    backgroundColor: colors.paper,
  },
  noCover: { alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 13, color: colors.moss, fontWeight: "600" },
  cardTitle: {
    fontFamily: serif,
    fontSize: 20,
    color: colors.ink,
    marginTop: 4,
  },
  cardAuthor: { fontSize: 13, color: colors.muted, marginTop: 2 },
  cardMeta: { fontSize: 12, color: colors.muted, marginTop: 6 },
  playButton: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTitle: { fontFamily: serif, fontSize: 20, color: colors.ink },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 12,
  },
  addButton: {
    backgroundColor: colors.moss,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  statNumber: { fontFamily: serif, fontSize: 28, color: colors.woodDark },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
