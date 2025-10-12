'use client'
import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import HeroSectionOptimized from '@/components/features/landing/HeroSectionOptimized'
import FeaturedProducts from '@/components/features/landing/FeaturedProducts'
import FeaturedCollections from '@/components/features/landing/FeaturedCollections'
import CuratedUseCases from '@/components/features/landing/CuratedUseCases'
import QuickFilters from '@/components/features/landing/QuickFilters'
import CreatorSpotlights from '@/components/features/landing/CreatorSpotlights'
import BlogHighlights from '@/components/features/landing/BlogHighlights'

export default function HomePage() {
  const { track } = useAnalytics()

  useEffect(() => {
    // Track homepage view
    track.engagement.pageViewed('/', 'landing');
    
    // Track landing page load performance
    const startTime = performance.now();
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      track.system.pageLoadTime('/', loadTime);
    };
    
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }

    // Track landing page engagement metrics
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track scroll milestones
      if (scrollPercentage >= 25 && !window.landingPageTracked?.scroll25) {
        track.engagement.featureUsed('landing_page_scroll_milestone', {
          milestone: '25%',
          source: 'homepage'
        });
        window.landingPageTracked = { ...(window.landingPageTracked || {}), scroll25: true };
      }
      
      if (scrollPercentage >= 50 && !window.landingPageTracked?.scroll50) {
        track.engagement.featureUsed('landing_page_scroll_milestone', {
          milestone: '50%',
          source: 'homepage'
        });
        window.landingPageTracked = { ...(window.landingPageTracked || {}), scroll50: true };
      }
      
      if (scrollPercentage >= 75 && !window.landingPageTracked?.scroll75) {
        track.engagement.featureUsed('landing_page_scroll_milestone', {
          milestone: '75%',
          source: 'homepage'
        });
        window.landingPageTracked = { ...(window.landingPageTracked || {}), scroll75: true };
      }
      
      if (scrollPercentage >= 90 && !window.landingPageTracked?.scroll90) {
        track.engagement.featureUsed('landing_page_scroll_milestone', {
          milestone: '90%',
          source: 'homepage'
        });
        window.landingPageTracked = { ...(window.landingPageTracked || {}), scroll90: true };
      }
    };

    // Track time spent on page
    const startTimeOnPage = Date.now();
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeOnPage) / 1000);
      track.engagement.featureUsed('landing_page_time_spent', {
        time_seconds: timeSpent,
        source: 'homepage'
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [track]);

  return (
    <div className="min-h-screen bg-brand-dark">
      <HeroSectionOptimized />
      <div className="space-y-0">
        <FeaturedProducts />
        <FeaturedCollections />
        <CuratedUseCases />
        <QuickFilters />
        <CreatorSpotlights />
        <BlogHighlights />
      </div>
    </div>
  )
}