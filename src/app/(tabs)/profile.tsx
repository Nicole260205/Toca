import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, serif } from "../../constants/theme";
import { useBooks } from "../../context/BooksContext";
import { computeAchievements } from "../../utils/achievements";
import Mascot from "../../components/Mascot";
import ProgressBar from "../../components/ProgressBar";
import YearShareModal from "../../components/YearShareModal";

export default function Profile() {
  const { books, favorites, settings, updateSettings, loading } = useBooks();
  const [editing, setEditing] = useState(false);
  const [nameText, setNameText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  if (loading) return null;

  const achievements = computeAchievements(books, favorites);
  const unlocked = achievements.filter((a) => a.unlocked).length;

  function startEdit() {
    setNameText(settings.name);
    setEditing(true);
  }

  function saveName() {
    updateSettings({ name: nameText.trim() });
    setEditing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* cabeçalho */}
        <View style={styles.header}>
          <Mascot pose="acenando" size={110} />
          <View style={{ flex: 1 }}>
            {editing ? (
              <>
                <TextInput
                  value={nameText}
                  onChangeText={setNameText}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.muted}
                  style={styles.nameInput}
                  autoCapitalize="words"
                  maxLength={24}
                  autoFocus
                  onSubmitEditing={saveName}
                />
                <Pressable onPress={saveName} hitSlop={8}>
                  <Text style={styles.link}>Salvar nome</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.name}>
                  {settings.name || "Leitor da Toca"}
                </Text>
                <Text style={styles.sub}>
                  {unlocked} de {achievements.length} conquistas
                </Text>
                <Pressable onPress={startEdit} hitSlop={8}>
                  <Text style={styles.link}>Editar nome</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* resumo do ano */}
        <Pressable
          style={styles.shareButton}
          onPress={() => setShareOpen(true)}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareText}>Compartilhar meu ano</Text>
        </Pressable>

        {/* conquistas */}
        <Text style={styles.section}>Conquistas</Text>
        <View style={styles.grid}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={[styles.ach, !a.unlocked && styles.achLocked]}
            >
              {a.unlocked ? (
                <Mascot pose={a.pose} size={56} animated={false} />
              ) : (
                <View style={styles.lock}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.muted}
                  />
                </View>
              )}
              <Text style={styles.achTitle}>{a.title}</Text>
              <Text style={styles.achDesc}>{a.description}</Text>
              {!a.unlocked && (
                <View style={styles.progressBox}>
                  <ProgressBar progress={a.current / a.target} />
                  <Text style={styles.achProgress}>
                    {Math.min(a.current, a.target).toLocaleString("pt-BR")} /{" "}
                    {a.target.toLocaleString("pt-BR")}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <YearShareModal visible={shareOpen} onClose={() => setShareOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  name: { fontFamily: serif, fontSize: 28, color: colors.woodDark },
  sub: { fontSize: 14, color: colors.muted, marginTop: 2 },
  link: { fontSize: 14, color: colors.moss, fontWeight: "600", marginTop: 8 },
  nameInput: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
  },

  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  shareText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  section: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 28,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  ach: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  achLocked: { backgroundColor: colors.paper },
  lock: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  achTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 8,
    textAlign: "center",
  },
  achDesc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    textAlign: "center",
  },
  progressBox: { alignSelf: "stretch", marginTop: 10 },
  achProgress: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
});
