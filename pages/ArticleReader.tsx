
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { Clock, User, Facebook, Linkedin, Twitter, Share2, Printer, BookOpen, ExternalLink, Camera, Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// TODO: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1HIiwav_xV1B4zziqdXfkcybSrPiNeFaOaBcXdMK1TWnN4gx5TfbmK3LgGupeTwYF/exec';

interface ArticleReaderProps {
  articles: Article[];
  categories: string[];
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ articles, categories }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Form State for "Submit Story"
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      location: '',
      story: '',
      driveLink: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const article = articles.find(a => a.id === id);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-12 bg-white shadow-lg rounded-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Article not found</h2>
                <button onClick={() => navigate('/')} className="text-white bg-brand-copper px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-widest hover:bg-brand-dark transition">Return Home</button>
            </div>
        </div>
    );
  }

  // Handle Submit Story Form
  const handleSubmitStory = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormStatus('loading');

      try {
          await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'submission', ...formData })
          });
          
          setFormStatus('success');
          setFormData({ name: '', email: '', phone: '', location: '', story: '', driveLink: '' });
      } catch (error) {
          console.error("Submission failed", error);
          setFormStatus('error');
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = article.videoUrl ? getYouTubeId(article.videoUrl) : null;
  
  // Localize content
  const title = article.translations?.[language]?.title || article.title;
  const summary = article.translations?.[language]?.summary || article.summary;
  const content = article.translations?.[language]?.content || article.content;

  const isPage = article.type === 'page';
  const isSubmitPage = article.id === 'page-submit';
  
  // Share Logic
  const shareUrl = `https://shk-rhein-neckar.de/article/${article.id}`;
  const shareText = encodeURIComponent(`Check out this article: ${title}`);
  
  const shareToLinkedIn = () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareToTwitter = () => {
      window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareToFacebook = () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-copper selection:text-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
        <div 
          className="h-full bg-brand-copper transition-all duration-100 ease-out shadow-[0_0_10px_#b45309]" 
          style={{ width: `${scrollProgress * 100}%` }} 
        />
      </div>

      <Header categories={categories} />

      <article className="max-w-6xl mx-auto my-0 bg-white">
        {/* Header */}
        <header className="px-4 py-16 md:py-24 text-center max-w-4xl mx-auto">
           {!isPage && (
             <div className="mb-8">
                <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white bg-brand-dark rounded-sm">
                  {article.category}
                </span>
             </div>
           )}
           <h1 className="text-4xl md:text-6xl font-display font-black text-brand-dark leading-[1.1] mb-10 tracking-tight">
             {title}
           </h1>
           
           {!isPage && (
             <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-brand-steel border-t border-b border-gray-100 py-6">
               <div className="flex items-center">
                 <User className="w-4 h-4 mr-2 text-brand-copper" />
                 <span className="font-bold text-brand-dark uppercase tracking-wide text-xs">{article.author}</span>
               </div>
               <div className="hidden md:block w-px h-4 bg-gray-300"></div>
               <div className="flex items-center">
                 <Clock className="w-4 h-4 mr-2 text-brand-copper" />
                 <span className="uppercase tracking-wide text-xs">{new Date(article.publishedAt).toLocaleDateString('de-DE')}</span>
               </div>
               <div className="hidden md:block w-px h-4 bg-gray-300"></div>
               <div className="flex items-center text-gray-400 uppercase tracking-wide text-xs">
                  {article.readTime ? Math.ceil(article.readTime / 60) : 5} {t('article.read_time')}
               </div>
             </div>
           )}
        </header>

        {/* Media: Video or Image */}
        {(article.imageUrl || videoId) && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden bg-gray-100 shadow-sm rounded-sm">
              {videoId ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0`} 
                  title={title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <img src={article.imageUrl} alt={title} className="w-full h-full object-cover" />
              )}
            </div>
            {/* Image Credit */}
            {article.imageCredit && !videoId && (
                <div className="flex justify-end mt-2 px-1">
                    <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                        <Camera className="w-3 h-3 mr-1.5" />
                        <span>Bild: {article.imageCredit}</span>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
           
           {/* Sidebar / Socials - Sticky */}
           {!isPage && (
             <div className="hidden lg:flex lg:col-span-2 flex-col items-center">
                <div className="sticky top-32 space-y-6 flex flex-col items-center">
                  {/* Fixed rotation for "Share" text */}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transform -rotate-90 whitespace-nowrap mb-6 origin-center">{t('article.share')}</span>
                  <button onClick={shareToLinkedIn} className="p-3 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition shadow-sm" title="Share on LinkedIn"><Linkedin className="w-5 h-5" /></button>
                  <button onClick={shareToTwitter} className="p-3 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50 transition shadow-sm" title="Share on Twitter"><Twitter className="w-5 h-5" /></button>
                  <button onClick={shareToFacebook} className="p-3 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition shadow-sm" title="Share on Facebook"><Facebook className="w-5 h-5" /></button>
                  <div className="w-8 h-px bg-gray-200 my-2"></div>
                  <button className="p-3 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-brand-copper hover:border-brand-copper hover:bg-orange-50 transition shadow-sm" onClick={() => window.print()} title="Print"><Printer className="w-5 h-5" /></button>
                </div>
             </div>
           )}

           {/* Main Text Column */}
           <div className={`col-span-1 ${isPage ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-8'}`}>
             
             {/* Summary Lead */}
             {summary && !isPage && (
               <div className="mb-12">
                 <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed text-brand-dark">
                   {summary}
                 </p>
               </div>
             )}

             {/* Rich Text Content */}
             <div className="prose prose-lg md:prose-xl prose-slate max-w-none text-gray-700 leading-loose prose-headings:font-display prose-headings:font-bold prose-headings:text-brand-dark prose-p:mb-8 prose-a:text-brand-copper prose-a:no-underline hover:prose-a:underline prose-img:rounded-sm prose-img:shadow-lg prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-gray-500 prose-figcaption:italic">
               <div dangerouslySetInnerHTML={{ __html: content }} />
             </div>

             {/* Custom Submission Form for 'page-submit' */}
             {isSubmitPage && (
                 <div className="mt-12 p-8 bg-gray-50 border border-gray-200 rounded-sm shadow-sm">
                     {formStatus === 'success' ? (
                         <div className="text-center py-12">
                             <CheckCircle className="w-16 h-16 text-brand-copper mx-auto mb-6" />
                             <h3 className="text-2xl font-display font-bold text-brand-dark mb-4">Danke für Ihren Beitrag!</h3>
                             <p className="text-gray-600">Wir haben Ihre Geschichte erhalten und werden diese prüfen. <br/>Bei Fragen melden wir uns unter der angegebenen E-Mail.</p>
                             <button onClick={() => setFormStatus('idle')} className="mt-8 text-brand-copper font-bold underline">Weitere Story einreichen</button>
                         </div>
                     ) : (
                         <form onSubmit={handleSubmitStory} className="space-y-6">
                             <h3 className="text-xl font-bold uppercase tracking-wide text-brand-dark border-b border-gray-200 pb-4 mb-6">Details zur Einreichung</h3>
                             
                             <div className="grid md:grid-cols-2 gap-6">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Name *</label>
                                     <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="Max Mustermann" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-Mail *</label>
                                     <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="max@beispiel.de" />
                                 </div>
                             </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telefon</label>
                                     <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="+49 ..." />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ort / Region</label>
                                     <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="z.B. Mannheim" />
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ihre Story *</label>
                                 <textarea required name="story" value={formData.story} onChange={handleChange} rows={6} className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="Erzählen Sie uns, worum es geht..."></textarea>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bilder (Google Drive Link)</label>
                                 <input name="driveLink" value={formData.driveLink} onChange={handleChange} type="url" className="w-full border border-gray-300 p-3 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none" placeholder="https://drive.google.com/..." />
                                 <p className="text-[10px] text-gray-400 mt-1">Bitte stellen Sie sicher, dass der Link öffentlich zugänglich ist.</p>
                             </div>

                             <div className="pt-4">
                                 <button disabled={formStatus === 'loading'} className="w-full bg-brand-dark text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-copper transition rounded-sm flex justify-center items-center shadow-lg">
                                     {formStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Absenden</>}
                                 </button>
                             </div>
                             {formStatus === 'error' && (
                                 <div className="bg-red-50 text-red-600 p-4 rounded-sm flex items-center">
                                     <AlertTriangle className="w-5 h-5 mr-3" />
                                     <span>Fehler beim Senden. Bitte versuchen Sie es später erneut.</span>
                                 </div>
                             )}
                         </form>
                     )}
                 </div>
             )}
             
             {/* Source Attribution with Backlink */}
             {article.source && (
                 <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center text-sm text-gray-500 bg-gray-50 p-6 rounded-sm">
                     <div className="flex items-center mb-2 sm:mb-0">
                        <BookOpen className="w-4 h-4 mr-2 text-brand-copper" />
                        <span className="font-bold mr-2 uppercase tracking-wide text-xs">Quelle:</span>
                     </div>
                     {article.sourceUrl ? (
                         <a 
                           href={article.sourceUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="flex items-center text-brand-dark hover:text-brand-copper font-medium transition-colors italic group"
                         >
                           {article.source}
                           <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                         </a>
                     ) : (
                        <span className="italic text-brand-dark">{article.source}</span>
                     )}
                 </div>
             )}

             {!isPage && !isSubmitPage && (
               <div className="mt-20 p-10 bg-brand-surface border-l-4 border-brand-copper rounded-r-sm">
                  <h3 className="text-2xl font-bold font-display text-brand-dark mb-3">{t('article.enjoyed')}</h3>
                  <p className="text-brand-steel mb-8 text-lg">{t('article.subscribe_promo')}</p>
                  <form className="flex flex-col sm:flex-row gap-4">
                     <input type="email" placeholder={t('newsletter.placeholder')} className="flex-grow px-6 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none bg-white" />
                     <button className="bg-brand-dark text-white px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-brand-copper transition rounded-sm shadow-md whitespace-nowrap">{t('newsletter.button')}</button>
                  </form>
               </div>
             )}
           </div>
        </div>
      </article>

      <Footer categories={categories} />
    </div>
  );
};

export default ArticleReader;
