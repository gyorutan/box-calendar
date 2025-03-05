import useSWR from "swr";
import { fetcher } from "@/helper/fetcher";

export const useReservation = () => {
  const { data, isLoading, error, mutate } = useSWR(
    "/api/reservations",
    fetcher
  );

  return {
    data,
    isLoading,
    error,
    mutate,
  };
};
