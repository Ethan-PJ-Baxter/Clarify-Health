"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, FileX2 } from "lucide-react";
import Link from "next/link";
import { SymptomCard } from "./symptom-card";
import { SymptomDetailSheet } from "./symptom-detail-sheet";
import { SymptomEditModal } from "./symptom-edit-modal";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import {
  TimelineFilters,
  DEFAULT_FILTERS,
  type TimelineFilters as TimelineFiltersType,
} from "./timeline-filters";
import { getBodyPartLabel } from "@/components/body-map/region-data";
import type { Tables } from "@/lib/supabase/types";

type Symptom = Tables<"symptoms">;

interface SymptomTimelineProps {
  initialSymptoms: Symptom[];
  initialTotal: number;
}

const PAGE_SIZE = 20;

function buildSearchParams(
  filters: TimelineFiltersType,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  params.set("sort", filters.sort);

  if (filters.search) params.set("search", filters.search);
  if (filters.bodyPart) params.set("body_part", filters.bodyPart);
  if (filters.symptomType) params.set("symptom_type", filters.symptomType);
  if (filters.severityMin > 1)
    params.set("severity_min", String(filters.severityMin));
  if (filters.severityMax < 10)
    params.set("severity_max", String(filters.severityMax));
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);

  return params;
}

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SymptomTimeline({
  initialSymptoms,
  initialTotal,
}: SymptomTimelineProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialSymptoms);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialSymptoms.length < initialTotal
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [filters, setFilters] = useState<TimelineFiltersType>(DEFAULT_FILTERS);

  // Detail sheet state
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derive unique body parts and symptom types from all loaded symptoms
  // plus initial data for filter dropdowns
  const bodyParts = useMemo(() => {
    const parts = new Set<string>();
    initialSymptoms.forEach((s) => parts.add(getBodyPartLabel(s.body_part)));
    symptoms.forEach((s) => parts.add(getBodyPartLabel(s.body_part)));
    return Array.from(parts).sort();
  }, [initialSymptoms, symptoms]);

  const symptomTypes = useMemo(() => {
    const types = new Set<string>();
    initialSymptoms.forEach((s) => types.add(s.symptom_type));
    symptoms.forEach((s) => types.add(s.symptom_type));
    return Array.from(types).sort();
  }, [initialSymptoms, symptoms]);

  // Fetch symptoms from API
  const fetchSymptoms = useCallback(
    async (
      targetFilters: TimelineFiltersType,
      targetPage: number,
      append: boolean
    ) => {
      // Cancel any in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (append) {
        setLoading(true);
      } else {
        setInitialLoading(true);
      }

      try {
        const params = buildSearchParams(targetFilters, targetPage);
        const response = await fetch(`/api/symptoms?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch symptoms");

        const { data, total: newTotal, hasMore: more } = await response.json();

        if (append) {
          setSymptoms((prev) => [...prev, ...data]);
        } else {
          setSymptoms(data);
        }
        setTotal(newTotal);
        setHasMore(more);
        setPage(targetPage);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Silently ignore aborted requests
        }
        toast.error("Failed to load symptoms");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    []
  );

  // Handle filter changes with debounce
  const handleFiltersChange = useCallback(
    (newFilters: TimelineFiltersType) => {
      setFilters(newFilters);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchSymptoms(newFilters, 1, false);
      }, 300);
    },
    [fetchSymptoms]
  );

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !initialLoading) {
          fetchSymptoms(filters, page + 1, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, initialLoading, page, filters, fetchSymptoms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  // Card click handler
  const handleCardClick = useCallback((symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setDetailOpen(true);
  }, []);

  // Edit handler
  const handleEdit = useCallback(() => {
    setDetailOpen(false);
    setEditOpen(true);
  }, []);

  // Edit saved handler
  const handleEditSaved = useCallback((updated: Symptom) => {
    setSymptoms((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    setSelectedSymptom(updated);
  }, []);

  // Delete handler
  const handleDeleteClick = useCallback(() => {
    setDetailOpen(false);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSymptom) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/symptoms/${selectedSymptom.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setSymptoms((prev) =>
        prev.filter((s) => s.id !== selectedSymptom.id)
      );
      setTotal((prev) => prev - 1);
      setDeleteOpen(false);
      setSelectedSymptom(null);
      toast("Symptom deleted");
    } catch {
      toast.error("Failed to delete symptom. Please try again.");
    } finally {
      setDeleting(false);
    }
  }, [selectedSymptom]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.search !== "" ||
    filters.dateRange !== "all" ||
    filters.bodyPart !== "" ||
    filters.symptomType !== "" ||
    filters.severityMin !== 1 ||
    filters.severityMax !== 10;

  const isEmpty = symptoms.length === 0 && !initialLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0
              ? `${total} symptom${total === 1 ? "" : "s"} recorded`
              : "Track and review your symptom history"}
          </p>
        </div>
        <Button asChild size="lg" className="min-h-[44px] gap-1.5">
          <Link href="/log">
            <Plus className="size-4" />
            Log Symptom
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <TimelineFilters
        filters={filters}
        onChange={handleFiltersChange}
        bodyParts={bodyParts}
        symptomTypes={symptomTypes}
      />

      {/* Symptom list */}
      {initialLoading ? (
        <SkeletonCards count={5} />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileX2 className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No symptoms found</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {hasActiveFilters
              ? "Try adjusting your filters to find what you are looking for."
              : "Start tracking your health by logging your first symptom."}
          </p>
          <div className="mt-4">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="lg"
                className="min-h-[44px]"
                onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild size="lg" className="min-h-[44px] gap-1.5">
                <Link href="/log">
                  <Plus className="size-4" />
                  Log your first symptom
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <SymptomCard
              key={symptom.id}
              symptom={symptom}
              onClick={() => handleCardClick(symptom)}
            />
          ))}

          {/* Loading more indicator */}
          {loading && <SkeletonCards count={2} />}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />

          {/* End of list */}
          {!hasMore && symptoms.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              You have reached the end of your timeline.
            </p>
          )}
        </div>
      )}

      {/* Detail sheet */}
      <SymptomDetailSheet
        symptom={selectedSymptom}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Edit modal */}
      <SymptomEditModal
        symptom={selectedSymptom}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleEditSaved}
      />

      {/* Delete confirmation */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleting}
        symptomType={selectedSymptom?.symptom_type}
      />
    </div>
  );
}
