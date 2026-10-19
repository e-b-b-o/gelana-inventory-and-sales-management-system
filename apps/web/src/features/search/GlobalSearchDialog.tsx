import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearchQuery, type SearchResultItem } from "./api";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  navigation: { label: "Pages & Navigation", icon: "explore" },
  products: { label: "Products", icon: "inventory_2" },
  categories: { label: "Categories", icon: "category" },
  sales: { label: "Sales & Receipts", icon: "receipt_long" },
  returns: { label: "Returns & Refunds", icon: "assignment_return" },
  transfers: { label: "Branch Transfers", icon: "swap_horiz" },
  closings: { label: "Daily Closings", icon: "lock_clock" },
};

export function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [rawInput, setRawInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounce input 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(rawInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [rawInput]);

  // Reset states and focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setRawInput("");
      setDebouncedQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Escape key listener when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const { data, isLoading, isError, refetch } = useGlobalSearchQuery(debouncedQuery, isOpen);

  // Flatten grouped results for keyboard navigation
  const flatResults = useMemo(() => {
    if (!data?.results) return [];
    const list: SearchResultItem[] = [];
    const keys: (keyof typeof data.results)[] = [
      "navigation",
      "products",
      "categories",
      "sales",
      "returns",
      "transfers",
      "closings",
    ];

    for (const key of keys) {
      const group = data.results[key];
      if (group && group.length > 0) {
        list.push(...group);
      }
    }
    return list;
  }, [data]);

  // Reset selected index when query results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, flatResults.length]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  // Keyboard navigation inside dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (flatResults.length > 0 ? (prev + 1) % flatResults.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        flatResults.length > 0 ? (prev - 1 + flatResults.length) % flatResults.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    }
  };

  // Keep active item in view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-scrim/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div
        className="bg-surface-container-lowest rounded-xl max-w-2xl w-full shadow-2xl border border-outline-variant overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-outline-variant shrink-0 bg-surface">
          <span className="material-symbols-outlined text-[22px] text-on-surface-variant mr-3 shrink-0">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            className="w-full h-12 bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            placeholder="Search pages, products, SKUs, sales, transfers, closings..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            aria-label="Search across application"
          />
          {rawInput && (
            <button
              type="button"
              onClick={() => {
                setRawInput("");
                setDebouncedQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors mr-1"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant bg-surface-container rounded border border-outline-variant shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results / Status Content */}
        <div ref={listRef} className="overflow-y-auto flex-1 divide-y divide-outline-variant">
          {/* Initial Idle Prompt */}
          {!rawInput.trim() && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">manage_search</span>
              <p className="font-semibold text-body-md text-on-surface">Global Application Search</p>
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
                Quickly locate inventory items by name or SKU, view sales receipts, find branch transfers, or jump directly to authorized application pages.
              </p>
            </div>
          )}

          {/* Loading State */}
          {rawInput.trim() && isLoading && (
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded bg-surface-container-high" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-container-high rounded w-1/3" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded bg-surface-container-high" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-container-high rounded w-1/4" />
                  <div className="h-3 bg-surface-container rounded w-2/3" />
                </div>
              </div>
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded bg-surface-container-high" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-container-high rounded w-1/2" />
                  <div className="h-3 bg-surface-container rounded w-1/3" />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {rawInput.trim() && !isLoading && isError && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-error mb-2">error</span>
              <p className="font-semibold text-body-md text-on-surface">Search request failed</p>
              <p className="text-body-sm text-on-surface-variant mt-1 mb-4">
                Unable to complete search at this time. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-on-primary text-label-sm font-label-md hover:bg-primary-hover shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Retry Search
              </button>
            </div>
          )}

          {/* Empty State */}
          {rawInput.trim() && !isLoading && !isError && flatResults.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">search_off</span>
              <p className="font-semibold text-body-md text-on-surface">No results found for "{rawInput}"</p>
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
                No matching records or pages were found. Try verifying spelling or searching by SKU, sale reference, or category.
              </p>
            </div>
          )}

          {/* Categorized Matching Results */}
          {rawInput.trim() && !isLoading && !isError && flatResults.length > 0 && (
            <div>
              {(Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[]).map((groupKey) => {
                const groupItems = (data?.results as any)?.[groupKey] || [];
                if (groupItems.length === 0) return null;

                const config = CATEGORY_CONFIG[groupKey] || { label: groupKey, icon: "list" };

                return (
                  <div key={groupKey} className="py-2">
                    <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
                      <span>{config.label}</span>
                      <span className="ml-auto text-[10px] text-on-surface-variant font-normal">
                        {groupItems.length} {groupItems.length === 1 ? "result" : "results"}
                      </span>
                    </div>

                    <div className="space-y-0.5 px-2">
                      {groupItems.map((item: SearchResultItem) => {
                        const globalIndex = flatResults.findIndex((r) => r.id === item.id);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            data-index={globalIndex}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary-container/30 text-on-surface ring-1 ring-primary/30"
                                : "hover:bg-surface-container text-on-surface"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                              <span
                                className={`material-symbols-outlined text-[20px] shrink-0 ${
                                  isSelected ? "text-primary" : "text-on-surface-variant"
                                }`}
                              >
                                {config.icon}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-body-sm font-semibold truncate text-on-surface">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p className="text-body-xs text-on-surface-variant truncate">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            {item.badge && (
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded shrink-0 ${
                                  isSelected
                                    ? "bg-primary text-on-primary"
                                    : "bg-surface-container-high text-on-surface-variant"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 bg-surface border-t border-outline-variant flex items-center justify-between text-label-xs text-on-surface-variant shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant font-mono">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant font-mono">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>
          <span className="text-on-surface-variant">Gelana Global Search</span>
        </div>
      </div>
    </div>
  );
}
