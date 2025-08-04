// Core Web Vitals optimization script
export const coreWebVitalsScript = `
// Preload critical resources
(function() {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.onload = function() { this.rel = 'stylesheet'; };
  document.head.appendChild(fontLink);

  // Optimize images for CLS
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Measure Core Web Vitals
  function sendToAnalytics({name, value, id}) {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }
  }

  // Import web-vitals library (if available)
  if (typeof getCLS !== 'undefined') {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }
})();
`;

// Performance optimization utilities
export class PerformanceOptimizer {
  
  // Optimize images with lazy loading and proper sizing
  static optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper alt text if missing
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'SlangPress news image');
      }
      
      // Add width/height to prevent CLS
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        img.style.aspectRatio = '16/9';
        img.style.objectFit = 'cover';
      }
    });
  }

  // Optimize fonts and reduce FOIT/FOUT
  static optimizeFonts() {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink);

    const fontLinkCrossorigin = document.createElement('link');
    fontLinkCrossorigin.rel = 'preconnect';
    fontLinkCrossorigin.href = 'https://fonts.gstatic.com';
    fontLinkCrossorigin.crossOrigin = 'anonymous';
    document.head.appendChild(fontLinkCrossorigin);
  }

  // Preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      { href: '/favicon_io/favicon-32x32.png', as: 'image', type: 'image/png' },
      { href: 'https://images.pexels.com', as: 'image' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  // Initialize all optimizations
  static init() {
    // Run optimizations when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.optimizeImages();
        this.optimizeFonts();
        this.preloadCriticalResources();
      });
    } else {
      this.optimizeImages();
      this.optimizeFonts();
      this.preloadCriticalResources();
    }
  }
}

export default PerformanceOptimizer;
