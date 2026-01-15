import { useQuery } from '@tanstack/react-query';
import type { SearchRequest, SearchResponse } from '@shared/index';
import { getApiUrl } from '../config';
import { categoryMap } from '../constants/categoryImages';

export type SearchMode = 'ai' | 'battery' | 'material';

interface BatteryFilters {
  sohMin: number;
  sohMax: number;
  cathodeTypes: string[];
}

interface MaterialFilters {
  alloyNumber: string;
  tensileStrengthMin: number | '';
  recyclabilityMin: number | '';
}

interface UsePartsSearchOptions {
  searchMode: SearchMode;
  searchParams: SearchRequest | null;
  batteryFilters: BatteryFilters;
  materialFilters: MaterialFilters;
  selectedCategory: string;
}

interface UsePartsSearchResult {
  data: SearchResponse | null | undefined;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Custom hook for AI-powered parts search
 * Supports AI semantic search, battery SOH search, and material property search
 */
export function usePartsSearch({
  searchMode,
  searchParams,
  batteryFilters,
  materialFilters,
  selectedCategory,
}: UsePartsSearchOptions): UsePartsSearchResult {
  // AI semantic search
  const {
    data: aiData,
    error: aiError,
    isLoading: aiLoading,
  } = useQuery({
    queryKey: ['search', searchParams],
    queryFn: async () => {
      if (!searchParams) return null;

      const response = await fetch(getApiUrl('search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('검색에 실패했습니다');
      }

      return response.json() as Promise<SearchResponse>;
    },
    enabled: !!searchParams && searchMode === 'ai',
  });

  // Battery SOH search
  const {
    data: batteryData,
    error: batteryError,
    isLoading: batteryLoading,
  } = useQuery({
    queryKey: ['battery-assessment', batteryFilters.sohMin, batteryFilters.sohMax, batteryFilters.cathodeTypes],
    queryFn: async () => {
      const filters: any = {
        soh: { min: batteryFilters.sohMin, max: batteryFilters.sohMax }
      };

      if (batteryFilters.cathodeTypes.length > 0) {
        filters.cathodeType = batteryFilters.cathodeTypes;
      }

      const response = await fetch(getApiUrl('battery-health'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batteryFilters: filters, topK: 20 }),
      });

      if (!response.ok) {
        throw new Error('배터리 검색에 실패했습니다');
      }

      const result = await response.json();
      return result.data as SearchResponse;
    },
    enabled: searchMode === 'battery' && !!searchParams,
  });

  // Material property search
  const {
    data: materialData,
    error: materialError,
    isLoading: materialLoading,
  } = useQuery({
    queryKey: ['material-search', materialFilters.alloyNumber, materialFilters.tensileStrengthMin, materialFilters.recyclabilityMin, selectedCategory],
    queryFn: async () => {
      const filters: any = {};

      if (materialFilters.alloyNumber) {
        filters.alloyNumber = materialFilters.alloyNumber;
      }
      if (materialFilters.tensileStrengthMin !== '') {
        filters.tensileStrengthMPa = { min: Number(materialFilters.tensileStrengthMin) };
      }
      if (materialFilters.recyclabilityMin !== '') {
        filters.recyclability = { min: Number(materialFilters.recyclabilityMin) };
      }

      const payload: any = { materialFilters: filters, topK: 20 };
      if (selectedCategory !== 'all') {
        payload.category = categoryMap[selectedCategory] || selectedCategory;
      }

      const response = await fetch(getApiUrl('material-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('재질 검색에 실패했습니다');
      }

      const result = await response.json();
      return result.data as SearchResponse;
    },
    enabled: searchMode === 'material' && !!searchParams &&
      (!!materialFilters.alloyNumber || materialFilters.tensileStrengthMin !== '' || materialFilters.recyclabilityMin !== ''),
  });

  // Return data based on search mode
  switch (searchMode) {
    case 'battery':
      return {
        data: batteryData,
        error: batteryError,
        isLoading: batteryLoading,
      };
    case 'material':
      return {
        data: materialData,
        error: materialError,
        isLoading: materialLoading,
      };
    case 'ai':
    default:
      return {
        data: aiData,
        error: aiError,
        isLoading: aiLoading,
      };
  }
}
