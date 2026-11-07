import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../types";

const BOOKS_KEY = "@toca:books";
const FAV_KEY = "@toca:favorites";
const SETTINGS_KEY = "@toca:settings";

export type Settings = { name: string; onboarded: boolean };

export async function loadBooks(): Promise<Book[]> {
  try {
    const json = await AsyncStorage.getItem(BOOKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn("Erro ao carregar livros", e);
    return [];
  }
}

export async function saveBooks(books: Book[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (e) {
    console.warn("Erro ao salvar livros", e);
  }
}

export async function loadFavorites(): Promise<(string | null)[]> {
  try {
    const json = await AsyncStorage.getItem(FAV_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn("Erro ao carregar favoritos", e);
    return [];
  }
}

export async function saveFavorites(
  favorites: (string | null)[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn("Erro ao salvar favoritos", e);
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json
      ? { name: "", onboarded: false, ...JSON.parse(json) }
      : { name: "", onboarded: false };
  } catch (e) {
    console.warn("Erro ao carregar ajustes", e);
    return { name: "", onboarded: false };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Erro ao salvar ajustes", e);
  }
}
