import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "../types";

const BOOKS_KEY = "@toca:books";
const FAV_KEY = "@toca:favorites";

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
