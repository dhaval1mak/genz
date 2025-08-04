import React from 'react';

interface HomepageSchemaProps {
  latestArticles?: Array<{
    title: string;
    slug: string;
    published_at: string;
    category: string;
    image_url?: string;
  }>;
}

const HomepageSchema: React.FC<HomepageSchemaProps> = ({ latestArticles = [] }) => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SlangPress",
    "description": "AI-powered news for Gen Z and Alpha generations. Get breaking news in normal, Gen Z slang, and Alpha culture styles.",
    "url": "https://slangpress.netlify.app",
    "logo": {
      "@type": "ImageObject",
      "url": "https://slangpress.netlify.app/favicon_io/android-chrome-512x512.png"
    },
    "sameAs": [
      "https://twitter.com/slangpress",
      "https://instagram.com/slangpress",
      "https://tiktok.com/@slangpress"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://slangpress.netlify.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SlangPress",
    "description": "Digital news platform specializing in Gen Z and Alpha generation content",
    "url": "https://slangpress.netlify.app",
    "logo": {
      "@type": "ImageObject",
      "url": "https://slangpress.netlify.app/favicon_io/android-chrome-512x512.png"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "hello@slangpress.com"
    },
    "sameAs": [
      "https://twitter.com/slangpress",
      "https://instagram.com/slangpress",
      "https://tiktok.com/@slangpress"
    ]
  };

  const itemListSchema = latestArticles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest News Articles",
    "description": "Latest news articles from SlangPress",
    "numberOfItems": latestArticles.length,
    "itemListElement": latestArticles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "headline": article.title,
        "url": `https://slangpress.netlify.app/article/${article.slug}`,
        "datePublished": article.published_at,
        "articleSection": article.category,
        "image": article.image_url || "https://slangpress.netlify.app/images/default-article.jpg",
        "publisher": {
          "@type": "Organization",
          "name": "SlangPress",
          "logo": {
            "@type": "ImageObject",
            "url": "https://slangpress.netlify.app/favicon_io/android-chrome-512x512.png"
          }
        }
      }
    }))
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SlangPress?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SlangPress is an AI-powered news platform that delivers the latest news in three different styles: Normal (traditional), Gen Z (with slang and emojis), and Alpha (gaming/internet culture language)."
        }
      },
      {
        "@type": "Question", 
        "name": "How does SlangPress rewrite news?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use advanced AI to transform breaking news into different communication styles that resonate with different generations, making news more accessible and engaging for young audiences."
        }
      },
      {
        "@type": "Question",
        "name": "What topics does SlangPress cover?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SlangPress covers technology, gaming, entertainment, sports, business, science, and pop culture news with a focus on topics relevant to Gen Z and Alpha generations."
        }
      },
      {
        "@type": "Question",
        "name": "Is SlangPress free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SlangPress is completely free to use. You can read all articles in any style without any subscription or payment required."
        }
      }
    ]
  };

  return (
    <>
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      {/* Article List Schema */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default HomepageSchema;
