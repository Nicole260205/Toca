// tira acentos e maiúsculas, para "pequeno principe" achar "Pequeno Príncipe"
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
