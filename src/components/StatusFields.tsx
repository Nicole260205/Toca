import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../constants/theme";
import { Status } from "../types";
import { StatusForm, changeFormStatus } from "../utils/bookForm";
import { tap } from "../utils/feedback";
import DateField from "./DateField";
import ProgressBar from "./ProgressBar";
import StarRating, { formatRating } from "./StarRating";

const OPTIONS: { key: Status; label: string }[] = [
  { key: "quero_ler", label: "Quero ler" },
  { key: "lendo", label: "Lendo" },
  { key: "lido", label: "Lido" },
];

type Mode = "pagina" | "percent";

type Props = {
  form: StatusForm;
  onChange: (form: StatusForm) => void;
  pageCount: number;
};

export default function StatusFields({ form, onChange, pageCount }: Props) {
  const [mode, setMode] = useState<Mode>("pagina");
  const [text, setText] = useState(String(form.currentPage));

  // reescreve o campo ao trocar o modo (página/%) ou o status
  useEffect(() => {
    setText(
      mode === "percent"
        ? String(
            pageCount > 0
              ? Math.round((form.currentPage / pageCount) * 100)
              : 0,
          )
        : String(form.currentPage),
    );
  }, [mode, form.status]);

  const maxPage = Math.max(0, pageCount - 1);
  const progress = pageCount > 0 ? form.currentPage / pageCount : 0;

  function typePage(t: string) {
    const clean = t.replace(/[^0-9]/g, "");
    setText(clean);
    const raw = parseInt(clean, 10);
    const n = isNaN(raw) ? 0 : raw;
    const page =
      mode === "percent" ? Math.round((Math.min(100, n) / 100) * pageCount) : n;
    onChange({ ...form, currentPage: Math.min(maxPage, page) });
  }

  function setStart(iso: string) {
    const next = { ...form, startedAt: iso };
    if (form.finishedAt && new Date(iso) > new Date(form.finishedAt))
      next.finishedAt = iso;
    onChange(next);
  }

  function setFinish(iso: string) {
    const next = { ...form, finishedAt: iso };
    if (form.startedAt && new Date(iso) < new Date(form.startedAt))
      next.startedAt = iso;
    onChange(next);
  }

  return (
    <View>
      {/* status */}
      <Text style={styles.label}>Status</Text>
      <View style={styles.row}>
        {OPTIONS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => {
              tap();
              onChange(changeFormStatus(form, s.key, pageCount));
            }}
            style={[styles.chip, form.status === s.key && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                form.status === s.key && styles.chipTextActive,
              ]}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* lendo: página atual */}
      {form.status === "lendo" && (
        <>
          <Text style={styles.label}>Onde você parou</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.meta}>
            {form.currentPage} de {pageCount} páginas (
            {Math.round(progress * 100)}%)
          </Text>

          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.small}>Informar por:</Text>
            {(["pagina", "percent"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  tap();
                  setMode(m);
                }}
                style={[styles.modeChip, mode === m && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, mode === m && styles.chipTextActive]}
                >
                  {m === "pagina" ? "Página" : "%"}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={text}
            onChangeText={typePage}
            keyboardType="number-pad"
            style={[styles.input, { marginTop: 10 }]}
            placeholder={
              mode === "percent" ? "Porcentagem (0 a 100)" : "Página atual"
            }
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.hint}>
            Para marcar como terminado, escolha "Lido".
          </Text>
        </>
      )}

      {/* datas */}
      {(form.status === "lendo" || form.status === "lido") && (
        <DateField
          label="Começou em"
          value={form.startedAt}
          onChange={setStart}
        />
      )}
      {form.status === "lido" && (
        <DateField
          label="Terminou em"
          value={form.finishedAt}
          onChange={setFinish}
        />
      )}

      {/* lido: nota e anotação */}
      {form.status === "lido" && (
        <>
          <Text style={styles.label}>
            Sua nota{form.rating ? `  ·  ${formatRating(form.rating)}` : ""}
          </Text>
          <StarRating
            value={form.rating ?? 0}
            onChange={(v) =>
              onChange({ ...form, rating: v > 0 ? v : undefined })
            }
          />
          <Text style={styles.hint}>
            Toque ou arraste sobre as estrelas (de 0,25 em 0,25).
          </Text>
          {form.rating ? (
            <Pressable
              onPress={() => onChange({ ...form, rating: undefined })}
              hitSlop={8}
            >
              <Text style={styles.clear}>Limpar nota</Text>
            </Pressable>
          ) : null}

          <Text style={styles.label}>Anotação</Text>
          <TextInput
            value={form.note}
            onChangeText={(t) => onChange({ ...form, note: t })}
            multiline
            style={[styles.input, styles.noteInput]}
            placeholder="O que você achou do livro?"
            placeholderTextColor={colors.muted}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginTop: 20,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  modeChip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.moss },
  chipText: { color: colors.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  meta: { fontSize: 13, color: colors.muted, marginTop: 6 },
  small: { fontSize: 13, color: colors.muted },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8 },
  clear: { fontSize: 13, color: colors.moss, fontWeight: "600", marginTop: 8 },
  input: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 15,
  },
  noteInput: { minHeight: 90, textAlignVertical: "top" },
});
