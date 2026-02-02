"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";

export interface TimelineFilters {
  search: string;
  sort: "newest" | "oldest";
  dateRange: string;
  dateFrom: string;
  dateTo: string;
  bodyPart: string;
  symptomType: string;
  severityMin: number;
  severityMax: number;
}

export const DEFAULT_FILTERS: TimelineFilters = {
  search: "",
  sort: "newest",
  dateRange: "all",
  dateFrom: "",
  dateTo: "",
  bodyPart: "",
  symptomType: "",
  severityMin: 1,
  severityMax: 10,
};

interface TimelineFiltersProps {
  filters: TimelineFilters;
  onChange: (filters: TimelineFilters) => void;
  bodyParts: string[];
  symptomTypes: string[];
}

const DATE_RANGES = [
  { label: "7d", value: "7d", days: 7 },
  { label: "30d", value: "30d", days: 30 },
  { label: "90d", value: "90d", days: 90 },
  { label: "All", value: "all", days: 0 },
] as const;

function getDateFrom(days: number): string {
  if (days === 0) return "";
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function hasActiveFilters(filters: TimelineFilters): boolean {
  return (
    filters.search !== "" ||
    filters.dateRange !== "all" ||
    filters.bodyPart !== "" ||
    filters.symptomType !== "" ||
    filters.severityMin !== 1 ||
    filters.severityMax !== 10
  );
}

export function TimelineFilters({
  filters,
  onChange,
  bodyParts,
  symptomTypes,
}: TimelineFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  function update(partial: Partial<TimelineFilters>) {
    onChange({ ...filters, ...partial });
  }

  function handleDateRange(value: string) {
    const range = DATE_RANGES.find((r) => r.value === value);
    if (!range) return;
    update({
      dateRange: value,
      dateFrom: getDateFrom(range.days),
      dateTo: "",
    });
  }

  function handleClearFilters() {
    onChange({ ...DEFAULT_FILTERS });
  }

  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      {/* Primary row: search + sort + expand toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search symptoms..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9 min-h-[44px]"
          />
        </div>

        <Button
          variant="outline"
          size="lg"
          className="min-h-[44px] gap-1.5"
          onClick={() =>
            update({ sort: filters.sort === "newest" ? "oldest" : "newest" })
          }
          aria-label={`Sort by ${filters.sort === "newest" ? "oldest" : "newest"} first`}
        >
          <ArrowUpDown className="size-4" />
          <span className="hidden sm:inline">
            {filters.sort === "newest" ? "Newest" : "Oldest"}
          </span>
        </Button>

        <Button
          variant={expanded ? "secondary" : "outline"}
          size="lg"
          className="min-h-[44px] gap-1.5"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle filters"
          aria-expanded={expanded}
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {active && (
            <span className="flex size-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="rounded-lg border bg-card p-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Date range buttons */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              Date range
            </p>
            <div className="flex gap-1.5">
              {DATE_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={
                    filters.dateRange === range.value ? "default" : "outline"
                  }
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => handleDateRange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Dropdowns row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Body part select */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Body part
              </p>
              <Select
                value={filters.bodyPart || "_all"}
                onValueChange={(value) =>
                  update({ bodyPart: value === "_all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="All body parts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All body parts</SelectItem>
                  {bodyParts.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Symptom type select */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Symptom type
              </p>
              <Select
                value={filters.symptomType || "_all"}
                onValueChange={(value) =>
                  update({ symptomType: value === "_all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All types</SelectItem>
                  {symptomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severity range */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              Severity range
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={10}
                value={filters.severityMin}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(filters.severityMax, Number(e.target.value)));
                  update({ severityMin: val });
                }}
                className="w-20 min-h-[44px]"
                aria-label="Minimum severity"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="number"
                min={1}
                max={10}
                value={filters.severityMax}
                onChange={(e) => {
                  const val = Math.max(filters.severityMin, Math.min(10, Number(e.target.value)));
                  update({ severityMax: val });
                }}
                className="w-20 min-h-[44px]"
                aria-label="Maximum severity"
              />
            </div>
          </div>

          {/* Clear filters */}
          {active && (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={handleClearFilters}
            >
              <X className="size-4" />
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
