import { normalize } from "./text";

// valor especial do filtro: livros sem nenhum gênero
export const NO_GENRE = "__none__";

const RULES: { genre: string; words: string[] }[] = [
  { genre: "Fantasia", words: ["fantasy", "fantasia"] },
  {
    genre: "Ficção científica",
    words: ["science fiction", "ficcao cientifica", "sci-fi"],
  },
  { genre: "Distopia", words: ["dystopia", "dystopian", "distopia", "utopia"] },
  { genre: "Romance", words: ["romance", "love stories", "romantic"] },
  {
    genre: "Suspense e mistério",
    words: [
      "thriller",
      "suspense",
      "mystery",
      "misterio",
      "detective",
      "crime",
      "espionage",
    ],
  },
  { genre: "Terror", words: ["horror", "terror", "ghost stories", "gothic"] },
  { genre: "Aventura", words: ["adventure", "aventura"] },
  {
    genre: "Clássicos",
    words: [
      "classics",
      "classic literature",
      "classicos",
      "literary collections",
    ],
  },
  {
    genre: "Infantil e juvenil",
    words: ["juvenile", "young adult", "children", "infantil", "juvenil"],
  },
  {
    genre: "Biografia",
    words: ["biography", "autobiography", "biografia", "memoir"],
  },
  {
    genre: "História",
    words: [
      "world history",
      "historical",
      "history of",
      "historia do",
      "historia da",
    ],
  },
  { genre: "Poesia", words: ["poetry", "poesia"] },
  { genre: "Quadrinhos", words: ["comics", "graphic novel", "quadrinhos"] },
  { genre: "Autoajuda", words: ["self-help", "autoajuda", "self help"] },
  { genre: "Filosofia", words: ["philosophy", "filosofia"] },
  {
    genre: "Religião e espiritualidade",
    words: ["religion", "religiao", "spiritual", "espiritualidade"],
  },
];

// Converte categorias ou assuntos (em inglês ou português) nos nossos gêneros.
// Os gêneros mais citados vêm primeiro, e "Ficção" (genérico) fica por último.
export function mapGenres(subjects?: string[]): string[] {
  if (!subjects || subjects.length === 0) return [];

  const hits = new Map<string, number>();
  let fiction = false;

  for (const raw of subjects) {
    const c = normalize(raw);
    if (c.includes("criticism")) continue; // "History and criticism" é ruído

    for (const rule of RULES) {
      if (rule.words.some((w) => c.includes(w))) {
        hits.set(rule.genre, (hits.get(rule.genre) ?? 0) + 1);
      }
    }

    const nonFiction = /non-?fiction|nao ficcao/.test(c);
    if (!nonFiction && /fiction|ficcao/.test(c)) fiction = true;
  }

  const specific = Array.from(hits.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, fiction ? 2 : 3);

  return fiction ? [...specific, "Ficção"] : specific;
}

// Junta gêneros já conhecidos com os novos, no máximo 3
export function mergeGenres(existing: string[], found: string[]): string[] {
  const all = Array.from(new Set([...existing, ...found]));
  const specific = all.filter((g) => g !== "Ficção");
  return all.includes("Ficção")
    ? [...specific.slice(0, 2), "Ficção"]
    : specific.slice(0, 3);
}
