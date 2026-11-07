import { Book, Status } from "../types";

export type StatusForm = {
  status: Status;
  currentPage: number;
  startedAt?: string;
  finishedAt?: string;
  rating?: number;
  note: string;
};

export const emptyForm = (): StatusForm => ({
  status: "quero_ler",
  currentPage: 0,
  note: "",
});

export function formFromBook(b: Book): StatusForm {
  return {
    status: b.status,
    currentPage: b.currentPage,
    startedAt: b.startedAt,
    finishedAt: b.finishedAt,
    rating: b.rating,
    note: b.note ?? "",
  };
}

// Troca o status já preenchendo valores padrão (nota e anotação são preservadas)
export function changeFormStatus(
  form: StatusForm,
  status: Status,
  pageCount: number,
): StatusForm {
  const now = new Date().toISOString();

  if (status === "quero_ler") {
    return {
      ...form,
      status,
      currentPage: 0,
      startedAt: undefined,
      finishedAt: undefined,
    };
  }
  if (status === "lendo") {
    return {
      ...form,
      status,
      startedAt: form.startedAt ?? now,
      finishedAt: undefined,
      currentPage: form.currentPage >= pageCount ? 0 : form.currentPage,
    };
  }
  const finished = form.finishedAt ?? now;
  return {
    ...form,
    status,
    currentPage: pageCount,
    finishedAt: finished,
    startedAt: form.startedAt ?? finished,
  };
}

// Converte o formulário nos campos do livro, garantindo coerência
export function formToBookFields(
  form: StatusForm,
  pageCount: number,
): Pick<
  Book,
  "status" | "currentPage" | "startedAt" | "finishedAt" | "rating" | "note"
> {
  const now = new Date().toISOString();
  const note = form.note.trim() || undefined;

  if (form.status === "quero_ler") {
    return {
      status: "quero_ler",
      currentPage: 0,
      startedAt: undefined,
      finishedAt: undefined,
      rating: undefined,
      note,
    };
  }

  if (form.status === "lendo") {
    return {
      status: "lendo",
      currentPage: Math.max(
        0,
        Math.min(Math.max(0, pageCount - 1), form.currentPage),
      ),
      startedAt: form.startedAt ?? now,
      finishedAt: undefined,
      rating: undefined,
      note,
    };
  }

  const finishedAt = form.finishedAt ?? now;
  let startedAt = form.startedAt ?? finishedAt;
  if (new Date(startedAt) > new Date(finishedAt)) startedAt = finishedAt;

  return {
    status: "lido",
    currentPage: pageCount,
    startedAt,
    finishedAt,
    rating: form.rating,
    note,
  };
}
