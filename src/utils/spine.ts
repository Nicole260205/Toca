import { Book } from "../types";
import { colors } from "../constants/theme";

// Espessura proporcional ao número de páginas (com mínimo e máximo)
export function spineWidth(pageCount: number) {
  const w = 14 + pageCount / 12;
  return Math.round(Math.min(56, Math.max(26, w)));
}

// Altura "aleatória", mas sempre a mesma para o mesmo livro (calculada pelo id)
export function spineHeight(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return 120 + (hash % 5) * 9; // entre 120 e 156
}

// Texto claro em lombada escura e vice-versa
export function textColorFor(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? colors.ink : "#FFF8EC";
}

// Divide os livros em prateleiras conforme a largura disponível na tela
export function packRows(books: Book[], available: number, gap = 3): Book[][] {
  const rows: Book[][] = [];
  let row: Book[] = [];
  let used = 0;

  for (const book of books) {
    const w = spineWidth(book.pageCount);
    const needed = row.length === 0 ? w : used + gap + w;

    if (row.length > 0 && needed > available) {
      rows.push(row);
      row = [book];
      used = w;
    } else {
      row.push(book);
      used = needed;
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}
