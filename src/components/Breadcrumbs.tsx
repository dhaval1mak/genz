import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  // Build breadcrumb trail
  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    
    // Convert path segments to readable labels
    let label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
    
    // Handle specific routes
    if (pathname === 'article' && pathnames[index + 1]) {
      label = 'Article';
    } else if (pathname === 'articles') {
      label = 'All Articles';
    } else if (pathname === 'profile') {
      label = 'Profile';
    } else if (index === pathnames.length - 1 && pathnames[index - 1] === 'article') {
      // For article slugs, show truncated title
      label = pathname.replace(/-/g, ' ').substring(0, 30) + '...';
    }

    breadcrumbs.push({
      label,
      href: currentPath
    });
  });

  // Generate structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": `https://slangpress.netlify.app${crumb.href}`
    }))
  };

  if (breadcrumbs.length <= 1) return null;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight size={16} className="mx-2 text-gray-400" />
              )}
              
              {index === 0 ? (
                <Link
                  to={crumb.href}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Home size={16} className="mr-1" />
                  {crumb.label}
                </Link>
              ) : index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
