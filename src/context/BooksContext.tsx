import React, { createContext, useContext, useEffect, useState } from "react";
import { Book } from "../types";
import {
  loadBooks,
  loadFavorites,
  saveBooks,
  saveFavorites,
} from "../services/storage";

type BooksContextType = {
  books: Book[];
  loading: boolean;
  addBook: (data: Omit<Book, "id">) => Book;
  updateBook: (id: string, changes: Partial<Book>) => void;
  removeBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  favorites: (string | null)[];
  setFavorite: (slot: number, id: string | null) => void;
};

const BooksContext = createContext<BooksContextType | null>(null);

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // Carrega do celular quando o app abre
  useEffect(() => {
    Promise.all([loadBooks(), loadFavorites()]).then(([saved, savedFavorites]) => {
      setBooks(saved);
      setFavorites(
        Array.from({ length: 4 }, (_, index) => savedFavorites[index] ?? null),
      );
      setLoading(false);
    });
  }, []);

  // Salva sempre que a lista muda (só depois do carregamento inicial)
  useEffect(() => {
    if (!loading) saveBooks(books);
  }, [books, loading]);

  useEffect(() => {
    if (!loading) saveFavorites(favorites);
  }, [favorites, loading]);

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
  }

  function getBook(id: string) {
    return books.find((b) => b.id === id);
  }

  function setFavorite(slot: number, id: string | null) {
    setFavorites((current) =>
      current.map((favorite, index) => (index === slot ? id : favorite)),
    );
  }

  return (
    <BooksContext.Provider
      value={{
        books,
        loading,
        addBook,
        updateBook,
        removeBook,
        getBook,
        favorites,
        setFavorite,
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
