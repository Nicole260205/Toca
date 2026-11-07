import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, serif } from "../constants/theme";
import { NO_GENRE } from "../utils/genres";
import { SORT_OPTIONS, SortKey } from "../utils/shelfSort";
import { tap } from "../utils/feedback";

type Props = {
  visible: boolean;
  onClose: () => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  year: number | null;
  onYear: (y: number | null) => void;
  genre: string | null;
  onGenre: (g: string | null) => void;
  years: number[];
  genres: string[];
  hasUngenred: boolean;
  onOrganize: () => void;
  onClear: () => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ShelfFilterSheet(p: Props) {
  return (
    <Modal
      visible={p.visible}
      transparent
      animationType="slide"
      onRequestClose={p.onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={p.onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtros e ordem</Text>
            <Pressable onPress={p.onClear} hitSlop={10}>
              <Text style={styles.clear}>Limpar tudo</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.label}>Ordenar por</Text>
            <View style={styles.wrap}>
              {SORT_OPTIONS.map((o) => (
                <Chip
                  key={o.key}
                  label={o.label}
                  active={p.sort === o.key}
                  onPress={() => p.onSort(o.key)}
                />
              ))}
            </View>
            {p.sort === "custom" && (
              <Pressable onPress={p.onOrganize} hitSlop={6}>
                <Text style={styles.link}>Organizar minha ordem</Text>
              </Pressable>
            )}

            <Text style={styles.label}>Ano de leitura</Text>
            {p.years.length === 0 ? (
              <Text style={styles.hint}>
                Os anos aparecem quando você terminar livros.
              </Text>
            ) : (
              <View style={styles.wrap}>
                <Chip
                  label="Todos"
                  active={p.year === null}
                  onPress={() => p.onYear(null)}
                />
                {p.years.map((y) => (
                  <Chip
                    key={y}
                    label={String(y)}
                    active={p.year === y}
                    onPress={() => p.onYear(y)}
                  />
                ))}
              </View>
            )}

            <Text style={styles.label}>Gênero</Text>
            {p.genres.length === 0 && !p.hasUngenred ? (
              <Text style={styles.hint}>Nenhum livro cadastrado ainda.</Text>
            ) : (
              <View style={styles.wrap}>
                <Chip
                  label="Todos"
                  active={p.genre === null}
                  onPress={() => p.onGenre(null)}
                />
                {p.genres.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    active={p.genre === g}
                    onPress={() => p.onGenre(g)}
                  />
                ))}
                {p.hasUngenred && (
                  <Chip
                    label="Sem gênero"
                    active={p.genre === NO_GENRE}
                    onPress={() => p.onGenre(NO_GENRE)}
                  />
                )}
              </View>
            )}
          </ScrollView>

          <Pressable style={styles.done} onPress={p.onClose}>
            <Text style={styles.doneText}>Concluir</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,58,50,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.cream,
    maxHeight: "85%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontFamily: serif, fontSize: 24, color: colors.woodDark },
  clear: { color: colors.moss, fontWeight: "600" },
  content: { paddingBottom: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 20,
    marginBottom: 8,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.moss },
  chipText: { color: colors.muted, fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  hint: { fontSize: 13, color: colors.muted },
  link: { color: colors.moss, fontWeight: "600", marginTop: 12 },
  done: {
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  doneText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
