import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * Custom hook to apply animation when element comes into view
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(currentRef);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isInView];
}

/**
 * Types of animations available for page transitions
 */
export type PageTransitionType = 'fadeIn' | 'slideUp' | 'zoomIn';

/**
 * Hook to add page transition effects
 */
export function usePageTransition(type: PageTransitionType = 'fadeIn') {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getClassName = () => {
    if (!mounted) return 'opacity-0';
    
    switch (type) {
      case 'fadeIn':
        return 'animate-fade-in';
      case 'slideUp':
        return 'animate-slide-in';
      case 'zoomIn':
        return 'animate-zoom-in';
      default:
        return 'animate-fade-in';
    }
  };

  return getClassName();
}

/**
 * Hook to stagger animations of children
 */
export function useStaggeredChildren(count: number, delayMs: number = 100) {
  return Array.from({ length: count }).map((_, i) => ({
    style: { 
      animationDelay: `${i * delayMs}ms`,
      opacity: 0,
      animation: 'none'
    },
    onAnimationStart: (e: React.AnimationEvent<HTMLElement>) => {
      e.currentTarget.style.opacity = '1';
    }
  }));
}

/**
 * Function to scroll to element smoothly
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    return true;
  }
  return false;
}

/**
 * Hook to detect scroll direction with throttling for performance
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const throttleTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (throttleTimeout.current === null) {
        throttleTimeout.current = window.setTimeout(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > prevScrollY) {
            setScrollDirection('down');
          } else if (currentScrollY < prevScrollY) {
            setScrollDirection('up');
          }
          setPrevScrollY(currentScrollY);
          throttleTimeout.current = null;
        }, 100); // 100ms throttle
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimeout.current !== null) {
        window.clearTimeout(throttleTimeout.current);
      }
    };
  }, [prevScrollY]);

  return scrollDirection;
}
