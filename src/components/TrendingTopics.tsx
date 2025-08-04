import React from 'react';
import SEOHead from './SEOHead';

interface TrendingTopicsProps {
  trends: string[];
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ trends }) => {
  const currentTrends = trends.slice(0, 10);
  
  // Create FAQ schema for trending topics
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": currentTrends.map(trend => ({
      "@type": "Question",
      "name": `What does ${trend} mean in Gen Z slang?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${trend} is a trending topic among Gen Z. Get the latest news and explanations on SlangPress.`
      }
    }))
  };

  return (
    <>
      <SEOHead
        title={`Trending Now: ${currentTrends.slice(0, 3).join(', ')} | SlangPress`}
        description={`Stay updated with trending topics: ${currentTrends.join(', ')}. Get Gen Z and Alpha perspectives on the latest news.`}
        keywords={`trending, ${currentTrends.join(', ')}, gen z news, alpha news, trending topics`}
        type="website"
      />
      
      {/* FAQ Schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">🔥 Trending Now</h2>
        <div className="flex flex-wrap gap-2">
          {currentTrends.map((trend, index) => (
            <span 
              key={index}
              className="bg-white/20 px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors cursor-pointer"
            >
              #{trend}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default TrendingTopics;
