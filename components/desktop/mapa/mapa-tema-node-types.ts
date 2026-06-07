import type { Tema } from "@/app/types/estudio";

export type MapaTemaNodeData = {
  tema: Tema;
  onEdit: (id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
};
