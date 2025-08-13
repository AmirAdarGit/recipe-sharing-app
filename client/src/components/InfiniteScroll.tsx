import React, { useEffect, useRef, useCallback } from 'react';
import './InfiniteScroll.css';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => void;
  loading: boolean;
  threshold?: number;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loadMore,
  loading,
  threshold = 200,
  className = ''
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Handle intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && hasMore && !loading && !loadingRef.current) {
      loadingRef.current = true;
      loadMore();
      
      // Reset loading ref after a short delay to prevent rapid calls
      setTimeout(() => {
        loadingRef.current = false;
      }, 1000);
    }
  }, [hasMore, loading, loadMore]);

  // Set up intersection observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersection, threshold]);

  // Alternative scroll-based loading for better compatibility
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || loadingRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadingRef.current = true;
        loadMore();
        
        setTimeout(() => {
          loadingRef.current = false;
        }, 1000);
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [loading, hasMore, loadMore, threshold]);

  return (
    <div className={`infinite-scroll ${className}`}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="scroll-sentinel" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="infinite-scroll-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading more recipes...</p>
        </div>
      )}
      
      {/* End of content indicator */}
      {!hasMore && !loading && (
        <div className="infinite-scroll-end">
          <div className="end-icon">🎉</div>
          <p className="end-text">You've reached the end!</p>
          <p className="end-subtext">That's all the recipes we have for now.</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
