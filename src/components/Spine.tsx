import { useState } from "react";
import { Image, Pressable, View, Text, StyleSheet } from "react-native";
import { Book } from "../types";
import { colors } from "../constants/theme";
import { spineWidth, spineHeight, textColorFor } from "../utils/spine";
import { tap } from "../utils/feedback";

type Props = { book: Book; onPress?: () => void };

const COVER_RATIO = 0.68; // largura / altura de uma capa típica

export default function Spine({ book, onPress }: Props) {
  const width = spineWidth(book.pageCount);
  const height = spineHeight(book.id);
  const [coverFailed, setCoverFailed] = useState(false);

  const useCover = !!book.coverUrl && !coverFailed;
  const textColor = textColorFor(book.spineColor);

  // a capa é desenhada na altura da lombada e deslocada para a esquerda,
  // de modo que só uma faixa vertical dela fica visível
  const coverWidth = height * COVER_RATIO;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={tap}
      style={({ pressed }) => [
        styles.shadow,
        { width, height, transform: [{ translateY: pressed ? -8 : 0 }] },
      ]}
    >
      <View
        style={[
          styles.clip,
          { backgroundColor: useCover ? colors.paper : book.spineColor },
        ]}
      >
        {useCover ? (
          <>
            <Image
              source={{ uri: book.coverUrl }}
              onError={() => setCoverFailed(true)}
              resizeMode="cover"
              style={{
                position: "absolute",
                top: 0,
                left: -coverWidth * 0.15,
                width: coverWidth,
                height,
              }}
            />
            {/* sulco e brilho da dobra, e sombra na borda direita */}
            <View style={styles.groove} />
            <View style={styles.highlight} />
            <View style={styles.edge} />
          </>
        ) : (
          <>
            <View
              style={[styles.band, { top: 8, backgroundColor: textColor }]}
            />
            <View
              style={[styles.band, { bottom: 8, backgroundColor: textColor }]}
            />

            {/* título na vertical */}
            <View
              style={{
                position: "absolute",
                width: height,
                height: width,
                left: (width - height) / 2,
                top: (height - width) / 2,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ rotate: "90deg" }],
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.title,
                  { color: textColor, maxWidth: height - 40 },
                ]}
              >
                {book.title}
              </Text>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // a sombra fica fora, porque overflow: 'hidden' apaga sombras no iOS
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 1, height: 0 },
    elevation: 2,
  },
  clip: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  groove: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 4,
    width: 2,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  highlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 6,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  edge: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  band: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 2,
    opacity: 0.45,
    borderRadius: 1,
  },
  title: { fontSize: 12, fontWeight: "600" },
});
