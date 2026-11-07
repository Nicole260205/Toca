import { useEffect, useRef } from "react";
import { useBooks } from "../context/BooksContext";
import { lookupGenres } from "../services/genresApi";
import { mergeGenres } from "../utils/genres";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Completa os gêneros dos livros que ainda não foram verificados, um de cada vez
export function useGenreEnrichment() {
  const { books, updateBook, loading } = useBooks();
  const latest = useRef(books);
  latest.current = books;

  const attempted = useRef(new Set<string>()); // evita repetir na mesma sessão
  const running = useRef(false);

  useEffect(() => {
    if (loading || running.current) return;
    running.current = true;

    (async () => {
      while (true) {
        const next = latest.current.find(
          (b) => !b.genresChecked && !attempted.current.has(b.id),
        );
        if (!next) break;
        attempted.current.add(next.id);

        try {
          const found = await lookupGenres(next.title, next.author);
          updateBook(next.id, {
            genres: mergeGenres(next.genres ?? [], found),
            genresChecked: true,
          });
        } catch {
          // sem internet ou serviço fora do ar: tenta de novo na próxima abertura do app
        }
        await sleep(500); // respeita o limite de requisições
      }
      running.current = false;
    })();
  }, [loading, books.length]);
}
