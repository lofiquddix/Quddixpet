import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Standard REST hook for initial state fetch if needed (fallback)
export function usePets() {
  return useQuery({
    queryKey: [api.pets.list.path],
    queryFn: async () => {
      const res = await fetch(api.pets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pets");
      return api.pets.list.responses[200].parse(await res.json());
    },
    // We rely mostly on WS, so don't refetch often
    staleTime: 60000,
  });
}
