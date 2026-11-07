import { normalize } from "../utils/text";

export type Lang = "todos" | "pt" | "en";

export type SearchResult = {
  key: string;
  title: string;
  author: string;
  pageCount: number; // 0 quando a API não informa
  coverUrl?: string;
  year?: string;
  technical: boolean; // parece livro técnico ou científico
  score: number;
};

type Raw = Omit<SearchResult, "score"> & { popularity: number };

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_KEY;

// ---------- detecção de livros técnicos ----------

// categorias literárias têm prioridade: "Science Fiction" não é técnico
const LITERARY = [
  "fiction",
  "ficcao",
  "romance",
  "poetry",
  "poesia",
  "literary",
  "literatura",
  "comics",
  "graphic novel",
  "drama",
  "humor",
  "juvenile",
  "infantil",
  "biography",
  "biografia",
];

const TECH_CATEGORIES = [
  "science",
  "ciencia",
  "ciencias",
  "technology",
  "tecnologia",
  "engineering",
  "engenharia",
  "medical",
  "medicina",
  "mathematics",
  "matematica",
  "computers",
  "computadores",
  "informatica",
  "law",
  "direito",
  "business",
  "economics",
  "economia",
  "administracao",
  "education",
  "educacao",
  "study aids",
  "reference",
  "referencia",
  "architecture",
  "arquitetura",
  "transportation",
  "technical",
  "tecnico",
];

const TECH_TITLE =
  /\b(proceedings|journal of|handbook|annals|anais|revista|congress|congresso|symposium|simposio|conference|conferencia|thesis|tese de|dissertation|dissertacao|bulletin|boletim|study guide|cliffsnotes|sparknotes)\b/;

const hasWord = (text: string, word: string) =>
  new RegExp(`\\b${word}\\b`).test(text);

function isTechnical(categories: string[] | undefined, title: string): boolean {
  if (TECH_TITLE.test(normalize(title))) return true;
  if (!categories || categories.length === 0) return false;

  const cats = categories.map(normalize);
  if (cats.some((c) => LITERARY.some((w) => c.includes(w)))) return false;
  return cats.some((c) => TECH_CATEGORIES.some((w) => hasWord(c, w)));
}

// ---------- utilidades ----------

async function fetchJson(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function scoreOf(r: Raw, query: string): number {
  const nt = normalize(r.title);
  const nq = normalize(query).trim();
  const words = nq.split(/\s+/).filter(Boolean);
  const na = normalize(r.author);

  let s = 0;
  if (nt === nq) s += 50;
  else if (nt.startsWith(nq)) s += 30;
  else if (words.length > 0 && words.every((w) => nt.includes(w))) s += 20;
  else if (words.length > 0 && words.every((w) => `${nt} ${na}`.includes(w)))
    s += 10;

  if (r.coverUrl) s += 8;
  if (r.pageCount > 0) s += 4;
  s += Math.min(10, Math.log2(r.popularity + 1) * 2);
  if (r.technical) s -= 30;
  return s;
}

// ---------- Google Books ----------

async function googleQuery(q: string, lang: Lang): Promise<any[]> {
  let url =
    "https://www.googleapis.com/books/v1/volumes" +
    `?q=${encodeURIComponent(q)}&maxResults=40&printType=books&orderBy=relevance&key=${GOOGLE_KEY}`;
  if (lang !== "todos") url += `&langRestrict=${lang}`;
  const data = await fetchJson(url);
  return data.items ?? [];
}

async function searchGoogle(query: string, lang: Lang): Promise<Raw[]> {
  // uma busca livre e outra só no título; se uma falhar, usa a outra
  const settled = await Promise.allSettled([
    googleQuery(`intitle:"${query}"`, lang),
    googleQuery(query, lang),
  ]);
  if (settled.every((s) => s.status === "rejected")) {
    throw (settled[0] as PromiseRejectedResult).reason;
  }

  const items = settled.flatMap((s) =>
    s.status === "fulfilled" ? s.value : [],
  );

  return items.map((item: any): Raw => {
    const info = item.volumeInfo ?? {};
    const thumb: string | undefined =
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    const title =
      [info.title, info.subtitle].filter(Boolean).join(": ") || "Sem título";
    return {
      key: `g-${item.id}`,
      title: info.title ?? "Sem título",
      author: (info.authors ?? []).join(", ") || "Autor desconhecido",
      pageCount: info.pageCount ?? 0,
      // a Google devolve http://, e o Android bloqueia imagens sem https
      coverUrl: thumb ? thumb.replace("http://", "https://") : undefined,
      year: info.publishedDate
        ? String(info.publishedDate).slice(0, 4)
        : undefined,
      technical: isTechnical(info.categories, title),
      popularity: info.ratingsCount ?? 0,
    };
  });
}

// ---------- Open Library ----------

async function searchOpenLibrary(query: string, lang: Lang): Promise<Raw[]> {
  const langParam =
    lang === "pt" ? "&language=por" : lang === "en" ? "&language=eng" : "";
  const url =
    "https://openlibrary.org/search.json" +
    `?q=${encodeURIComponent(query)}&limit=30` +
    "&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year,edition_count" +
    langParam;
  const data = await fetchJson(url, 12000);

  return (data.docs ?? []).map((doc: any): Raw => {
    const title = doc.title ?? "Sem título";
    return {
      key: `o-${doc.key}`,
      title,
      author: (doc.author_name ?? []).join(", ") || "Autor desconhecido",
      pageCount: doc.number_of_pages_median ?? 0,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : undefined,
      year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      technical: isTechnical(undefined, title),
      popularity: doc.edition_count ?? 0,
    };
  });
}

// ---------- busca principal ----------

export async function searchBooks(
  query: string,
  lang: Lang = "todos",
): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const merged = new Map<string, SearchResult>();

  function add(list: Raw[]) {
    for (const raw of list) {
      const { popularity, ...rest } = raw;
      const item: SearchResult = { ...rest, score: scoreOf(raw, q) };
      // mesma obra: título + primeiro autor; fica a versão com melhor pontuação
      const first = normalize(item.author.split(",")[0]);
      const id = `${normalize(item.title)}|${first}`;
      const existing = merged.get(id);
      if (!existing || item.score > existing.score) merged.set(id, item);
    }
  }

  let googleOk = false;
  if (GOOGLE_KEY) {
    try {
      add(await searchGoogle(q, lang));
      googleOk = true;
    } catch (e) {
      console.warn("Google Books falhou", e);
    }
  }

  // Open Library entra se a Google falhou, não tem chave, ou trouxe pouco resultado bom
  const goodCount = Array.from(merged.values()).filter(
    (r) => !r.technical,
  ).length;
  if (!googleOk || goodCount < 8) {
    try {
      add(await searchOpenLibrary(q, lang));
    } catch (e) {
      if (!googleOk) throw e; // as duas falharam
      console.warn("Open Library falhou", e);
    }
  }

  return Array.from(merged.values())
    .filter((r) => !(r.pageCount > 0 && r.pageCount < 30)) // folhetos e separatas
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
}
