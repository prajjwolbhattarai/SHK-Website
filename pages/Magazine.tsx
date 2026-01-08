
import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import FeaturedCarousel from '../components/FeaturedCarousel'; // Import the slider
import { MapPin, Mail, ArrowRight, CheckCircle, ChevronDown, Layers, Loader2, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// TODO: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1HIiwav_xV1B4zziqdXfkcybSrPiNeFaOaBcXdMK1TWnN4gx5TfbmK3LgGupeTwYF/exec';

interface MagazineProps {
  articles: Article[];
  categories: string[];
}

const Magazine: React.FC<MagazineProps> = ({ articles, categories }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(6);
  
  // Newsletter States
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { t, language } = useLanguage();
  const location = useLocation();

  // Reset pagination when category changes
  useEffect(() => {
    setDisplayedCount(activeCategory === 'All' ? 6 : 9);
  }, [activeCategory]);

  // Handle navigation from other pages with category selection
  useEffect(() => {
    if (location.state && (location.state as any).category) {
      setActiveCategory((location.state as any).category);
      window.history.replaceState({}, document.title);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  // Search Filtering
  const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query) {
        setDisplayedCount(100); // Show all matches
      } else {
        setDisplayedCount(activeCategory === 'All' ? 6 : 9);
      }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setNewsletterStatus('loading');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'newsletter', email: email }),
      });
      setNewsletterStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      setNewsletterStatus('error');
    }
  };

  // Filter Articles Logic
  let displayArticles = articles.filter(a => a.type !== 'page');

  if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      displayArticles = displayArticles.filter(a => 
          a.title.toLowerCase().includes(lowerQuery) || 
          a.summary.toLowerCase().includes(lowerQuery) ||
          a.content.toLowerCase().includes(lowerQuery)
      );
  } else if (activeCategory !== 'All') {
      displayArticles = displayArticles.filter(a => a.category === activeCategory);
  }

  // --- FEATURED STORIES LOGIC ---
  const featuredArticles = !searchQuery && activeCategory === 'All' 
    ? displayArticles.filter(a => a.featured) 
    : [];

  const finalFeaturedArticles = featuredArticles.length > 0 
    ? featuredArticles 
    : (!searchQuery && activeCategory === 'All' && displayArticles.length > 0 ? [displayArticles[0]] : []);
  
  let gridArticles = displayArticles;
  if (finalFeaturedArticles.length > 0) {
      const featuredIds = finalFeaturedArticles.map(a => a.id);
      gridArticles = gridArticles.filter(a => !featuredIds.includes(a.id));
  }

  const categoryCards = categories.map(cat => {
     const catArticle = articles.find(a => a.category === cat && a.imageUrl);
     const bgImage = catArticle?.imageUrl || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600';
     return {
         id: cat,
         title: t(`cat.${cat}`),
         image: bgImage,
         count: articles.filter(a => a.category === cat).length
     };
  });

  return (
    <div className="min-h-screen bg-brand-surface font-sans text-brand-dark selection:bg-brand-copper selection:text-white">
      <Header 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryClick={handleCategoryClick}
        onSearch={handleSearch}
      />

      <main>
        {/* HERO SECTION - Only on Home and No Search */}
        {activeCategory === 'All' && !searchQuery && (
          <div className="relative w-full h-[550px] md:h-[650px] flex items-center bg-brand-dark overflow-hidden group">
            
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
               <img 
                 src="https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=2000" 
                 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s] ease-linear" 
                 alt="Industrial Background" 
               />
               <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl space-y-6 md:space-y-8 animate-fade-in-up">
                 
                 <div className="flex items-center space-x-3 mb-4 md:mb-6">
                    <div className="h-px w-8 md:w-12 bg-brand-copper"></div>
                    <span className="text-brand-copper font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px]">The Regional Authority</span>
                 </div>

                 <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-black text-white leading-tight md:leading-[0.9] tracking-tighter">
                    {t('hero.title')}
                 </h1>
                 
                 <p className="text-lg md:text-2xl text-gray-300 font-light leading-relaxed max-w-xl border-l-4 border-white/10 pl-4 md:pl-6">
                    {t('hero.subtitle')}
                 </p>

                 <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8">
                    <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth'})} className="bg-brand-copper text-white px-8 md:px-10 py-3.5 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all duration-300 rounded-sm shadow-xl hover:shadow-2xl">
                       {t('hero.read_latest')}
                    </button>
                    <Link to="/article/page-submit" className="group px-8 md:px-10 py-3.5 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white border border-white/30 hover:bg-white/10 transition-all duration-300 rounded-sm backdrop-blur-sm flex items-center justify-center">
                       {t('hero.submit_story')} <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                 </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 hidden md:block z-10">
               <div className="flex flex-col items-end space-y-2 md:space-y-3 opacity-30">
                  <div className="w-32 md:w-48 h-[1px] md:h-[2px] bg-white"></div>
                  <div className="w-16 md:w-24 h-[1px] md:h-[2px] bg-white"></div>
                  <div className="w-8 md:w-12 h-[1px] md:h-[2px] bg-brand-copper opacity-100"></div>
                  <span className="text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1 md:mt-2">Est. 2025 • Rhein-Neckar</span>
               </div>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          
          {searchQuery && (
              <div className="mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-dark mb-2 md:mb-4">Search Results: "{searchQuery}"</h2>
                  <p className="text-brand-steel text-sm md:text-base">{displayArticles.length} articles found.</p>
              </div>
          )}

          {/* Featured Stories Section */}
          {finalFeaturedArticles.length > 0 && (
            <section className="mb-16 md:mb-24 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center space-x-4 md:space-x-6 mb-8 md:mb-10">
                 <div className="h-px bg-gray-200 flex-grow"></div>
                 <span className="text-brand-steel uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold whitespace-nowrap">
                    {finalFeaturedArticles.length > 1 ? 'Top Stories' : t('section.top_story')}
                 </span>
                 <div className="h-px bg-gray-200 flex-grow"></div>
              </div>
              <FeaturedCarousel articles={finalFeaturedArticles} />
            </section>
          )}

          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-end justify-between mb-8 md:mb-12 border-b border-gray-200 pb-4 md:pb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-dark">
                {activeCategory === 'All' ? t('section.latest_news') : (t(`cat.${activeCategory}`) || activeCategory)}
              </h2>
              <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                {gridArticles.length} Stories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
              {gridArticles.slice(0, displayedCount).map((article, idx) => (
                <div key={article.id} style={{ animationDelay: `${0.1 * idx}s` }} className="animate-fade-in-up">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
            
            {gridArticles.length === 0 && (
               <div className="text-center py-20 md:py-32 bg-gray-50 rounded-sm border border-dashed border-gray-300 px-6">
                  <p className="text-brand-steel font-medium text-base md:text-lg">{searchQuery ? t('search.no_results') : 'No stories found.'}</p>
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="mt-4 text-brand-copper font-bold uppercase text-[10px] md:text-xs underline">Clear Search</button>
                  )}
               </div>
            )}

            {gridArticles.length > displayedCount && (
                <div className="mt-12 md:mt-16 text-center">
                    <button 
                        onClick={() => setDisplayedCount(prev => prev + (activeCategory === 'All' ? 6 : 9))}
                        className="inline-flex items-center bg-white border border-gray-200 px-6 md:px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-dark hover:border-brand-copper hover:text-brand-copper transition-colors shadow-sm"
                    >
                        {activeCategory === 'All' ? t('btn.show_more') : t('btn.load_more')} <ChevronDown className="ml-2 w-4 h-4" />
                    </button>
                </div>
            )}
          </section>

          {activeCategory === 'All' && !searchQuery && (
              <section className="mt-20 md:mt-32 pt-12 md:pt-16 border-t border-gray-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-8 md:mb-10">
                      <h2 className="text-xl md:text-2xl font-display font-bold text-brand-dark flex items-center">
                          <Layers className="w-5 h-5 md:w-6 md:h-6 mr-3 text-brand-copper" />
                          {t('section.explore_categories')}
                      </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {categoryCards.map((cat, idx) => (
                          <div 
                              key={cat.id} 
                              onClick={() => handleCategoryClick(cat.id)}
                              className="group relative h-48 md:h-64 rounded-sm overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                          >
                              <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-brand-dark/60 group-hover:bg-brand-dark/40 transition-colors duration-500"></div>
                              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end items-start">
                                  <span className="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-wider mb-1 md:mb-2">{cat.count} Stories</span>
                                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 md:mb-4 group-hover:translate-x-2 transition-transform">{cat.title}</h3>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                      <span className="inline-flex items-center text-[9px] md:text-xs font-bold text-brand-copper uppercase tracking-widest bg-white px-3 md:px-4 py-2 rounded-sm">
                                          {t('btn.view_category')} <ArrowRight className="w-3 h-3 ml-2" />
                                      </span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </section>
          )}

        </div>

        {activeCategory === 'All' && !searchQuery && (
            <section className="bg-white py-16 md:py-24 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="inline-flex justify-center items-center p-3 md:p-4 bg-brand-surface rounded-full mb-6 md:mb-8">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-brand-copper" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-dark mb-4 md:mb-6">{t('section.trust_title')}</h2>
                <p className="text-brand-steel text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {t('section.trust_text')}
                </p>
            </div>
            </section>
        )}

        {/* Newsletter Section */}
        <section className="py-12 md:py-24 px-4 bg-brand-surface">
          <div className="max-w-6xl mx-auto bg-brand-dark rounded-sm overflow-hidden shadow-2xl relative">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-copper/20 rounded-full blur-[120px] transform translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
             
             <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-20 items-center">
                <div className="text-left space-y-4 md:space-y-6">
                   <div className="flex items-center space-x-3 text-brand-copper mb-1 md:mb-2">
                      <Mail className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Weekly Digest</span>
                   </div>
                   <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">{t('newsletter.title')}</h2>
                   <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                     {t('newsletter.text')}
                   </p>
                   <div className="space-y-2 md:space-y-3 pt-2">
                      {['No spam, ever', 'Weekly curated news', 'Unsubscribe anytime'].map((item, i) => (
                        <div key={i} className="flex items-center text-xs md:text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-brand-copper mr-2" /> {item}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-sm border border-white/10">
                   {newsletterStatus === 'success' ? (
                       <div className="text-center py-6 md:py-8">
                           <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-brand-copper mx-auto mb-4" />
                           <h3 className="text-white font-bold text-lg md:text-xl mb-2">Subscribed!</h3>
                           <p className="text-gray-400 text-xs md:text-sm">Thank you for joining our community.</p>
                       </div>
                   ) : (
                       <form className="flex flex-col gap-4" onSubmit={handleNewsletterSubmit}>
                         <div className="space-y-2">
                           <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">Work Email</label>
                           <input 
                             type="email" 
                             required
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder={t('newsletter.placeholder')} 
                             className="w-full px-4 md:px-6 py-3.5 md:py-4 bg-white/10 border border-white/10 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-copper focus:bg-white/20 transition-all text-sm"
                           />
                         </div>
                         <button 
                            disabled={newsletterStatus === 'loading'}
                            className="w-full bg-brand-copper text-white px-6 py-3.5 md:py-4 font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-white hover:text-brand-dark transition-all rounded-sm shadow-lg hover:shadow-xl mt-2 flex justify-center items-center"
                         >
                           {newsletterStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('newsletter.button')}
                         </button>
                         {newsletterStatus === 'error' && (
                             <div className="flex items-center text-red-400 text-[10px] md:text-xs mt-2 justify-center">
                                 <AlertCircle className="w-3 h-3 mr-1" /> Something went wrong. Try again.
                             </div>
                         )}
                         <p className="text-center text-[9px] md:text-[10px] text-gray-600 mt-4 uppercase tracking-wide opacity-60">{t('newsletter.disclaimer')}</p>
                       </form>
                   )}
                </div>
             </div>
          </div>
        </section>
      </main>

      <Footer categories={categories} />
    </div>
  );
};

export default Magazine;
