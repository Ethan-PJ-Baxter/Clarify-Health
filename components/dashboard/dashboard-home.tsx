"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MiniBodyMap, type RegionCount } from "./mini-body-map";

interface DashboardHomeProps {
  profileName: string | null;
  symptomCount: number;
  medicationCount: number;
  regionCounts?: Record<string, RegionCount>;
}

function getWeekDays(): { label: string; date: Date }[] {
  const now = new Date();
  const day = now.getDay();
  // Monday = 0 offset
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { label, date };
  });
}

function handleComingSoon() {
  toast("Coming soon", {
    description: "This feature is not available yet.",
  });
}

export function DashboardHome({
  profileName,
  symptomCount,
  medicationCount,
  regionCounts = {},
}: DashboardHomeProps) {
  const weekDays = getWeekDays();
  const displayName = profileName || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Welcome back, {displayName}!
          </CardTitle>
          <CardDescription>
            Track your symptoms and generate GP reports.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Quick Log Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-7 w-7 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h2 className="mb-1 text-lg font-semibold">Log a Symptom</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Describe what you&apos;re experiencing and let AI help document it
            </p>
            <Button asChild className="min-h-[44px] w-full" size="lg">
              <Link href="/log">Log Symptom</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Symptoms Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            {symptomCount === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <p className="mb-1 text-sm font-medium">
                  No symptoms logged yet
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Start tracking your symptoms to see patterns and generate GP
                  reports.
                </p>
                <Button
                  variant="outline"
                  asChild
                  className="min-h-[44px]"
                  size="lg"
                >
                  <Link href="/log">Log Your First Symptom</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {symptomCount} symptom{symptomCount !== 1 ? "s" : ""} logged.
                </p>
                <Button variant="ghost" asChild className="min-h-[44px] text-sm">
                  <Link href="/timeline">View Timeline</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Medications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Active Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {medicationCount > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18a.94.94 0 0 0-.662.274.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">
                    {medicationCount} active medication
                    {medicationCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleComingSoon}
                  className="min-h-[44px] text-sm"
                >
                  View All
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18a.94.94 0 0 0-.662.274.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  No medications tracked
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {weekDays.map(({ label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <span className="text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              0 days logged this week
            </p>
          </CardContent>
        </Card>

        {/* Body Map Preview Card */}
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Body Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <MiniBodyMap regionCounts={regionCounts} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
