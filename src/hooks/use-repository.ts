import { useMemo } from "react";
import { createRepository } from "../lib/data-source";
import { useAuth } from "./use-auth";

export function useRepository() {
  const { profile } = useAuth();
  return useMemo(() => createRepository(profile), [profile]);
}
