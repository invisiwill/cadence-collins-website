'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Bio } from '@/components/Bio';
import { EventsList } from '@/components/EventsList';
import { Policy } from '@/components/Policy';
import { MailingListForm } from '@/components/MailingListForm';
import { Footer } from '@/components/Footer';
import { ContentBlock } from '@/types/database';

export default function Home() {
  const [socialData, setSocialData] = useState<ContentBlock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSocialData() {
      try {
        const response = await fetch('/api/content/social_links');
        if (response.ok) {
          const data = await response.json();
          setSocialData(data);
        }
      } catch (error) {
        console.error('Failed to load social data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSocialData();
  }, []);
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Bio />
      <EventsList />
      <Policy />
      
      {/* Contact Section with Mailing List */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-campaign-600 mb-6">
              Get Involved
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Your voice matters in building better schools for our community. 
              Join our campaign and help make a difference in our children's education.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Mailing List Form - Left Side */}
            <div className="lg:w-1/2">
              <MailingListForm />
            </div>
            
            {/* Contact Info and Social Links - Right Side */}
            <div className="lg:w-1/2 space-y-8 text-center">
              <div>
                <h3 className="text-xl font-semibold text-campaign-600 mb-4">Contact Cadence</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${socialData?.email || 'cadenceforschoolboard@gmail.com'}`} className="text-gray-700 hover:text-campaign-600">
                      {socialData?.email || 'cadenceforschoolboard@gmail.com'}
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-campaign-600 mb-4">Connect With Us</h3>
                <div className="flex space-x-4 mb-6 justify-center">
                  <a href={socialData?.facebook || "https://www.facebook.com/profile.php?id=61578333433751"} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-campaign-100 transition-colors">
                    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href={socialData?.instagram || "https://instagram.com/cadence.collins.cares"} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-campaign-100 transition-colors">
                    <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href={socialData?.tiktok || "https://tiktok.com/@cadenceoxoxo"} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-full hover:bg-campaign-100 transition-colors">
                    <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.35-1.998-1.35-3.217V1H13.15v14.83c0 1.415-.849 2.632-2.066 3.183a3.417 3.417 0 0 1-1.35.272c-1.893 0-3.433-1.54-3.433-3.433s1.54-3.433 3.433-3.433c.387 0 .772.067 1.137.202V9.408a6.65 6.65 0 0 0-1.137-.101c-3.676 0-6.653 2.977-6.653 6.653s2.977 6.653 6.653 6.653c3.676 0 6.653-2.977 6.653-6.653V8.895a9.349 9.349 0 0 0 5.452 1.724V7.406c-1.137 0-2.2-.387-3.047-1.034-.678-.516-1.238-1.199-1.622-1.99z"/>
                    </svg>
                  </a>
                </div>
                
                <a 
                  href={socialData?.donation_link || "https://secure.actblue.com/donate/cadence-collins-cares"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-campaign-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-campaign-600 hover:to-accent-600 transition-colors"
                >
                  Donate to the Campaign
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}