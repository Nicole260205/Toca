import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { colors, serif } from "../constants/theme";

const POSES = {
  lendo: require("../../assets/images/coelho.png"),
  dormindo: require("../../assets/images/coelho-dormindo.png"),
  feliz: require("../../assets/images/coelho-feliz.png"),
  procurando: require("../../assets/images/coelho-procurando.png"),
  confuso: require("../../assets/images/coelho-confuso.png"),
  estrela: require("../../assets/images/coelho-estrela.png"),
  acenando: require("../../assets/images/coelho-acenando.png"),
};

export type Pose = keyof typeof POSES;

type Props = {
  pose?: Pose;
  size?: number;
  animated?: boolean; // flutuação suave, ligada por padrão
  style?: StyleProp<ViewStyle>;
};

// "Zzz" que sobe e some, em loop (só na pose dormindo)
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

export default function Mascot({
  pose = "lendo",
  size = 160,
  animated = true,
  style,
}: Props) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, float]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={{
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -size * 0.025],
              }),
            },
          ],
        }}
      >
        <Image
          source={POSES[pose]}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
      {pose === "dormindo" && <Zzz size={size} />}
    </View>
  );
}
