import type { TextTheme } from "~/types/api";

export const mockThemes: TextTheme[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    team: "flex",
    name: "Sykepenger",
    keywords: ["sykemelding", "sykepenger", "syk"],
    color: "#3b82f6",
    priority: 10,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    team: "flex",
    name: "Utbetaling",
    keywords: ["utbetalt", "penger", "konto", "betaling"],
    color: "#10b981",
    priority: 5,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    team: "flex",
    name: "Søknad",
    keywords: ["søknad", "søke", "status"],
    color: "#f59e0b",
    priority: 1,
  },
];
