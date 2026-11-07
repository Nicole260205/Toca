import { mapGenres } from "../utils/genres";

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_KEY;

async function fetchJson(url: string, timeoutMs = 12000) {
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

const cleanAuthor = (author: string) =>
  author && author !== "Autor desconhecido" ? author.split(",")[0].trim() : "";

// Open Library: lista de assuntos detalhada
async function fromOpenLibrary(
  title: string,
  author: string,
): Promise<string[]> {
  const params = [`title=${encodeURIComponent(title)}`];
  const a = cleanAuthor(author);
  if (a) params.push(`author=${encodeURIComponent(a)}`);

  const data = await fetchJson(
    `https://openlibrary.org/search.json?${params.join("&")}&limit=3&fields=title,subject`,
  );
  const subjects: string[] = (data.docs ?? [])
    .slice(0, 2)
    .flatMap((d: any) => d.subject ?? []);
  return mapGenres(subjects);
}

// Google Books: categorias mais simples, serve de reforço
async function fromGoogle(title: string, author: string): Promise<string[]> {
  if (!GOOGLE_KEY) return [];
  const a = cleanAuthor(author);
  const q = `intitle:"${title}"${a ? `+inauthor:"${a}"` : ""}`;
  const data = await fetchJson(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=3&printType=books&key=${GOOGLE_KEY}`,
  );
  const categories: string[] = (data.items ?? []).flatMap(
    (i: any) => i.volumeInfo?.categories ?? [],
  );
  return mapGenres(categories);
}

// Se a Open Library falhar por rede, o erro sobe e o livro é tentado de novo na próxima abertura
export async function lookupGenres(
  title: string,
  author: string,
): Promise<string[]> {
  const fromOL = await fromOpenLibrary(title, author);
  if (fromOL.length > 0) return fromOL;

  try {
    return await fromGoogle(title, author);
  } catch {
    return [];
  }
}
