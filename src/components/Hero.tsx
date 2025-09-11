'use client';

import { useEffect, useState } from 'react';
import { ContentBlock } from '@/types/database';

interface HeroProps {
  className?: string;
}

export function Hero({ className = '' }: HeroProps) {
  const [heroContent, setHeroContent] = useState<ContentBlock | null>(null);
  const [socialLinks, setSocialLinks] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const [heroResponse, socialResponse] = await Promise.all([
          fetch('/api/content/hero_intro'),
          fetch('/api/content/social_links')
        ]);

        if (heroResponse.ok) {
          const heroData = await heroResponse.json();
          setHeroContent(heroData);
        }

        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          setSocialLinks(socialData);
        }
      } catch (err) {
        console.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return (
    <section className={`bg-gradient-to-r from-campaign-400 to-campaign-600 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Photo */}
          <div className="lg:w-1/3">
            {heroContent?.photo_large && heroContent.photo_large !== 'data:image/jpeg;base64,placeholder_hero_photo' ? (
              <img
                src={heroContent.photo_large}
                alt={heroContent.photo_alt || 'Cadence Collins'}
                className="w-full max-w-sm mx-auto rounded-full shadow-2xl"
              />
            ) : (
              <div className="w-full max-w-sm mx-auto aspect-square bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white/60">Photo Coming Soon</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="lg:w-2/3 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cadence Collins
            </h1>
            <h2 className="text-xl md:text-2xl mb-8 text-white">
              For School Board
            </h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-white/20 rounded w-2/3"></div>
              </div>
            ) : (
              <p className="text-lg md:text-xl mb-12 max-w-3xl text-white">
                {heroContent?.content || "Building stronger schools, supporting our teachers, and ensuring every child has the opportunity to succeed."}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#contact"
                className="bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors"
              >
                Join Our Campaign
              </a>
              <a
                href="#bio"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-campaign-600 transition-colors"
              >
                Learn More
              </a>
              {socialLinks?.donation_link && (
                <a
                  href={socialLinks.donation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Donate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}