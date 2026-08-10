import { useQuery } from "@tanstack/react-query";
import { getProductos } from "../productoService";

export default function useProductos() {
  return useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });
}