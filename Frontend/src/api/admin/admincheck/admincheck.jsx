import { useQuery } from "@tanstack/react-query";
import { checkauth } from "../Login/loginAuth";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: checkauth,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
