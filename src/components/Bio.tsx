'use client';

import { useEffect, useState } from 'react';
import { ContentBlock } from '@/types/database';

interface BioProps {
  className?: string;
}

export function Bio({ className = '' }: BioProps) {
  const [content, setContent] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBioContent() {
      try {
        const response = await fetch('/api/content/bio');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          setError('Failed to load bio content');
        }
      } catch (err) {
        setError('Failed to load bio content');
      } finally {
        setLoading(false);
      }
    }

    fetchBioContent();
  }, []);

  if (loading) {
    return (
      <section id="bio" className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="bio" className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="bio" className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-campaign-600">
            {content?.title || 'About Cadence'}
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content - Left Side */}
          <div className="lg:w-2/3 text-left">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{content?.content}</p>
            </div>
          </div>
          
          {/* Photo - Right Side */}
          <div className="lg:w-1/3">
            {content?.photo_large && content.photo_large !== 'data:image/jpeg;base64,placeholder_bio_photo' ? (
              <img
                src={content.photo_large}
                alt={content.photo_alt || 'Cadence Collins'}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full max-w-md mx-auto aspect-[4/5] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Photo Coming Soon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}