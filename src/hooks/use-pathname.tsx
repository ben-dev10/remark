"use client";
import { usePathname } from "next/navigation";

export const usePathName = () => {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  return isActive;
};
