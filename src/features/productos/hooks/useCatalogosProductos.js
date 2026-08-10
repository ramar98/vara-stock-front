import { useQuery } from "@tanstack/react-query";

import { obtenerCatalogosProductos } from "../catalogosService";

export default function useCatalogosProductos() {
  return useQuery({
    queryKey: ["catalogos-productos"],
    queryFn: obtenerCatalogosProductos,

    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}