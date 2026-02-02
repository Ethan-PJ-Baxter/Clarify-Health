"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PlusCircle,
  Clock,
  User,
  Pill,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  profile: { name: string | null; id: string };
  className?: string;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: Home, enabled: true },
  { label: "Log Symptom", href: "/log", icon: PlusCircle, enabled: true },
  { label: "Timeline", href: "/timeline", icon: Clock, enabled: true },
  { label: "Body Map", href: "/body-map", icon: User, enabled: true },
  { label: "Medications", href: "/medications", icon: Pill, enabled: true },
  { label: "Reports", href: "/reports", icon: FileText, enabled: true },
  { label: "Settings", href: "/settings", icon: Settings, enabled: true },
];

export function Sidebar({ profile, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-primary"
        >
          Clarify
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
                aria-disabled="true"
                title="Coming soon"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  Soon
                </Badge>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-sm font-medium">
            {profile.name || "User"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          type="button"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
