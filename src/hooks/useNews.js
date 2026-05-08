import { useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_KEY = 'gnews_cache';
const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      
      if (!force && cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          setArticles(data);
          setLoading(false);
          return;
        }
      }

      const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GNEWS_API_KEY') {
         // Mock data if no key, just for development so we don't break
         throw new Error("Missing GNews API Key");
      }

      const res = await axios.get(`https://api.worldnewsapi.com/search-news?text=space%20OR%20science%20OR%20NASA&language=en&number=10&api-key=${apiKey}`);
      
      // Map world news API structure to match what NewsDashboard expects
      const fetchedArticles = res.data.news.map(item => ({
        title: item.title,
        description: item.summary || item.text,
        url: item.url,
        image: item.image,
        publishedAt: item.publish_date,
        source: { name: item.author || 'World News' }
      }));

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: fetchedArticles
      }));

      setArticles(fetchedArticles);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message || "Failed to fetch news.");
      
      // Fallback to cache if available
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
         setArticles(JSON.parse(cachedData).data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { articles, loading, error, refreshNews: () => fetchNews(true) };
}
