import { Book } from "../types";
import { normalize } from "./text";

export type SortKey =
  | "custom"
  | "added"
  | "title"
  | "author"
  | "finished"
  | "rating"
  | "pages";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "custom", label: "Minha ordem" },
  { key: "added", label: "Adicionados recentemente" },
  { key: "finished", label: "Terminados recentemente" },
  { key: "title", label: "Título (A a Z)" },
  { key: "author", label: "Autor (A a Z)" },
  { key: "rating", label: "Maior nota" },
  { key: "pages", label: "Mais páginas" },
];

const text = (a: string, b: string) =>
  normalize(a).localeCompare(normalize(b), "pt-BR");

export function sortBooks(books: Book[], key: SortKey): Book[] {
  const list = [...books];
  switch (key) {
    case "custom":
      return list; // a ordem do próprio array é a ordem do usuário
    case "added":
      return list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    case "title":
      return list.sort((a, b) => text(a.title, b.title));
    case "author":
      return list.sort(
        (a, b) => text(a.author, b.author) || text(a.title, b.title),
      );
    case "finished":
      return list.sort((a, b) => {
        if (!a.finishedAt && !b.finishedAt) return 0;
        if (!a.finishedAt) return 1;
        if (!b.finishedAt) return -1;
        return b.finishedAt.localeCompare(a.finishedAt);
      });
    case "rating":
      return list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "pages":
      return list.sort((a, b) => b.pageCount - a.pageCount);
  }
}
