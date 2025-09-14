'use client';

import { useEffect, useState } from 'react';
import { ContentBlock } from '@/types/database';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [contactContent, setContactContent] = useState<ContentBlock | null>(null);
  const [footerLeftContent, setFooterLeftContent] = useState<ContentBlock | null>(null);
  const [footerSignature, setFooterSignature] = useState<ContentBlock | null>(null);

  useEffect(() => {
    async function fetchFooterContent() {
      try {
        // Fetch all footer content in parallel
        const [contactRes, footerLeftRes, signatureRes] = await Promise.all([
          fetch('/api/content/contact'),
          fetch('/api/content/footer_left'),
          fetch('/api/content/footer_signature')
        ]);

        if (contactRes.ok) {
          const data = await contactRes.json();
          setContactContent(data);
        }

        if (footerLeftRes.ok) {
          const data = await footerLeftRes.json();
          setFooterLeftContent(data);
        }

        if (signatureRes.ok) {
          const data = await signatureRes.json();
          setFooterSignature(data);
        }
      } catch (err) {
        console.error('Failed to load footer content:', err);
      }
    }

    fetchFooterContent();
  }, []);

  return (
    <footer className={`bg-campaign-600 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Campaign Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {footerLeftContent?.title || 'Cadence Collins'}
            </h3>
            {footerLeftContent?.subtitle && (
              <p className="text-campaign-100 mb-4">
                {footerLeftContent.subtitle}
              </p>
            )}
            <p className="text-campaign-200 text-sm">
              {footerLeftContent?.content || 'Building stronger schools for our community.'}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {contactContent?.title || 'Get in Touch'}
            </h3>
            <div className="text-campaign-200 text-sm">
              {contactContent?.content ? (
                <p className="whitespace-pre-wrap">{contactContent.content}</p>
              ) : (
                <p>Contact information will be available soon.</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <SocialLinks className="justify-start" />
          </div>
        </div>

        <div className="border-t border-campaign-700 mt-8 pt-8 text-center text-campaign-200 text-sm">
          <p>
            {footerSignature?.content || `© ${new Date().getFullYear()} Cadence Collins for School Board. Paid for by Friends of Cadence Collins.`}
          </p>
          <p className="mt-4">
            Website Designed & Built by{' '}
            <a
              href="https://thefavrs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-campaign-100 hover:text-white transition-colors underline"
            >
              TheFavrs.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}