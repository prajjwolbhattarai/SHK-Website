
import React from 'react';
import { Article } from '../types';
import { Clock, ChevronRight, PlayCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface ArticleCardProps {
  article: Article;
  variant?: 'featured' | 'standard';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard' }) => {
  const isFeatured = variant === 'featured';
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleRead = () => {
    navigate(`/article/${article.id}`);
  };

  const title = article.translations?.[language]?.title || article.title;
  const summary = article.translations?.[language]?.summary || article.summary;

  if (isFeatured) {
    return (
      <div 
        onClick={handleRead}
        className="group relative w-full h-[600px] overflow-hidden rounded-sm shadow-2xl cursor-pointer"
      >
        <img 
          src={article.imageUrl} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Advanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Video Badge */}
        {article.videoUrl && (
          <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-full animate-pulse shadow-lg z-10 group-hover:scale-110 transition-transform">
             <PlayCircle className="w-8 h-8" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white max-w-5xl z-20">
          <div className="overflow-hidden mb-6">
            <span className="inline-block uppercase tracking-[0.2em] text-[10px] font-bold bg-brand-copper text-white px-3 py-1.5 rounded-sm transform translate-y-0 transition-transform group-hover:-translate-y-1">
              {article.category}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black mb-6 leading-none tracking-tight group-hover:text-gray-100 transition-colors">
            {title}
          </h2>
          
          <p className="text-gray-300 mb-8 line-clamp-2 max-w-2xl font-light text-lg md:text-xl leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
            {summary}
          </p>
          
          <div className="flex items-center space-x-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-white/10 pt-6">
             <span className="text-brand-copper">{article.author}</span>
             <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
             <span className="flex items-center">
               <Clock className="w-3 h-3 mr-2" />
               {new Date(article.publishedAt).toLocaleDateString()}
             </span>
             <div className="ml-auto hidden md:flex items-center text-white group-hover:translate-x-2 transition-transform duration-300">
                {t('article.read_story')} <ArrowUpRight className="ml-2 w-4 h-4" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleRead} className="flex flex-col group cursor-pointer h-full bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-gray-100">
      <div className="overflow-hidden aspect-[16/10] relative">
        <img 
          src={article.imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-brand-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm rounded-sm">
                {article.category}
            </span>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-brand-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {article.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="bg-brand-copper/90 p-3 rounded-full shadow-lg transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 delay-75">
                <PlayCircle className="w-6 h-6 text-white" />
             </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-grow p-6 relative">
        <div className="mb-4 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider space-x-2">
           <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
           <span className="w-px h-3 bg-gray-300"></span>
           <span className="text-brand-copper">{article.readTime ? Math.ceil(article.readTime / 60) : 5} min read</span>
        </div>

        <h3 className="text-xl font-display font-bold text-brand-dark mb-3 leading-snug group-hover:text-brand-copper transition-colors">
          {title}
        </h3>
        <p className="text-brand-steel text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {summary}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-xs font-bold uppercase tracking-wider text-brand-dark group-hover:text-brand-copper transition-colors">
           {article.videoUrl ? t('article.watch_video') : t('article.read_story')} 
           <ChevronRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
