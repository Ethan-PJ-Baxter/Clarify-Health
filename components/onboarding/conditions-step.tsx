"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const COMMON_CONDITIONS = [
  "Fibromyalgia",
  "IBS",
  "Chronic Fatigue Syndrome",
  "Diabetes (Type 1)",
  "Diabetes (Type 2)",
  "Asthma",
  "Arthritis",
  "Migraine",
  "Endometriosis",
  "PCOS",
  "Anxiety",
  "Depression",
  "Hypertension",
  "Eczema",
  "Psoriasis",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Coeliac Disease",
  "COPD",
  "Epilepsy",
];

interface ConditionsStepProps {
  data: string[];
  onNext: (conditions: string[]) => void;
  onSkip: () => void;
}

export function ConditionsStep({ data, onNext, onSkip }: ConditionsStepProps) {
  const [conditions, setConditions] = useState<string[]>(data);
  const [search, setSearch] = useState("");

  const filteredSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return COMMON_CONDITIONS.filter(
      (c) =>
        c.toLowerCase().includes(query) &&
        !conditions.some((sel) => sel.toLowerCase() === c.toLowerCase())
    );
  }, [search, conditions]);

  function addCondition(condition: string) {
    const trimmed = condition.trim();
    if (
      !trimmed ||
      conditions.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      return;
    }
    setConditions((prev) => [...prev, trimmed]);
    setSearch("");
  }

  function removeCondition(condition: string) {
    setConditions((prev) => prev.filter((c) => c !== condition));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCondition(search);
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Any existing conditions?
      </h1>
      <p className="mb-6 text-muted-foreground">
        This provides context in your reports. Completely optional.
      </p>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search or type a condition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px]"
          maxLength={100}
          aria-label="Search conditions"
          role="combobox"
          aria-expanded={filteredSuggestions.length > 0}
          aria-controls="conditions-listbox"
          aria-autocomplete="list"
        />
        {filteredSuggestions.length > 0 && (
          <ul
            id="conditions-listbox"
            role="listbox"
            aria-label="Condition suggestions"
            className="absolute top-full left-0 z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-popover shadow-md"
          >
            {filteredSuggestions.map((suggestion) => (
              <li key={suggestion} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="min-h-[44px] w-full px-3 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                  onClick={() => addCondition(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {search.trim() &&
        !filteredSuggestions.length &&
        !conditions.some(
          (c) => c.toLowerCase() === search.trim().toLowerCase()
        ) && (
          <p className="mt-2 text-xs text-muted-foreground">
            Press Enter to add &ldquo;{search.trim()}&rdquo; as a custom
            condition.
          </p>
        )}

      {conditions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {conditions.map((condition) => (
            <Badge
              key={condition}
              variant="secondary"
              className="gap-1 py-1.5 pl-3 pr-2 text-sm"
            >
              {condition}
              <button
                type="button"
                onClick={() => removeCondition(condition)}
                className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-foreground/10"
                aria-label={`Remove ${condition}`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          Skip
        </Button>
        <Button
          onClick={() => onNext(conditions)}
          className="min-h-[44px] flex-1"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
