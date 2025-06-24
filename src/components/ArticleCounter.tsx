import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type StatsState = {
  totalArticles: number;
  lastUpdated: string;
  lastFetchCount: number;
  loading: boolean;
  error: string | null;
};

const ArticleCounter = ({ className = '' }) => {
  const [stats, setStats] = useState<StatsState>({
    totalArticles: 0,
    lastUpdated: '',
    lastFetchCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // First try to get from the Edge Function
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/article-stats`);
          if (response.ok) {
            const data = await response.json();
            setStats({
              totalArticles: data.total_articles,
              lastUpdated: new Date(data.last_updated).toLocaleString(),
              lastFetchCount: data.last_fetch_count,
              loading: false,
              error: null
            });
            return;
          }
        } catch (error) {
          console.log('Edge function not available, falling back to direct query');
        }

        // Fallback: Direct query to the database
        const { data, error } = await supabase
          .from('site_stats')
          .select('*')
          .eq('id', 'global_stats')
          .single();

        if (error) {
          // If no stats record, count articles directly
          const { count, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true });

          if (countError) throw countError;

          setStats({
            totalArticles: count || 0,
            lastUpdated: 'Just now',
            lastFetchCount: 0,
            loading: false,
            error: null
          });
        } else {
          setStats({
            totalArticles: data.total_articles,
            lastUpdated: new Date(data.last_updated).toLocaleString(),
            lastFetchCount: data.last_fetch_count,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching article stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load article count'
        }));
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (stats.loading) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
      </div>
    );
  }

  if (stats.error) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className={`text-sm font-medium ${className}`}>
      <span className="inline-flex items-center">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        <span>{stats.totalArticles.toLocaleString()} articles</span>
        {stats.lastFetchCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs rounded-full">
            +{stats.lastFetchCount} new
          </span>
        )}
      </span>
    </div>
  );
};

export default ArticleCounter;
