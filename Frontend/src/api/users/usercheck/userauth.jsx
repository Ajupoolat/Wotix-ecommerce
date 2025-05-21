import { useQuery } from "@tanstack/react-query";
import { checkuser } from "../signup/signupcall";

export const userauth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const data = await checkuser();
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};