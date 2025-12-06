import React, { useState, useMemo } from 'react';
import { Company, CompanyCategory } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Phone, Mail, Globe as GlobeIcon, MapPin, Building, User, Award, Star } from 'lucide-react';

interface DirectoryProps {
    companies: Company[];
    categories: string[]; // Article categories for header/footer
    onCompanyClick: (id: string) => void;
}

const Directory: React.FC<DirectoryProps> = ({ companies, categories, onCompanyClick }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<CompanyCategory | 'All'>('All');

    const companyCategories: CompanyCategory[] = ['Installateur', 'Handwerker', 'Großhändler', 'Hersteller', 'Dienstleister'];

    const filteredCompanies = useMemo(() => {
        // 1. Filter by Search and Category
        const filtered = companies.filter(company => {
            const matchesFilter = activeFilter === 'All' || company.category === activeFilter;
            const matchesSearch = searchTerm === '' ||
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.address.city.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        // 2. Sort by Featured Status (Sponsored -> Featured -> None)
        return filtered.sort((a, b) => {
            const statusRank = {
                'sponsored': 2,
                'featured': 1,
                'none': 0
            };
            
            // Safe access with fallback to 0
            const rankA = statusRank[a.featuredStatus as keyof typeof statusRank] || 0;
            const rankB = statusRank[b.featuredStatus as keyof typeof statusRank] || 0;

            return rankB - rankA;
        });

    }, [companies, searchTerm, activeFilter]);

    return (
        <div className="min-h-screen bg-brand-surface font-sans">
            <Header categories={categories} />

            <main>
                {/* Directory Header */}
                <div className="bg-brand-dark text-white py-20 text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <Building className="w-16 h-16 mx-auto text-brand-copper mb-6" />
                        <h1 className="text-5xl font-display font-bold mb-4">{t('directory.title')}</h1>
                        <p className="text-xl text-gray-300">{t('directory.subtitle')}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Filter & Search Bar */}
                    <div className="sticky top-[85px] z-30 bg-brand-surface/90 backdrop-blur-md p-6 rounded-sm border border-gray-100 shadow-md mb-12 transition-all">
                        <div className="grid md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-5 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('directory.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-brand-copper outline-none shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-7">
                                <div className="flex flex-wrap gap-2 items-center bg-gray-100/50 p-2 rounded-sm border border-gray-200">
                                    <button
                                        onClick={() => setActiveFilter('All')}
                                        className={`flex-1 min-w-[80px] px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap text-center ${
                                            activeFilter === 'All' 
                                                ? 'bg-brand-copper text-white shadow-sm' 
                                                : 'bg-transparent text-gray-500 hover:bg-white hover:text-brand-dark'
                                        }`}
                                    >
                                        {t('directory.filter_all')}
                                    </button>
                                    {companyCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveFilter(cat)}
                                            className={`flex-1 min-w-[80px] px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap text-center ${
                                                activeFilter === cat 
                                                    ? 'bg-brand-copper text-white shadow-sm' 
                                                    : 'bg-transparent text-gray-500 hover:bg-white hover:text-brand-dark'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCompanies.map(company => {
                            const isSponsored = company.featuredStatus === 'sponsored';
                            const isFeatured = company.featuredStatus === 'featured';
                            
                            return (
                                <div key={company.id} 
                                    className={`bg-white border rounded-sm shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden ${
                                        isSponsored ? 'border-brand-copper ring-1 ring-brand-copper/20' : 'border-gray-100'
                                    }`}
                                >
                                    {/* Sponsored / Featured Badges */}
                                    {isSponsored && (
                                        <div className="absolute top-0 right-0 z-10">
                                            <div className="bg-brand-copper text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-sm flex items-center shadow-sm">
                                                <Award className="w-3 h-3 mr-1" /> Sponsored
                                            </div>
                                        </div>
                                    )}
                                    {isFeatured && (
                                        <div className="absolute top-0 right-0 z-10">
                                            <div className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-sm flex items-center shadow-sm">
                                                <Star className="w-3 h-3 mr-1" /> Featured
                                            </div>
                                        </div>
                                    )}

                                    {/* Background tint for Sponsored */}
                                    {isSponsored && <div className="absolute inset-0 bg-brand-copper/5 pointer-events-none"></div>}

                                    <div className="p-6 flex-grow relative z-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <img src={company.logoUrl} alt={`${company.name} Logo`} className="h-16 w-16 object-contain bg-white border p-1 rounded-sm" />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded-sm ${company.category === 'Handwerker' ? 'bg-blue-100 text-blue-800' : 'bg-brand-steel'}`}>
                                                {company.category}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-display font-bold text-brand-dark mb-2">{company.name}</h2>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-4">{company.description}</p>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs text-gray-400">
                                                <MapPin className="w-3 h-3 mr-2 text-brand-copper" />
                                                {company.address.street}, {company.address.zip} {company.address.city}
                                            </div>
                                            {company.contactPerson && (
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <User className="w-3 h-3 mr-2 text-brand-copper" />
                                                    {company.contactPerson}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`border-t p-4 grid grid-cols-3 gap-2 text-center relative z-0 ${isSponsored ? 'bg-white/50 border-brand-copper/20' : 'bg-gray-50 border-gray-100'}`}>
                                        <a href={`tel:${company.phone}`} onClick={() => onCompanyClick(company.id)} title="Call" className="flex justify-center items-center p-2 text-gray-500 hover:bg-green-100 hover:text-green-700 rounded-sm transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </a>
                                        <a href={`mailto:${company.email}`} onClick={() => onCompanyClick(company.id)} title="Email" className="flex justify-center items-center p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-700 rounded-sm transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </a>
                                        <a href={company.website} onClick={() => onCompanyClick(company.id)} target="_blank" rel="noopener noreferrer" title="Website" className="flex justify-center items-center p-2 text-gray-500 hover:bg-orange-100 hover:text-brand-copper rounded-sm transition-colors">
                                            <GlobeIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-20 col-span-full">
                            <p className="text-lg text-gray-500">No companies found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer categories={categories} />
        </div>
    );
};

export default Directory;