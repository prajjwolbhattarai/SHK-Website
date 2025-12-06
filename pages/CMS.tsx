import React, { useState, useRef } from 'react';
import { Article, ContentType, Company, CompanyCategory, FeaturedStatus } from '../types';
import { 
  Plus, Edit, Trash2, Image as ImageIcon, Sparkles, 
  BarChart, AlertCircle, Save, X, Eye, LogOut, Video,
  Layout, FileText, Settings, Home, Tag, TrendingUp, Users, Clock, Share2, Building, Star, FileDown, CloudUpload, Loader2, RefreshCw, Download, List
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import Logo from '../components/Logo';

// TODO: Ensure this matches your App.tsx URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1HIiwav_xV1B4zziqdXfkcybSrPiNeFaOaBcXdMK1TWnN4gx5TfbmK3LgGupeTwYF/exec';

interface CMSProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  onLogout: () => void;
}

type ViewMode = 'dashboard' | 'articles' | 'pages' | 'categories' | 'directory' | 'settings';
const COMPANY_CATEGORIES: CompanyCategory[] = ['Installateur', 'Handwerker', 'Großhändler', 'Hersteller', 'Dienstleister'];

const CMS: React.FC<CMSProps> = ({ articles, setArticles, categories, setCategories, companies, setCompanies, onLogout }) => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content Filters
  const newsArticles = articles.filter(a => a.type === 'article' || !a.type);
  const staticPages = articles.filter(a => a.type === 'page');

  // Analytics Calculation
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalShares = articles.reduce((acc, curr) => acc + (curr.shares || 0), 0);
  const totalListings = companies.length;
  
  // Top Articles
  const topArticles = [...newsArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Category Distribution
  const categoryStats = categories.map(cat => ({
      name: cat,
      count: articles.filter(a => a.category === cat).length
  })).sort((a,b) => b.count - a.count);

  // Reset Handlers
  const resetEditors = () => {
    setCurrentArticle({});
    setIsEditing(false);
    setCurrentCompany({});
    setIsEditingCompany(false);
  };

  // --- CSV EXPORT FUNCTIONALITY ---
  const downloadCSV = (type: 'articles' | 'companies') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    const processCell = (data: any) => {
        if (data === null || data === undefined) return '';
        const str = String(data);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    if (type === 'articles') {
        headers = ['ID', 'Title', 'Category', 'ImageUrl', 'Summary', 'Content', 'Author', 'Date', 'Featured', 'Source', 'SourceURL'];
        rows = [...newsArticles, ...staticPages].map(a => [
            a.id, a.title, a.category, a.imageUrl, a.summary, a.content, a.author, a.publishedAt, String(a.featured || false), a.source || '', a.sourceUrl || ''
        ]);
        filename = 'shk_articles_export.csv';
    } else {
        headers = ['ID', 'Name', 'Category', 'FeaturedStatus', 'LogoUrl', 'Description', 'ContactPerson', 'Phone', 'Email', 'Website', 'Street', 'City', 'Zip'];
        rows = companies.map(c => [
            c.id, c.name, c.category, c.featuredStatus || 'none', c.logoUrl, c.description, c.contactPerson || '', c.phone, c.email, c.website, c.address.street, c.address.city, c.address.zip
        ]);
        filename = 'shk_directory_export.csv';
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.map(processCell).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  // --- SYNC FUNCTIONALITY ---
  const syncToSheet = async (type: 'articles' | 'companies', data: any[]) => {
    setIsSyncing(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'articles' ? 'sync_articles' : 'sync_companies',
          data: data
        })
      });
      // Delay to ensure the script has time to process before we assume it's done (no-cors limitation)
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Successfully synced ${type} to Google Cloud.`);
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Sync failed. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- ARTICLE CRUD ---
  const handleEditArticle = (article: Article) => {
    setCurrentArticle({ ...article });
    setIsEditing(true);
  };
  
  const handleCreateArticle = (type: ContentType) => {
    setCurrentArticle({
      id: crypto.randomUUID(), type, title: '', summary: '',
      content: '',
      author: 'Editorial Team', category: type === 'article' ? categories[0] : 'Page',
      publishedAt: new Date().toISOString(), featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200',
      views: 0, shares: 0, readTime: 0
    });
    setIsEditing(true);
  };
  
  const handleSaveArticle = async () => {
    if (!currentArticle.title || !currentArticle.content) return alert('Title and Content are required');
    
    // 1. Update Local State
    let updatedArticles: Article[] = [];
    setArticles(prev => {
      const exists = prev.find(a => a.id === currentArticle.id);
      updatedArticles = exists 
        ? prev.map(a => a.id === currentArticle.id ? currentArticle as Article : a) 
        : [currentArticle as Article, ...prev];
      
      // We must return the new state here for React to update
      return updatedArticles; 
    });
    
    // 2. We use the calculated 'updatedArticles' to sync, ensuring we don't rely on stale state
    // However, setArticles is async, but 'updatedArticles' is available locally immediately.
    // To be safe, we'll sync using the local variable.
    await syncToSheet('articles', updatedArticles);
    
    resetEditors();
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      let updatedArticles: Article[] = [];
      setArticles(prev => {
        updatedArticles = prev.filter(a => a.id !== id);
        return updatedArticles;
      });
      // Sync the filtered list
      await syncToSheet('articles', updatedArticles);
    }
  };

  // --- COMPANY CRUD ---
  const handleEditCompany = (company: Company) => {
    setCurrentCompany({ ...company });
    setIsEditingCompany(true);
  };

  const handleCreateCompany = () => {
    setCurrentCompany({
        id: crypto.randomUUID(), name: '', category: 'Installateur', description: '',
        featuredStatus: 'none',
        logoUrl: 'https://placehold.co/100x100/f8fafc/0f172a?text=Logo',
        phone: '', email: '', website: '', address: { street: '', city: '', zip: '' },
        views: 0, clicks: 0
    });
    setIsEditingCompany(true);
  };
  
  const handleSaveCompany = async () => {
    if (!currentCompany.name || !currentCompany.category) return alert('Name and Category are required');
    
    let updatedCompanies: Company[] = [];
    setCompanies(prev => {
      const exists = prev.find(c => c.id === currentCompany.id);
      updatedCompanies = exists 
        ? prev.map(c => c.id === currentCompany.id ? currentCompany as Company : c) 
        : [currentCompany as Company, ...prev];
      return updatedCompanies;
    });

    await syncToSheet('companies', updatedCompanies);
    resetEditors();
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company listing?')) {
        let updatedCompanies: Company[] = [];
        setCompanies(prev => {
            updatedCompanies = prev.filter(c => c.id !== id);
            return updatedCompanies;
        });
        await syncToSheet('companies', updatedCompanies);
    }
  };

  // --- CATEGORY CRUD ---
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setNewCategory('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Are you sure you want to remove the category "${cat}"? This will not delete articles, but they will be uncategorized.`)) {
        setCategories(categories.filter(c => c !== cat));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'article' | 'company') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'article') {
            setCurrentArticle(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else {
            setCurrentCompany(prev => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };


  // --- RENDER LOGIC ---

  if (isEditing) { /* Article Editor View */
    return (
      <div className="min-h-screen bg-gray-50 pb-20 font-sans">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-4">
            <button onClick={resetEditors} className="text-gray-500 hover:text-gray-800 transition"><X className="w-6 h-6" /></button>
            <h2 className="text-lg font-bold text-gray-800 leading-none">{currentArticle.title || 'New Content'}</h2>
          </div>
          <div className="flex space-x-3">
             <button 
               onClick={handleSaveArticle} 
               disabled={isSyncing}
               className="flex items-center bg-green-600 text-white px-6 py-2 rounded-sm hover:bg-green-700 font-bold uppercase text-xs tracking-wider shadow-sm transition disabled:opacity-50"
             >
               {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />} 
               Save & Sync
             </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Headline</label>
                  <input type="text" value={currentArticle.title || ''} onChange={e => setCurrentArticle(prev => ({...prev, title: e.target.value}))} className="w-full text-2xl font-display font-bold border-b-2 border-gray-100 focus:border-brand-copper outline-none py-2" placeholder="Enter headline..."/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Summary / Lead</label>
                  <textarea value={currentArticle.summary || ''} onChange={e => setCurrentArticle(prev => ({...prev, summary: e.target.value}))} className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:ring-1 focus:ring-brand-copper outline-none" rows={3}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Main Content</label>
                  <RichTextEditor content={currentArticle.content || ''} onChange={(html) => setCurrentArticle(prev => ({...prev, content: html}))}/>
                </div>
              </div>
            </div>
            
            {/* Attribution Section */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                <h3 className="font-bold text-sm uppercase mb-4 text-brand-dark flex items-center"><Share2 className="w-4 h-4 mr-2" /> Source & Attribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source Name</label>
                        <input type="text" value={currentArticle.source || ''} onChange={e => setCurrentArticle(prev => ({...prev, source: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm" placeholder="e.g. Stadt Mannheim"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source URL</label>
                        <input type="url" value={currentArticle.sourceUrl || ''} onChange={e => setCurrentArticle(prev => ({...prev, sourceUrl: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm" placeholder="https://..."/>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-bold text-sm uppercase mb-2">Publishing Details</h3>
              
              {currentArticle.type === 'article' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select value={currentArticle.category} onChange={e => setCurrentArticle(prev => ({...prev, category: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm bg-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
               
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author</label>
                  <input type="text" value={currentArticle.author || ''} onChange={e => setCurrentArticle(prev => ({...prev, author: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm"/>
               </div>

               <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-sm">
                      <input type="checkbox" checked={currentArticle.featured || false} onChange={e => setCurrentArticle(prev => ({...prev, featured: e.target.checked}))} className="rounded text-brand-copper focus:ring-brand-copper"/>
                      <span className="text-sm font-medium">Mark as Featured</span>
                  </label>
               </div>
            </div>

            {/* Image Settings */}
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-bold text-sm uppercase mb-2">Featured Image</h3>
                
                {/* Image Preview */}
                <div className="w-full aspect-video bg-gray-100 rounded-sm overflow-hidden mb-2 relative group">
                    {currentArticle.imageUrl ? (
                        <img src={currentArticle.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon className="w-8 h-8"/></div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                    <input type="text" value={currentArticle.imageUrl || ''} onChange={e => setCurrentArticle(prev => ({...prev, imageUrl: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm" placeholder="https://..."/>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image Credit</label>
                    <input type="text" value={currentArticle.imageCredit || ''} onChange={e => setCurrentArticle(prev => ({...prev, imageCredit: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-2 text-sm" placeholder="e.g. Unsplash / Photographer"/>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'article')}/>
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-center bg-gray-100 py-2 rounded-sm text-xs font-bold uppercase hover:bg-gray-200 border border-gray-200">Upload File</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditingCompany) { /* Company Editor View */
    return (
      <div className="min-h-screen bg-gray-50 pb-20 font-sans">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
            {/* Same header structure as Article Editor... shortened for brevity but logic is identical */}
          <div className="flex items-center space-x-4">
            <button onClick={resetEditors} className="text-gray-500 hover:text-gray-800 transition"><X className="w-6 h-6" /></button>
            <h2 className="text-lg font-bold text-gray-800 leading-none">{currentCompany.name || 'New Company'}</h2>
          </div>
          <button onClick={handleSaveCompany} disabled={isSyncing} className="flex items-center bg-green-600 text-white px-6 py-2 rounded-sm hover:bg-green-700 font-bold uppercase text-xs tracking-wider shadow-sm transition disabled:opacity-50">
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />} Save & Sync
          </button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company Name</label>
              <input type="text" value={currentCompany.name || ''} onChange={e => setCurrentCompany(prev => ({...prev, name: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3 text-lg"/>
            </div>
            
            {/* NEW: Featured Status Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Promotion Status</label>
              <select value={currentCompany.featuredStatus || 'none'} onChange={e => setCurrentCompany(prev => ({...prev, featuredStatus: e.target.value as FeaturedStatus}))} className="w-full border border-gray-300 rounded-sm p-3 bg-white">
                <option value="none">Standard</option>
                <option value="featured">Featured (Top)</option>
                <option value="sponsored">Sponsored (Premium)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
              <select value={currentCompany.category} onChange={e => setCurrentCompany(prev => ({...prev, category: e.target.value as CompanyCategory}))} className="w-full border border-gray-300 rounded-sm p-3 bg-white">
                {COMPANY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo URL</label>
                <input type="text" value={currentCompany.logoUrl || ''} onChange={e => setCurrentCompany(prev => ({...prev, logoUrl: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
              <textarea value={currentCompany.description || ''} onChange={e => setCurrentCompany(prev => ({...prev, description: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" rows={4}/>
            </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Person</label>
                <input type="text" value={currentCompany.contactPerson || ''} onChange={e => setCurrentCompany(prev => ({...prev, contactPerson: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" />
            </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                <input type="text" value={currentCompany.phone || ''} onChange={e => setCurrentCompany(prev => ({...prev, phone: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" />
            </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                <input type="email" value={currentCompany.email || ''} onChange={e => setCurrentCompany(prev => ({...prev, email: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" />
            </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Website</label>
                <input type="text" value={currentCompany.website || ''} onChange={e => setCurrentCompany(prev => ({...prev, website: e.target.value}))} className="w-full border border-gray-300 rounded-sm p-3" />
            </div>
             <div className="md:col-span-2 grid grid-cols-3 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Street</label>
                    <input type="text" value={currentCompany.address?.street || ''} onChange={e => setCurrentCompany(prev => ({...prev, address: {...prev.address!, street: e.target.value}}))} className="w-full border border-gray-300 rounded-sm p-3" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Zip</label>
                    <input type="text" value={currentCompany.address?.zip || ''} onChange={e => setCurrentCompany(prev => ({...prev, address: {...prev.address!, zip: e.target.value}}))} className="w-full border border-gray-300 rounded-sm p-3" />
                 </div>
                 <div className="col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City</label>
                    <input type="text" value={currentCompany.address?.city || ''} onChange={e => setCurrentCompany(prev => ({...prev, address: {...prev.address!, city: e.target.value}}))} className="w-full border border-gray-300 rounded-sm p-3" />
                 </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      <aside className="w-64 bg-brand-dark text-gray-400 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Logo className="h-16 w-auto mb-8 mx-auto" variant="light"/>
          <nav className="space-y-2">
            {[ 'dashboard', 'articles', 'pages', 'categories', 'directory' ].map(view => {
              const icons = { dashboard: BarChart, articles: FileText, pages: Layout, categories: Tag, directory: Building };
              const Icon = icons[view as keyof typeof icons];
              return (
                <button key={view} onClick={() => setActiveView(view as ViewMode)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition ${activeView === view ? 'bg-brand-copper text-white' : 'hover:bg-white/5'}`}>
                  <Icon className="w-4 h-4" /> <span>{view}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-800">
            <div className="flex items-center mb-4 space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                <div className="text-xs">
                    <div className="text-white font-bold">Admin User</div>
                    <div className="text-gray-500">Google Verified</div>
                </div>
            </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-sm font-medium hover:text-white transition"><LogOut className="w-4 h-4" /> <span>Logout</span></button>
        </div>
      </aside>

      <main className="ml-64 flex-grow p-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-display font-bold text-gray-900 capitalize">{activeView}</h1>
          {isSyncing && (
             <div className="flex items-center text-brand-copper font-bold animate-pulse">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin"/> Syncing to Cloud...
             </div>
          )}
        </div>

        {/* --- DASHBOARD VIEW --- */}
        {activeView === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Views</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-brand-dark">{totalViews.toLocaleString()}</span>
                            <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Articles</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-brand-dark">{newsArticles.length}</span>
                            <FileText className="w-5 h-5 text-brand-copper mb-1" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Companies</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-brand-dark">{totalListings}</span>
                            <Building className="w-5 h-5 text-blue-500 mb-1" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Social Shares</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-brand-dark">{totalShares.toLocaleString()}</span>
                            <Share2 className="w-5 h-5 text-purple-500 mb-1" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performing Content */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-6 flex items-center"><Star className="w-4 h-4 mr-2 text-brand-copper" /> Top Performing Content</h3>
                        <div className="space-y-4">
                            {topArticles.length > 0 ? topArticles.map((a, i) => (
                                <div key={a.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-sm transition">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-gray-300 text-lg w-4">{i + 1}</span>
                                        <div>
                                            <div className="font-bold text-sm text-gray-800 line-clamp-1">{a.title}</div>
                                            <div className="text-xs text-gray-500">{a.category} • {new Date(a.publishedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-brand-dark">{a.views} views</div>
                                </div>
                            )) : (
                                <p className="text-gray-400 italic">No data available.</p>
                            )}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                         <h3 className="font-bold text-lg mb-6 flex items-center"><Tag className="w-4 h-4 mr-2 text-brand-copper" /> Content by Category</h3>
                         <div className="space-y-4">
                             {categoryStats.map(c => (
                                 <div key={c.name} className="relative pt-1">
                                     <div className="flex mb-2 items-center justify-between">
                                         <div className="text-xs font-bold uppercase tracking-wide text-gray-600">{c.name}</div>
                                         <div className="text-right text-xs font-bold text-brand-copper">{c.count}</div>
                                     </div>
                                     <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-sm bg-gray-100">
                                         <div style={{ width: `${(c.count / (newsArticles.length || 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-dark"></div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        )}

        {(activeView === 'articles' || activeView === 'pages') && (
          <div>
            <div className="flex justify-end mb-6 space-x-3">
                 <button onClick={() => downloadCSV('articles')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2"/> Export CSV
                 </button>
                 <button onClick={() => syncToSheet('articles', articles)} disabled={isSyncing} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-gray-50">
                    <CloudUpload className="w-4 h-4 mr-2"/> Push All to Cloud
                 </button>
                 <button onClick={() => handleCreateArticle(activeView === 'pages' ? 'page' : 'article')} className="bg-brand-copper text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center">
                    <Plus className="w-4 h-4 mr-2"/> New
                 </button>
            </div>
            <div className="bg-white rounded-sm shadow-sm border">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase"><tr><th className="p-4">Title</th>{activeView==='articles' && <th className="p-4">Category</th>}<th className="p-4">Date</th><th className="p-4">Actions</th></tr></thead>
                <tbody>
                  {(activeView === 'articles' ? newsArticles : staticPages).map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.title}</td>
                      {activeView === 'articles' && <td className="p-4 text-sm text-gray-600">{item.category}</td>}
                      <td className="p-4 text-sm text-gray-500">{new Date(item.publishedAt).toLocaleDateString()}</td>
                      <td className="p-4 space-x-2">
                          <button onClick={() => handleEditArticle(item)} title="Edit" className="p-1 hover:text-blue-600 transition"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteArticle(item.id)} title="Delete" className="p-1 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                  {(activeView === 'articles' ? newsArticles : staticPages).length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-400">No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CATEGORIES VIEW --- */}
        {activeView === 'categories' && (
            <div className="max-w-2xl">
                 <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 mb-8">
                     <h3 className="font-bold text-lg mb-4">Add New Category</h3>
                     <div className="flex gap-4">
                         <input 
                            type="text" 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)} 
                            placeholder="Category Name" 
                            className="flex-grow border border-gray-300 rounded-sm p-3 focus:ring-1 focus:ring-brand-copper outline-none"
                         />
                         <button onClick={handleAddCategory} className="bg-brand-dark text-white px-6 py-2 font-bold uppercase text-xs tracking-wider rounded-sm hover:bg-brand-copper transition">Add</button>
                     </div>
                 </div>

                 <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                     <div className="p-4 border-b border-gray-100 font-bold bg-gray-50 text-xs uppercase">Existing Categories</div>
                     {categories.map(cat => (
                         <div key={cat} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                             <span className="font-medium">{cat}</span>
                             <button onClick={() => handleDeleteCategory(cat)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                         </div>
                     ))}
                 </div>
            </div>
        )}

        {activeView === 'directory' && (
          <div>
            <div className="flex justify-end mb-6 space-x-3">
                 <button onClick={() => downloadCSV('companies')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2"/> Export CSV
                 </button>
                 <button onClick={() => syncToSheet('companies', companies)} disabled={isSyncing} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-sm text-sm font-bold flex items-center hover:bg-gray-50">
                    <CloudUpload className="w-4 h-4 mr-2"/> Push All to Cloud
                 </button>
                 <button onClick={handleCreateCompany} className="bg-brand-copper text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center">
                    <Plus className="w-4 h-4 mr-2"/> New Company
                 </button>
            </div>
            <div className="bg-white rounded-sm shadow-sm border">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Category</th><th className="p-4">City</th><th className="p-4">Actions</th></tr></thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-bold">{c.name}</td>
                      <td className="p-4">
                          {c.featuredStatus === 'sponsored' && <span className="bg-brand-copper text-white px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wide">Sponsored</span>}
                          {c.featuredStatus === 'featured' && <span className="bg-blue-600 text-white px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wide">Featured</span>}
                          {(!c.featuredStatus || c.featuredStatus === 'none') && <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.category === 'Handwerker' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>{c.category}</span></td>
                      <td className="p-4">{c.address.city}</td>
                      <td className="p-4 space-x-2">
                          <button onClick={() => handleEditCompany(c)} className="p-1 hover:text-blue-600 transition"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteCompany(c.id)} className="p-1 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                  {companies.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No companies found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CMS;
