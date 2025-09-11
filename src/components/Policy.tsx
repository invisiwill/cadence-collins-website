'use client';

import { useEffect, useState } from 'react';
import { ContentBlock } from '@/types/database';

interface PolicyProps {
  className?: string;
}

export function Policy({ className = '' }: PolicyProps) {
  const [content, setContent] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolicyContent() {
      try {
        const response = await fetch('/api/content/policy');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          setError('Failed to load policy content');
        }
      } catch (err) {
        setError('Failed to load policy content');
      } finally {
        setLoading(false);
      }
    }

    fetchPolicyContent();
  }, []);

  if (loading) {
    return (
      <section id="policy" className={`py-16 bg-campaign-50 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6 mx-auto"></div>
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
      <section id="policy" className={`py-16 bg-campaign-50 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Format bullet points from content
  const formatBulletPoints = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="flex items-start">
            <span className="text-accent-500 mr-3 mt-1">•</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </li>
        );
      }
      return <p key={index} className="mb-4">{line}</p>;
    });
  };

  return (
    <section id="policy" className={`py-16 bg-campaign-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-campaign-600 mb-8">
            {content?.title || 'Policy Priorities'}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Family Photo */}
            <div className="order-2 md:order-1">
              {content?.photo_large && content.photo_large !== 'data:image/jpeg;base64,placeholder_family_photo' ? (
                <img
                  src={content.photo_large}
                  alt={content.photo_alt || 'Cadence Collins family'}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Family Photo Coming Soon</span>
                </div>
              )}
            </div>
            
            {/* Policy Content */}
            <div className="order-1 md:order-2 text-left">
              <ul className="space-y-4 text-gray-700 text-lg">
                {content?.content && formatBulletPoints(content.content)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}