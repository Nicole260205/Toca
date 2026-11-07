import { Book } from "../types";
import type { Pose } from "../components/Mascot";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  pose: Pose;
  current: number;
  target: number;
  unlocked: boolean;
};

export function computeAchievements(
  books: Book[],
  favorites: (string | null)[],
): Achievement[] {
  const read = books.filter((b) => b.status === "lido");
  const pages = read.reduce((sum, b) => sum + b.pageCount, 0);
  const ratedCount = books.filter((b) => b.rating).length;
  const fiveStars = books.filter((b) => b.rating === 5).length;
  const quotes = books.reduce((sum, b) => sum + (b.quotes?.length ?? 0), 0);
  const thick = read.filter((b) => b.pageCount >= 500).length;
  const favs = favorites.filter(Boolean).length;

  const def = (
    id: string,
    title: string,
    description: string,
    pose: Pose,
    current: number,
    target: number,
  ): Achievement => ({
    id,
    title,
    description,
    pose,
    current,
    target,
    unlocked: current >= target,
  });

  return [
    def(
      "primeiro",
      "Primeira leitura",
      "Termine um livro",
      "feliz",
      read.length,
      1,
    ),
    def("cinco", "Leitor assíduo", "Termine 5 livros", "lendo", read.length, 5),
    def(
      "dez",
      "Rato de biblioteca",
      "Termine 10 livros",
      "estrela",
      read.length,
      10,
    ),
    def(
      "vinteecinco",
      "Guardião da toca",
      "Termine 25 livros",
      "acenando",
      read.length,
      25,
    ),
    def(
      "mil",
      "Mil páginas",
      "Leia 1.000 páginas no total",
      "lendo",
      pages,
      1000,
    ),
    def(
      "cincomil",
      "Maratonista",
      "Leia 5.000 páginas no total",
      "dormindo",
      pages,
      5000,
    ),
    def(
      "tijolao",
      "Tijolão",
      "Termine um livro de 500 páginas ou mais",
      "feliz",
      thick,
      1,
    ),
    def("critico", "Crítico", "Dê nota a 5 livros", "estrela", ratedCount, 5),
    def(
      "amor",
      "Amor à primeira página",
      "Dê 5 estrelas a um livro",
      "feliz",
      fiveStars,
      1,
    ),
    def(
      "frases",
      "Caçador de frases",
      "Guarde 3 citações",
      "procurando",
      quotes,
      3,
    ),
    def("curador", "Curador", "Preencha seus 4 favoritos", "acenando", favs, 4),
  ];
}
