"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Clock, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
}

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home, enabled: true },
  { label: "Log", href: "/log", icon: PlusCircle, enabled: false },
  { label: "Timeline", href: "/timeline", icon: Clock, enabled: false },
  { label: "Body Map", href: "/body-map", icon: User, enabled: false },
  { label: "More", href: "/settings", icon: Menu, enabled: false },
];

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "border-t border-border bg-background safe-area-bottom",
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex min-h-[56px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-muted-foreground opacity-40 cursor-not-allowed"
                aria-disabled="true"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[56px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
