// Image utility functions for article fallback images

export interface CategoryImage {
  url: string;
  alt: string;
}

// Comprehensive category-based fallback images
const CATEGORY_IMAGES: Record<string, CategoryImage[]> = {
  'Technology': [
    { url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Technology and innovation' },
    { url: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Digital technology' },
    { url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Modern technology' },
    { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800', alt: 'Tech workspace' }
  ],
  'Gaming': [
    { url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Gaming setup' },
    { url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Video games' },
    { url: 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Gaming controller' },
    { url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800', alt: 'Gaming equipment' }
  ],
  'Entertainment': [
    { url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Entertainment industry' },
    { url: 'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Movie theater' },
    { url: 'https://images.unsplash.com/photo-1489599651404-7a9be3e1b37e?w=800', alt: 'Entertainment media' }
  ],
  'Sports': [
    { url: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Sports competition' },
    { url: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Athletic performance' },
    { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', alt: 'Sports action' }
  ],
  'Science': [
    { url: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Scientific research' },
    { url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Laboratory equipment' },
    { url: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Scientific discovery' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Science and technology' }
  ],
  'Business': [
    { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Business meeting' },
    { url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Corporate environment' },
    { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', alt: 'Business strategy' }
  ],
  'Lifestyle': [
    { url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Lifestyle and wellness' },
    { url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Healthy living' },
    { url: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Modern lifestyle' }
  ],
  'Health': [
    { url: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Healthcare and medicine' },
    { url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Medical care' },
    { url: 'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Health and wellness' }
  ],
  'Politics': [
    { url: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Political discussion' },
    { url: 'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Government and policy' },
    { url: 'https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Political landscape' }
  ],
  'World': [
    { url: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Global perspective' },
    { url: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'World news' },
    { url: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800', alt: 'International affairs' }
  ]
};

// Default fallback images for unknown categories
const DEFAULT_IMAGES: CategoryImage[] = [
  { url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'News and information' },
  { url: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Latest news' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Breaking news' }
];

/**
 * Get a fallback image for an article based on its category
 * @param category - The article category
 * @param articleId - Optional article ID for consistent image selection
 * @returns A CategoryImage object with url and alt text
 */
export function getFallbackImage(category: string, articleId?: string): CategoryImage {
  const categoryImages = CATEGORY_IMAGES[category] || DEFAULT_IMAGES;
  
  // Use article ID to consistently select the same image for the same article
  if (articleId) {
    const index = Math.abs(hashCode(articleId)) % categoryImages.length;
    return categoryImages[index];
  }
  
  // Otherwise, return a random image from the category
  const randomIndex = Math.floor(Math.random() * categoryImages.length);
  return categoryImages[randomIndex];
}

/**
 * Get the best image URL for an article, with fallback
 * @param article - The article object
 * @returns The best available image URL
 */
export function getArticleImage(article: { image_url?: string; category: string; id: string }): string {
  if (article.image_url) {
    return article.image_url;
  }
  
  const fallbackImage = getFallbackImage(article.category, article.id);
  return fallbackImage.url;
}

/**
 * Get the best image alt text for an article
 * @param article - The article object
 * @returns The best available alt text
 */
export function getArticleImageAlt(article: { image_url?: string; category: string; id: string; title: string }): string {
  if (article.image_url) {
    return article.title;
  }
  
  const fallbackImage = getFallbackImage(article.category, article.id);
  return fallbackImage.alt;
}

/**
 * Simple hash function for consistent image selection
 * @param str - String to hash
 * @returns Hash code
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Handle image load errors by setting a fallback
 * @param event - The error event
 * @param article - The article object
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  article: { category: string; id: string; title: string }
): void {
  const img = event.currentTarget;
  const fallbackImage = getFallbackImage(article.category, article.id);
  
  // Only set fallback if it's different from current src to avoid infinite loops
  if (img.src !== fallbackImage.url) {
    img.src = fallbackImage.url;
    img.alt = fallbackImage.alt;
  }
} 