import * as Haptics from "expo-haptics";

// vibração curta, para toques e seleções
export const tap = () => {
  Haptics.selectionAsync().catch(() => {});
};

// vibração de "deu certo", para salvar e terminar livro
export const success = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
};
