import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

type Props = {
  label: string;
  value?: string; // data em formato ISO
  onChange: (iso: string) => void;
};

export default function DateField({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value) : new Date();

  // pode escolher até o fim de hoje
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  function handle(e: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShow(false);
    if (e.type === "set" && selected) {
      const d = new Date(selected);
      d.setHours(12, 0, 0, 0); // meio-dia evita o dia "escorregar" por fuso horário
      onChange(d.toISOString());
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setShow(!show)}>
        <Ionicons name="calendar-outline" size={18} color={colors.moss} />
        <Text style={styles.value}>{date.toLocaleDateString("pt-BR")}</Text>
      </Pressable>

      {show && (
        <>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            maximumDate={endOfToday}
            onChange={handle}
          />
          {Platform.OS === "ios" && (
            <Pressable onPress={() => setShow(false)} hitSlop={8}>
              <Text style={styles.done}>Concluir</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  value: { fontSize: 15, color: colors.ink },
  done: {
    color: colors.moss,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },
});
