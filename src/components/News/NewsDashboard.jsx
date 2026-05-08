import React, { useState, useEffect } from 'react';
import { useNews } from '../../hooks/useNews';
import { useToast } from '../Toast';
import { Search, ExternalLink, RefreshCw } from 'lucide-react';

export default function NewsDashboard() {
  const { articles, loading, error, refreshNews } = useNews();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const handleRefresh = async () => {
    await refreshNews();
    addToast('News feed refreshed successfully', 'success');
  };

  useEffect(() => {
    if (error) {
      addToast(`Error: ${error}`, 'error');
    }
  }, [error, addToast]);

  const filteredArticles = articles
    .filter(article => {
      const s = searchTerm.toLowerCase();
      return (
        article.title?.toLowerCase().includes(s) ||
        article.source?.name?.toLowerCase().includes(s) ||
        article.description?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-4 md:p-6 flex flex-col gap-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight">Breaking News</h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search title, source, description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 rounded-full border bg-background text-sm cursor-pointer hover:bg-border/50 transition-colors focus:outline-none"
          >
            <option value="newest">Sort by Date (Newest)</option>
            <option value="oldest">Sort by Date (Oldest)</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border bg-background hover:bg-border/50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Article List */}
      <div className="flex flex-col gap-3">
        {loading && articles.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-background border rounded-xl h-20 w-full flex p-3 gap-4">
              <div className="h-14 w-14 rounded-lg bg-border/40"></div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="h-4 bg-border/40 rounded w-3/4"></div>
                <div className="h-3 bg-border/40 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => (
            <a 
              key={index} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border bg-background hover:border-primary/30 transition-all hover:shadow-md cursor-pointer"
            >
              {/* Image & Rank */}
              <div className="relative shrink-0">
                <img 
                  src={article.image || 'https://via.placeholder.com/150'} 
                  alt={article.title} 
                  className="w-full sm:w-16 h-40 sm:h-16 object-cover rounded-lg shadow-sm"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                />
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-background shadow-sm">
                  {index + 1}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-foreground/60 mt-1 font-medium">
                  <span className="text-primary font-bold uppercase tracking-wider">{article.source.name}</span>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex p-2 rounded-full bg-border/50 text-foreground/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                <ExternalLink size={16} />
              </div>
            </a>
          ))
        ) : (
          <div className="text-center py-12 text-foreground/50 border border-dashed rounded-xl">
            No articles found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}
