
import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCarouselProps {
  articles: Article[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [articles.length, isPaused]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  if (articles.length === 0) return null;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Container for slides */}
      <div className="relative overflow-hidden rounded-sm shadow-2xl">
        {articles.map((article, index) => (
          <div 
            key={article.id}
            className={`transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'
            }`}
          >
            {/* We force the variant to featured */}
            <ArticleCard article={article} variant="featured" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Only if > 1 article) */}
      {articles.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-brand-copper text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
            aria-label="Previous Story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-brand-copper text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
            aria-label="Next Story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {articles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-brand-copper' : 'bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedCarousel;
