export interface ProcessedImage {
  large: string;
  medium: string;
  small: string;
  metadata: {
    originalName: string;
    originalSize: number;
    processedSizes: {
      large: { width: number; height: number; size: number };
      medium: { width: number; height: number; size: number };
      small: { width: number; height: number; size: number };
    };
    processedAt: string;
  };
}

export interface ImageSizeConfig {
  width: number;
  height?: number;
  quality: number;
}

export const IMAGE_CONFIGS = {
  hero: {
    large: { width: 800, quality: 0.85 },
    medium: { width: 400, quality: 0.8 },
    small: { width: 150, quality: 0.75 }
  },
  family: {
    large: { width: 1200, quality: 0.85 },
    medium: { width: 600, quality: 0.8 },
    small: { width: 150, quality: 0.75 }
  }
} as const;

/**
 * Resize an image file to multiple sizes for responsive display
 */
export async function processImageFile(
  file: File, 
  type: 'hero' | 'family' = 'hero'
): Promise<ProcessedImage> {
  const config = IMAGE_CONFIGS[type];
  
  // Create image element to get dimensions
  const img = await createImageFromFile(file);
  
  // Process each size
  const [large, medium, small] = await Promise.all([
    resizeImage(img, config.large, file.type),
    resizeImage(img, config.medium, file.type),
    resizeImage(img, config.small, file.type)
  ]);

  return {
    large: large.dataUrl,
    medium: medium.dataUrl,
    small: small.dataUrl,
    metadata: {
      originalName: file.name,
      originalSize: file.size,
      processedSizes: {
        large: { width: large.width, height: large.height, size: large.size },
        medium: { width: medium.width, height: medium.height, size: medium.size },
        small: { width: small.width, height: small.height, size: small.size }
      },
      processedAt: new Date().toISOString()
    }
  };
}

/**
 * Create an HTML Image element from a File
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Resize an image using Canvas API
 */
function resizeImage(
  img: HTMLImageElement, 
  config: ImageSizeConfig,
  originalType?: string
): Promise<{ dataUrl: string; width: number; height: number; size: number }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = img.width / img.height;
    let { width, height } = config;
    
    if (!height) {
      height = width / aspectRatio;
    } else {
      // If both width and height specified, use the one that maintains aspect ratio
      const ratioByWidth = width / aspectRatio;
      const ratioByHeight = height * aspectRatio;
      
      if (ratioByWidth <= height) {
        height = ratioByWidth;
      } else {
        width = ratioByHeight;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Enable smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to base64 with compression
    // Preserve PNG format for transparency, use JPEG for others
    const outputFormat = originalType === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = originalType === 'image/png' ? 1.0 : config.quality; // PNG doesn't support quality, use 1.0
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              width,
              height,
              size: blob.size
            });
          };
          reader.readAsDataURL(blob);
        }
      },
      outputFormat,
      quality
    );
  });
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  // Check file type is supported
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please use JPEG, PNG, WebP, or GIF.' };
  }
  
  return { valid: true };
}

/**
 * Get responsive image sources for different screen sizes
 */
export function getResponsiveImageSources(processedImage: ProcessedImage) {
  return {
    srcSet: `${processedImage.small} 150w, ${processedImage.medium} 600w, ${processedImage.large} 1200w`,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    src: processedImage.large, // fallback
  };
}

/**
 * Calculate total size savings from processing
 */
export function calculateSizeSavings(metadata: ProcessedImage['metadata']) {
  const totalProcessedSize = 
    metadata.processedSizes.large.size + 
    metadata.processedSizes.medium.size + 
    metadata.processedSizes.small.size;
  
  const originalSize = metadata.originalSize;
  const savings = originalSize - totalProcessedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
  
  return {
    original: formatFileSize(originalSize),
    processed: formatFileSize(totalProcessedSize),
    savings: formatFileSize(savings),
    savingsPercent: `${savingsPercent}%`
  };
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}