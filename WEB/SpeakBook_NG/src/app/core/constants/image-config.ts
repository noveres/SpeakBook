/**
 * 圖片和熱區容器的統一配置
 * 確保在編輯器和詳情頁中熱區位置一致
 */
export const IMAGE_CONFIG = {
  // 標準容器尺寸 (3:4 比例)
  CONTAINER_WIDTH: 600,
  CONTAINER_HEIGHT: 800,
  
  // 最大尺寸限制
  MAX_WIDTH: 600,
  MAX_HEIGHT: 800,
  
  // 寬高比
  ASPECT_RATIO: 3 / 4,
  
  // 圖片適應模式
  OBJECT_FIT: 'contain' as const,
} as const;

/**
 * 計算圖片在容器中的實際顯示尺寸
 */
export function calculateImageDimensions(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number = IMAGE_CONFIG.CONTAINER_WIDTH,
  containerHeight: number = IMAGE_CONFIG.CONTAINER_HEIGHT
): { width: number; height: number; offsetX: number; offsetY: number } {
  const imageRatio = imageWidth / imageHeight;
  const containerRatio = containerWidth / containerHeight;

  let displayWidth: number;
  let displayHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > containerRatio) {
    // 圖片較寬,以寬度為準
    displayWidth = containerWidth;
    displayHeight = containerWidth / imageRatio;
    offsetY = (containerHeight - displayHeight) / 2;
  } else {
    // 圖片較高,以高度為準
    displayHeight = containerHeight;
    displayWidth = containerHeight * imageRatio;
    offsetX = (containerWidth - displayWidth) / 2;
  }

  return {
    width: displayWidth,
    height: displayHeight,
    offsetX,
    offsetY,
  };
}
