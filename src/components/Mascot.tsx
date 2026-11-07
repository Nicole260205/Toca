import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, serif } from "../constants/theme";

const POSES = {
  lendo: require("../../assets/images/coelho.png"),
  dormindo: require("../../assets/images/coelho-dormindo.png"),
};

type Props = {
  pose?: keyof typeof POSES;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// "Zzz" que sobe e some, em loop
function Zzz({ size }: { size: number }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top: size * 0.1,
        right: size * 0.12,
        fontFamily: serif,
        fontSize: size * 0.16,
        color: colors.muted,
        opacity: t.interpolate({
          inputRange: [0, 0.3, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        }),
        transform: [
          {
            translateY: t.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -size * 0.14],
            }),
          },
        ],
      }}
    >
      Z z
    </Animated.Text>
  );
}

export default function Mascot({ pose = "lendo", size = 160, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={POSES[pose]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {pose === "dormindo" && <Zzz size={size} />}
    </View>
  );
}
