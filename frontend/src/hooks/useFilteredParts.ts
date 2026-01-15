import { useMemo } from 'react';
import type { Part } from '@shared/index';

interface UseFilteredPartsOptions {
  parts: Part[];
  priceRange: [number, number];
  query: string;
  isAIMode: boolean;
}

/**
 * Custom hook for filtering parts with memoization
 * Optimizes re-renders by caching filtered results
 */
export function useFilteredParts({
  parts,
  priceRange,
  query,
  isAIMode,
}: UseFilteredPartsOptions): Part[] {
  return useMemo(() => {
    return parts.filter(part => {
      // Price filter
      const priceMatch = part.price >= priceRange[0] && part.price <= priceRange[1];

      // Text search filter (only in non-AI mode)
      if (!isAIMode && query.trim()) {
        const searchTerm = query.toLowerCase();
        const nameMatch = (part.name || '').toLowerCase().includes(searchTerm);
        const manufacturerMatch = (part.manufacturer || '').toLowerCase().includes(searchTerm);
        const modelMatch = (part.model || '').toLowerCase().includes(searchTerm);
        const textMatch = nameMatch || manufacturerMatch || modelMatch;
        return priceMatch && textMatch;
      }

      return priceMatch;
    });
  }, [parts, priceRange, query, isAIMode]);
}
