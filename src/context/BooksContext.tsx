import React, { createContext, useContext, useEffect, useState } from "react";
import { Book } from "../types";
import {
  loadBooks,
  saveBooks,
  loadFavorites,
  saveFavorites,
  loadSettings,
  saveSettings,
  Settings,
} from "../services/storage";

// 4 posições fixas; null = posição vazia
type Favorites = (string | null)[];
const EMPTY_FAVORITES: Favorites = [null, null, null, null];
const DEFAULT_SETTINGS: Settings = { name: "", onboarded: false };

export type MoveTo = "up" | "down" | "top";

type BooksContextType = {
  books: Book[];
  favorites: Favorites;
  settings: Settings;
  loading: boolean;
  addBook: (data: Omit<Book, "id">) => Book;
  updateBook: (id: string, changes: Partial<Book>) => void;
  removeBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  moveBook: (id: string, to: MoveTo) => void;
  setFavorite: (slot: number, id: string | null) => void;
  updateSettings: (changes: Partial<Settings>) => void;
};

const BooksContext = createContext<BooksContextType | null>(null);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Favorites>(EMPTY_FAVORITES);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadBooks(), loadFavorites(), loadSettings()]).then(
      ([savedBooks, savedFavs, savedSettings]) => {
        setBooks(savedBooks);
        setFavorites([0, 1, 2, 3].map((i) => savedFavs[i] ?? null));
        setSettings(savedSettings);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!loading) saveBooks(books);
  }, [books, loading]);

  useEffect(() => {
    if (!loading) saveFavorites(favorites);
  }, [favorites, loading]);

  useEffect(() => {
    if (!loading) saveSettings(settings);
  }, [settings, loading]);

  function addBook(data: Omit<Book, "id">) {
    const book: Book = { ...data, id: Date.now().toString() };
    setBooks((prev) => [...prev, book]);
    return book;
  }

  function updateBook(id: string, changes: Partial<Book>) {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    );
  }

  function removeBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setFavorites((prev) => prev.map((f) => (f === id ? null : f)));
  }

  function getBook(id: string) {
    return books.find((b) => b.id === id);
  }

  // muda a posição do livro na "minha ordem"
  function moveBook(id: string, to: MoveTo) {
    setBooks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      const target =
        to === "top"
          ? 0
          : to === "up"
            ? Math.max(0, i - 1)
            : Math.min(prev.length - 1, i + 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function setFavorite(slot: number, id: string | null) {
    setFavorites((prev) => {
      const next = [...prev];
      if (id) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] === id) next[i] = null;
        }
      }
      next[slot] = id;
      return next;
    });
  }

  function updateSettings(changes: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...changes }));
  }

  return (
    <BooksContext.Provider
      value={{
        books,
        favorites,
        settings,
        loading,
        addBook,
        updateBook,
        removeBook,
        getBook,
        moveBook,
        setFavorite,
        updateSettings,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks precisa estar dentro de <BooksProvider>");
  return ctx;
}
