// Image optimization utilities

export const optimizeImage = (url: string, width?: number, quality: number = 80): string => {
  if (!url) return '';
  
  // If it's a data URL or already optimized, return as is
  if (url.startsWith('data:') || url.includes('?')) return url;
  
  // Add optimization parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());
  params.append('auto', 'format');
  
  return `${url}?${params.toString()}`;
};

export const getResponsiveImageSrcSet = (url: string, widths: number[] = [320, 640, 960, 1280]): string => {
  return widths
    .map(width => `${optimizeImage(url, width)} ${width}w`)
    .join(', ');
};

export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        if (src) {
          target.src = src;
          target.removeAttribute('data-src');
        }
        observer.unobserve(target);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  observer.observe(img);
  return () => observer.disconnect();
};

// Preload critical images
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// WebP support detection
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};
