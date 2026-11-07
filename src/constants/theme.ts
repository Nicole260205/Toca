import { Platform } from "react-native";

// Paleta: Biblioteca clássica.
// Os nomes das chaves foram mantidos para não mexer em todas as telas.
export const colors = {
  cream: "#F4EDDC", // fundo das telas
  card: "#FBF7EC", // cartões
  paper: "#E6D9BC", // campos, chips, caixas de estatística
  sky: "#B8893A", // dourado: barras de progresso e gráfico (o nome é herdado da paleta antiga)
  wood: "#7A5230", // tábua da prateleira
  woodDark: "#1F3A32", // verde garrafa: títulos e números grandes
  boardEdge: "#4A2F1B", // borda inferior da prateleira
  moss: "#1F3A32", // botões, chips ativos e aba selecionada
  accent: "#B8893A", // estrelas
  ink: "#1F3A32", // texto principal
  muted: "rgba(31, 58, 50, 0.65)", // texto secundário
};

// Cores das lombadas sem capa: verdes, dourados, marrons e um vinho
export const spinePalette = [
  "#1F3A32", // verde garrafa
  "#B8893A", // dourado
  "#7A5230", // marrom
  "#8C2F39", // vinho
  "#2F5D50", // verde médio
  "#C9A66B", // dourado claro
  "#4A3B2A", // marrom escuro
  "#E6D9BC", // pergaminho
];

export const serif = Platform.select({ ios: "Georgia", default: "serif" });

// opcional: coloque seu nome para aparecer na saudação
export const USER_NAME = "Nicole";
