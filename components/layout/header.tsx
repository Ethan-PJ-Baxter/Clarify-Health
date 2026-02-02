"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  profile: { name: string | null };
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/log": "Log Symptom",
  "/timeline": "Timeline",
  "/body-map": "Body Map",
  "/medications": "Medications",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const title = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <Avatar size="default" className="md:hidden">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
