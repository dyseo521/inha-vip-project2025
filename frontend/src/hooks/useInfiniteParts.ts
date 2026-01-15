import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { Part } from '@shared/index';
import { mockParts } from '../data/mockParts';
import { getApiUrl } from '../config';
import { categoryMap, convertMockPartToPart } from '../constants/categoryImages';

interface UseInfinitePartsOptions {
  selectedCategory: string;
  enabled?: boolean;
}

interface UseInfinitePartsResult {
  parts: Part[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadMoreRef: (node?: Element | null) => void;
  fetchNextPage: () => void;
}

/**
 * Custom hook for infinite scroll parts list
 * Supports category filtering and fallback to mock data
 */
export function useInfiniteParts({
  selectedCategory,
  enabled = true,
}: UseInfinitePartsOptions): UseInfinitePartsResult {
  const {
    data: partsData,
    isLoading,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['parts', selectedCategory],
    queryFn: async ({ pageParam }) => {
      try {
        const category = selectedCategory !== 'all'
          ? categoryMap[selectedCategory] || selectedCategory
          : undefined;

        const params = new URLSearchParams({
          limit: '20',
          ...(category && { category }),
          ...(pageParam && { cursor: pageParam }),
        });

        const response = await fetch(getApiUrl(`parts?${params}`));

        if (!response.ok) {
          throw new Error('부품 목록을 불러오는데 실패했습니다');
        }

        return response.json() as Promise<{ parts: Part[]; count: number; nextCursor: string | null }>;
      } catch (error) {
        // API 호출 실패 시 mock 데이터 사용 (정적 호스팅 대응)
        console.log('API 호출 실패, mock 데이터 사용:', error);

        const convertedParts = mockParts.map(convertMockPartToPart);
        let filteredParts = convertedParts;
        if (selectedCategory !== 'all') {
          const category = categoryMap[selectedCategory] || selectedCategory;
          filteredParts = convertedParts.filter(part => part.category === category);
        }

        // Sort by createdAt descending
        filteredParts.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        return {
          parts: filteredParts,
          count: filteredParts.length,
          nextCursor: null,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });

  // Intersection Observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into single array
  const parts = partsData?.pages.flatMap(page => page.parts) ?? [];

  return {
    parts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
    fetchNextPage,
  };
}
