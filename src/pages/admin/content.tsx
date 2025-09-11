'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContentBlock, ContentForm, SocialLinksForm } from '@/types/database';
import AdminLayout from '@/components/admin/AdminLayout';
import { ImageUpload } from '@/components/ImageUpload';
import { ProcessedImage } from '@/lib/imageProcessing';

interface AdminContentPageProps {}

export default function AdminContentPage({}: AdminContentPageProps) {
  const [contentBlocks, setContentBlocks] = useState<Record<string, ContentBlock>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const sections = [
    { key: 'hero_intro', title: 'Hero Section', description: 'Main hero message and photo' },
    { key: 'bio', title: 'Biography', description: 'About Cadence Collins section' },
    { key: 'policy', title: 'Policy', description: 'Policy priorities and positions' },
    { key: 'contact', title: 'Contact', description: 'Contact information and call-to-action' },
    { key: 'social_links', title: 'Social Links', description: 'Social media and donation links' },
  ];

  const {
    register: registerHeroIntro,
    handleSubmit: handleSubmitHeroIntro,
    setValue: setValueHeroIntro,
    reset: resetHeroIntro,
    formState: { errors: errorsHeroIntro },
  } = useForm<ContentForm>();

  const {
    register: registerBio,
    handleSubmit: handleSubmitBio,
    setValue: setValueBio,
    reset: resetBio,
    formState: { errors: errorsBio },
  } = useForm<ContentForm>();

  const {
    register: registerPolicy,
    handleSubmit: handleSubmitPolicy,
    setValue: setValuePolicy,
    formState: { errors: errorsPolicy },
  } = useForm<ContentForm>();

  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    setValue: setValueContact,
    formState: { errors: errorsContact },
  } = useForm<ContentForm>();

  const {
    register: registerSocialLinks,
    handleSubmit: handleSubmitSocialLinks,
    setValue: setValueSocialLinks,
    formState: { errors: errorsSocialLinks },
  } = useForm<SocialLinksForm>();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      const responses = await Promise.all([
        fetch('/api/content/hero_intro'),
        fetch('/api/content/bio'),
        fetch('/api/content/policy'),
        fetch('/api/content/contact'),
        fetch('/api/content/social_links'),
      ]);

      const contentData: Record<string, ContentBlock> = {};

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const section = sections[i].key;
        
        if (response.ok) {
          const data = await response.json();
          contentData[section] = data;
          
          // Set form values
          if (section === 'hero_intro') {
            resetHeroIntro({
              title: data.title || '',
              content: data.content || '',
              photo_alt: data.photo_alt || ''
            });
          } else if (section === 'bio') {
            resetBio({
              title: data.title || '',
              content: data.content || ''
            });
          } else if (section === 'policy') {
            setValuePolicy('title', data.title);
            setValuePolicy('content', data.content);
            setValuePolicy('photo_alt', data.photo_alt || '');
          } else if (section === 'contact') {
            setValueContact('title', data.title);
            setValueContact('content', data.content);
          } else if (section === 'social_links') {
            // Parse JSON content for social links
            try {
              const socialData = JSON.parse(data.content || '{}');
              setValueSocialLinks('email', socialData.email || 'cadenceforschoolboard@gmail.com');
              setValueSocialLinks('facebook', socialData.facebook || 'https://www.facebook.com/profile.php?id=61578333433751');
              setValueSocialLinks('instagram', socialData.instagram || 'https://instagram.com/cadence.collins.cares');
              setValueSocialLinks('tiktok', socialData.tiktok || 'https://tiktok.com/@cadenceoxoxo');
              setValueSocialLinks('donation_link', socialData.donation_link || 'https://secure.actblue.com/donate/cadence-collins-cares');
            } catch (e) {
              // Set defaults if parsing fails
              setValueSocialLinks('email', 'cadenceforschoolboard@gmail.com');
              setValueSocialLinks('facebook', 'https://www.facebook.com/profile.php?id=61578333433751');
              setValueSocialLinks('instagram', 'https://instagram.com/cadence.collins.cares');
              setValueSocialLinks('tiktok', 'https://tiktok.com/@cadenceoxoxo');
              setValueSocialLinks('donation_link', 'https://secure.actblue.com/donate/cadence-collins-cares');
            }
          }
        }
      }

      setContentBlocks(contentData);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (section: string, data: ContentForm | SocialLinksForm) => {
    setSaving(section);
    
    try {
      const token = localStorage.getItem('admin_token');
      const currentContent = contentBlocks[section];
      
      let saveData;
      
      if (section === 'social_links') {
        // For social links, convert individual fields to JSON content
        const socialLinksData = data as SocialLinksForm;
        const socialData = {
          email: socialLinksData.email || 'cadenceforschoolboard@gmail.com',
          facebook: socialLinksData.facebook || 'https://www.facebook.com/profile.php?id=61578333433751',
          instagram: socialLinksData.instagram || 'https://instagram.com/cadence.collins.cares',
          tiktok: socialLinksData.tiktok || 'https://tiktok.com/@cadenceoxoxo',
          donation_link: socialLinksData.donation_link || 'https://secure.actblue.com/donate/cadence-collins-cares'
        };
        
        saveData = {
          title: 'Social Links',
          content: JSON.stringify(socialData)
        };
      } else {
        // Include the current image data in the save request for other sections
        saveData = {
          ...data,
          photo_large: currentContent?.photo_large || null,
          photo_medium: currentContent?.photo_medium || null,
          photo_small: currentContent?.photo_small || null,
          photo_metadata: currentContent?.photo_metadata && Object.keys(currentContent.photo_metadata).length > 0 ? currentContent.photo_metadata : null,
          photo_alt: currentContent?.photo_alt || null
        };
      }
      
      const response = await fetch(`/api/admin/content/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        const updatedContent = await response.json();
        setContentBlocks(prev => ({ ...prev, [section]: updatedContent }));
        setMessage({ type: 'success', text: 'Content updated successfully' });
      } else {
        const result = await response.json();
        if (result.errors) {
          setMessage({ type: 'error', text: result.errors.map((e: any) => e.message).join(', ') });
        } else {
          setMessage({ type: 'error', text: result.message || 'Failed to update content' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(null);
    }
  };

  const getFormProps = (section: string) => {
    switch (section) {
      case 'hero_intro':
        return { register: registerHeroIntro, handleSubmit: handleSubmitHeroIntro, errors: errorsHeroIntro };
      case 'bio':
        return { register: registerBio, handleSubmit: handleSubmitBio, errors: errorsBio };
      case 'policy':
        return { register: registerPolicy, handleSubmit: handleSubmitPolicy, errors: errorsPolicy };
      case 'contact':
        return { register: registerContact, handleSubmit: handleSubmitContact, errors: errorsContact };
      case 'social_links':
        return { register: registerSocialLinks, handleSubmit: handleSubmitSocialLinks, errors: errorsSocialLinks };
      default:
        return { register: registerBio, handleSubmit: handleSubmitBio, errors: errorsBio };
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Content Management">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded mb-4"></div>
              <div className="h-24 bg-gray-300 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Management">
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="text-sm opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {sections.map((section) => {
          const content = contentBlocks[section.key];
          const { register, handleSubmit, errors } = getFormProps(section.key);
          
          return (
            <div key={section.key} className="border border-gray-200 rounded-lg p-6">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {section.description}
                </p>
              </div>

              <form
                onSubmit={handleSubmit((data) => handleSaveContent(section.key, data))}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {section.key !== 'social_links' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          {...(register as any)('title', { required: 'Title is required' })}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                        />
                        {(errors as any).title && (
                          <p className="mt-1 text-sm text-red-600">{(errors as any).title.message}</p>
                        )}
                      </div>
                    )}

                    {section.key === 'social_links' ? (
                      // Custom form fields for social links
                      <div className="space-y-4">
                        {(() => {
                          let socialData;
                          try {
                            socialData = content?.content ? JSON.parse(content.content) : {};
                          } catch {
                            socialData = {};
                          }
                          
                          return (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email Address
                                </label>
                                <input
                                  {...(register as any)('email')}
                                  type="email"
                                  defaultValue={socialData.email || 'cadenceforschoolboard@gmail.com'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                                  placeholder="cadenceforschoolboard@gmail.com"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Facebook URL
                                </label>
                                <input
                                  {...(register as any)('facebook')}
                                  type="url"
                                  defaultValue={socialData.facebook || 'https://www.facebook.com/profile.php?id=61578333433751'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                                  placeholder="https://facebook.com/..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Instagram URL
                                </label>
                                <input
                                  {...(register as any)('instagram')}
                                  type="url"
                                  defaultValue={socialData.instagram || 'https://instagram.com/cadence.collins.cares'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                                  placeholder="https://instagram.com/..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  TikTok URL
                                </label>
                                <input
                                  {...(register as any)('tiktok')}
                                  type="url"
                                  defaultValue={socialData.tiktok || 'https://tiktok.com/@cadenceoxoxo'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                                  placeholder="https://tiktok.com/@..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Donation URL (ActBlue)
                                </label>
                                <input
                                  {...(register as any)('donation_link')}
                                  type="url"
                                  defaultValue={socialData.donation_link || 'https://secure.actblue.com/donate/cadence-collins-cares'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                                  placeholder="https://secure.actblue.com/donate/..."
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      // Regular content textarea for other sections
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                          {section.key === 'policy' && (
                            <span className="text-gray-500 text-xs ml-1">
                              (Use • for bullet points)
                            </span>
                          )}
                        </label>
                        <textarea
                          {...(register as any)('content', { required: 'Content is required' })}
                          rows={section.key === 'policy' ? 12 : 8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87ceeb] focus:border-transparent"
                          placeholder={
                            section.key === 'policy'
                              ? '• Priority 1\n• Priority 2\n• Priority 3'
                              : `Enter ${section.title.toLowerCase()} content here...`
                          }
                        />
                        {(errors as any).content && (
                          <p className="mt-1 text-sm text-red-600">{(errors as any).content.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Photo upload for sections that support photos */}
                  {(section.key === 'hero_intro' || section.key === 'policy' || section.key === 'bio') && (
                    <div className="lg:col-span-1">
                      <ImageUpload
                        currentImage={content?.photo_large ? {
                          large: content.photo_large,
                          medium: content.photo_medium || content.photo_large,
                          small: content.photo_small || content.photo_large,
                          metadata: content.photo_metadata || {
                            originalName: 'uploaded-image',
                            originalSize: 0,
                            processedSizes: {
                              large: { width: 800, height: 600, size: 0 },
                              medium: { width: 400, height: 300, size: 0 },
                              small: { width: 150, height: 112, size: 0 }
                            },
                            processedAt: new Date().toISOString()
                          }
                        } : null}
                        onImageProcessed={(processedImage: ProcessedImage) => {
                          // Store the processed image data in the form
                          const photoData = {
                            photo_large: processedImage.large,
                            photo_medium: processedImage.medium,
                            photo_small: processedImage.small,
                            photo_metadata: processedImage.metadata
                          };
                          
                          // Update the content state to reflect the new image
                          setContentBlocks(prev => ({
                            ...prev,
                            [section.key]: {
                              ...prev[section.key],
                              ...photoData
                            }
                          }));
                        }}
                        imageType={section.key === 'hero_intro' ? 'hero' : 'family'}
                        altText={content?.photo_alt || ''}
                        onAltTextChange={(altText: string) => {
                          // Update alt text in real-time
                          setContentBlocks(prev => ({
                            ...prev,
                            [section.key]: {
                              ...prev[section.key],
                              photo_alt: altText
                            }
                          }));
                        }}
                        className="h-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {content?.updated_at && (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Last updated: {new Date(content.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving === section.key}
                    className="bg-gradient-to-r from-[#87ceeb] to-[#ff7f50] hover:from-[#87ceeb]/90 hover:to-[#ff7f50]/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === section.key ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}

// Export for compatibility with test imports
export { AdminContentPage };