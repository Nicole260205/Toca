export type SearchResult = {
  key: string;
  title: string;
  author: string;
  pageCount: number; // 0 quando a API não informa
  coverUrl?: string;
};

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_KEY;

// fetch com limite de tempo, para o app não ficar travado esperando
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

async function searchGoogle(query: string): Promise<SearchResult[]> {
  const url =
    "https://www.googleapis.com/books/v1/volumes" +
    `?q=${encodeURIComponent(query)}&maxResults=15&printType=books&key=${GOOGLE_KEY}`;
  const data = await fetchJson(url);

  return (data.items ?? []).map((item: any): SearchResult => {
    const info = item.volumeInfo ?? {};
    const thumb: string | undefined =
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    return {
      key: `g-${item.id}`,
      title: info.title ?? "Sem título",
      author: (info.authors ?? []).join(", ") || "Autor desconhecido",
      pageCount: info.pageCount ?? 0,
      // a Google devolve http://, e o Android bloqueia imagens sem https
      coverUrl: thumb ? thumb.replace("http://", "https://") : undefined,
    };
  });
}

async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const url =
    "https://openlibrary.org/search.json" +
    `?q=${encodeURIComponent(query)}&limit=15` +
    "&fields=key,title,author_name,number_of_pages_median,cover_i";
  const data = await fetchJson(url, 12000);

  return (data.docs ?? []).map(
    (doc: any): SearchResult => ({
      key: `o-${doc.key}`,
      title: doc.title ?? "Sem título",
      author: (doc.author_name ?? []).join(", ") || "Autor desconhecido",
      pageCount: doc.number_of_pages_median ?? 0,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : undefined,
    }),
  );
}

// Google primeiro (se houver chave); se falhar ou vier vazio, tenta a Open Library
export async function searchBooks(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  if (GOOGLE_KEY) {
    try {
      const results = await searchGoogle(q);
      if (results.length > 0) return results;
    } catch (e) {
      console.warn("Google Books falhou, tentando Open Library", e);
    }
  }
  return searchOpenLibrary(q);
}
