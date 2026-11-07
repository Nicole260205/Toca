export type Status = "quero_ler" | "lendo" | "lido";

export type Quote = {
  id: string;
  text: string;
  page?: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  coverUrl?: string;
  spineColor: string;
  status: Status;
  currentPage: number;
  startedAt?: string;
  finishedAt?: string;
  rating?: number;
  note?: string;
  quotes?: Quote[];
  genres?: string[];
  genresChecked?: boolean;
};
