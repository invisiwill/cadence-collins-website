'use client';

import { useCallback, useState } from 'react';
import { processImageFile, validateImageFile, ProcessedImage, calculateSizeSavings, formatFileSize, getResponsiveImageSources } from '@/lib/imageProcessing';

interface ImageUploadProps {
  currentImage?: ProcessedImage | null;
  onImageProcessed: (processedImage: ProcessedImage) => void;
  imageType: 'hero' | 'family';
  altText: string;
  onAltTextChange: (altText: string) => void;
  className?: string;
}

export function ImageUpload({
  currentImage,
  onImageProcessed,
  imageType,
  altText,
  onAltTextChange,
  className = ''
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setError(null);
    setProcessing(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const processedImage = await processImageFile(file, imageType);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onImageProcessed(processedImage);
        setProcessing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      setProcessing(false);
      setProgress(0);
    }
  }, [imageType, onImageProcessed]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const responsiveProps = currentImage ? getResponsiveImageSources(currentImage) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      {currentImage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Photo
          </label>
          <div className="relative">
            <img
              {...(responsiveProps || { src: currentImage.large })}
              alt={altText}
              className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {currentImage.metadata?.processedSizes?.large?.width || 'N/A'}×{currentImage.metadata?.processedSizes?.large?.height || 'N/A'}
            </div>
          </div>
          
          {/* Image Metadata */}
          <div className="mt-2 text-xs text-gray-500">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <strong>Large:</strong> {currentImage.metadata?.processedSizes?.large?.width || 'N/A'}×{currentImage.metadata?.processedSizes?.large?.height || 'N/A'}
                <br />
                {currentImage.metadata?.processedSizes?.large?.size ? formatFileSize(currentImage.metadata.processedSizes.large.size) : 'N/A'}
              </div>
              <div>
                <strong>Medium:</strong> {currentImage.metadata?.processedSizes?.medium?.width || 'N/A'}×{currentImage.metadata?.processedSizes?.medium?.height || 'N/A'}
                <br />
                {currentImage.metadata?.processedSizes?.medium?.size ? formatFileSize(currentImage.metadata.processedSizes.medium.size) : 'N/A'}
              </div>
              <div>
                <strong>Small:</strong> {currentImage.metadata?.processedSizes?.small?.width || 'N/A'}×{currentImage.metadata?.processedSizes?.small?.height || 'N/A'}
                <br />
                {currentImage.metadata?.processedSizes?.small?.size ? formatFileSize(currentImage.metadata.processedSizes.small.size) : 'N/A'}
              </div>
            </div>
            {currentImage.metadata.originalSize && (
              <div className="mt-1">
                <strong>Size Savings:</strong> {calculateSizeSavings(currentImage.metadata).savingsPercent}
                ({calculateSizeSavings(currentImage.metadata).savings} saved)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {currentImage ? 'Replace Photo' : 'Upload Photo'}
        </label>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-campaign-500 bg-campaign-50'
              : processing
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-campaign-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={processing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          {processing ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campaign-500 mx-auto"></div>
              <p className="text-sm text-gray-600">Processing image...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-campaign-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <p>
                  <span className="font-medium text-campaign-600 hover:text-campaign-500">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
              </div>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP or GIF up to 10MB
              </p>
              <p className="text-xs text-gray-500">
                Will be automatically resized for optimal performance
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Alt Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
          <span className="text-gray-500 text-xs ml-1">(for accessibility)</span>
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => onAltTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campaign-500 focus:border-transparent"
          placeholder="Describe the image for screen readers..."
        />
      </div>
    </div>
  );
}