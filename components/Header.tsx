
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, Search, Briefcase } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import Logo from './Logo';

interface HeaderProps {
  categories: string[];
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ categories, activeCategory, onCategoryClick, onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleNavClick = (cat: string) => {
    if (location.pathname === '/' && onCategoryClick) {
      onCategoryClick(cat);
    } else {
      navigate('/', { state: { category: cat } });
    }
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    if(onSearch) onSearch('');
  };

  const handleLogoClick = () => {
     if (location.pathname === '/' && onCategoryClick) {
         onCategoryClick('All');
     } else {
         navigate('/');
     }
     setSearchOpen(false);
     setSearchQuery('');
     setMobileMenuOpen(false);
     if(onSearch) onSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setSearchOpen(false);
    if (location.pathname !== '/') {
        navigate('/');
    }
  };

  const toggleSearch = () => {
      if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery('');
          if(onSearch) onSearch('');
      } else {
          setSearchOpen(true);
      }
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 py-0.5' 
          : 'bg-white border-b border-gray-100 py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          {/* Mobile Menu Button - Fixed position relative to bar */}
          <div className={`flex items-center lg:hidden ${searchOpen ? 'hidden' : 'block'}`}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-brand-dark transition-transform active:scale-95" aria-label="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo - Centered on mobile, left on desktop */}
          <div className={`flex-shrink-0 flex items-center cursor-pointer group ${searchOpen ? 'hidden md:flex' : 'flex'}`} onClick={handleLogoClick}>
            <Logo 
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'}`}
            />
          </div>

          {/* Desktop Categories */}
          {!searchOpen && (
            <div className="hidden lg:flex space-x-8 items-center h-full">
                <button
                onClick={() => handleNavClick('All')}
                className={`relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center ${
                    activeCategory === 'All' ? 'text-brand-copper' : 'text-brand-steel hover:text-brand-dark'
                }`}
                >
                {t('nav.home')}
                {activeCategory === 'All' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-copper animate-fade-in" />
                )}
                </button>
                {categories.slice(0, 4).map((cat) => (
                <button
                    key={cat}
                    onClick={() => handleNavClick(cat)}
                    className={`relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center ${
                    activeCategory === cat 
                        ? 'text-brand-copper' 
                        : 'text-brand-steel hover:text-brand-dark'
                    }`}
                >
                    {t(`cat.${cat}`) || cat}
                    {activeCategory === cat && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-copper animate-fade-in" />
                    )}
                </button>
                ))}
                <Link
                    to="/directory"
                    className={`relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center ${
                        location.pathname === '/directory' ? 'text-brand-copper' : 'text-brand-steel hover:text-brand-dark'
                    }`}
                >
                    {t('nav.directory')}
                    {location.pathname === '/directory' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-copper animate-fade-in" />
                    )}
                </Link>
            </div>
          )}

          {/* Actions: Search, Lang, CTA */}
          <div className={`flex items-center space-x-2 md:space-x-4 ${searchOpen ? 'flex-grow px-2' : ''}`}>
            
            {/* Search Bar Container */}
            <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'w-full' : 'w-10'}`}>
                 {searchOpen ? (
                     <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center animate-fade-in">
                         <input 
                            ref={searchInputRef}
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search.placeholder')}
                            className="w-full bg-gray-100 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-brand-copper outline-none"
                         />
                         <button type="button" onClick={toggleSearch} className="absolute right-3 p-1.5 text-gray-400 hover:text-brand-dark transition-colors">
                             <X className="w-4 h-4" />
                         </button>
                     </form>
                 ) : (
                     <button onClick={toggleSearch} className="p-2.5 text-brand-steel hover:text-brand-copper transition-all active:scale-90" aria-label="Search">
                         <Search className="w-5 h-5 md:w-6 md:h-6" />
                     </button>
                 )}
            </div>

            {!searchOpen && (
                <>
                    {/* Language Switcher */}
                    <div className="hidden lg:block relative group">
                    <button 
                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                        className="flex items-center space-x-2 text-xs font-bold uppercase text-brand-steel hover:text-brand-dark transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{language.toUpperCase()}</span>
                    </button>
                    
                    {langMenuOpen && (
                        <div className="absolute right-0 mt-4 w-40 bg-white border border-gray-100 shadow-xl rounded-sm py-2 z-50 animate-fade-in">
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                        {languages.map(lang => (
                            <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold flex items-center hover:bg-gray-50 transition-colors ${language === lang.code ? 'text-brand-copper bg-orange-50/50' : 'text-gray-700'}`}
                            >
                            <span className="mr-3 text-lg">{lang.flag}</span> {lang.label}
                            </button>
                        ))}
                        </div>
                    )}
                    </div>

                    <div className="hidden lg:block h-6 w-px bg-gray-200"></div>

                    <Link 
                    to="/article/page-submit" 
                    className="hidden lg:block group relative bg-brand-dark text-white px-6 py-3 text-xs font-bold uppercase tracking-wider overflow-hidden rounded-sm transition-all hover:shadow-lg"
                    >
                    <span className="relative z-10 group-hover:text-brand-copper transition-colors">{t('nav.get_featured')}</span>
                    <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
                    </Link>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full z-50 shadow-2xl animate-fade-in h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-6 py-8 space-y-4">
            <div className="flex space-x-3 mb-8 pb-6 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {languages.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${language === lang.code ? 'bg-brand-copper text-white border-brand-copper' : 'bg-transparent text-gray-600 border-gray-200'}`}
                >
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleNavClick(cat)}
                className={`block w-full text-left py-4 text-base font-bold uppercase tracking-wide transition-all border-b border-gray-50 ${activeCategory === cat || (cat === 'All' && activeCategory === 'All') ? 'text-brand-copper pl-2' : 'text-brand-dark hover:text-brand-copper hover:pl-2'}`}
              >
                {cat === 'All' ? t('nav.home') : t(`cat.${cat}`) || cat}
              </button>
            ))}
             <Link to="/directory" onClick={() => setMobileMenuOpen(false)} className={`block w-full text-left py-4 text-base font-bold uppercase tracking-wide transition-all border-b border-gray-50 ${location.pathname === '/directory' ? 'text-brand-copper pl-2' : 'text-brand-dark hover:text-brand-copper hover:pl-2'}`}>
               {t('nav.directory')}
             </Link>
            <div className="pt-6">
                <Link to="/article/page-submit" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-brand-dark text-white px-4 py-4 text-sm font-bold uppercase tracking-wider text-center rounded-sm shadow-xl">
                  {t('nav.get_featured')}
                </Link>
            </div>
            <div className="pt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                SHK Rhein-Neckar © 2025
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
