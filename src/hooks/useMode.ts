import useSWR from "swr";
import { fetcher } from "@/helper/fetcher";

export const useMode = () => {
  const { data, isLoading, error, mutate } = useSWR("/api/mode", fetcher);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};
