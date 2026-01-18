import { useCallback } from 'react';
import { categoryDefaultImages } from '../constants/categoryImages';

/**
 * 이미지 에러 핸들러 커스텀 훅
 * 이미 fallback으로 설정되었는지 체크하여 무한 루프 방지
 */
export function useImageErrorHandler(category: string) {
  return useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const defaultImg = categoryDefaultImages[category] || '/image/car_body_1.jpg';
      if (e.currentTarget.src !== window.location.origin + defaultImg) {
        e.currentTarget.src = defaultImg;
      }
    },
    [category]
  );
}

/**
 * 이미지 에러 핸들러 생성 함수 (루프 내 사용을 위한 비훅 버전)
 */
export function createImageErrorHandler(category: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const defaultImg = categoryDefaultImages[category] || '/image/car_body_1.jpg';
    if (e.currentTarget.src !== window.location.origin + defaultImg) {
      e.currentTarget.src = defaultImg;
    }
  };
}

/**
 * 카테고리별 기본 이미지 반환
 */
export function getDefaultImage(category: string): string {
  return categoryDefaultImages[category] || '/image/car_body_1.jpg';
}
