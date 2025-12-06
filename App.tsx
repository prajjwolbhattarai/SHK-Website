import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Magazine from './pages/Magazine';
import ArticleReader from './pages/ArticleReader';
import Directory from './pages/Directory';
import { Article, Company, FeaturedStatus } from './types';
import { LanguageProvider } from './contexts/LanguageContext';

// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
// Ensure the deployment is set to "Who has access: Anyone"
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1HIiwav_xV1B4zziqdXfkcybSrPiNeFaOaBcXdMK1TWnN4gx5TfbmK3LgGupeTwYF/exec';

const INITIAL_CATEGORIES = [
  'Branchen-News',
  'Ratgeber & Tipps',
  'Betriebs-Features',
  'Personal & Karriere',
  'Technologie',
  'Energie & Nachhaltigkeit',
  'Regional'
];

// No sample articles generated automatically anymore.
const GENERATED_ARTICLES: Article[] = [];

const STATIC_PAGES: Article[] = [
  { 
    id: 'page-imprint', 
    type: 'page', 
    title: 'Impressum', 
    summary: '', 
    content: `
      <h1>Impressum</h1>
      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        <strong>DS Media Solutions (Einzelunternehmen)</strong><br>
        Inhaber: Daniel Sartison<br>
        Carl-Zuckmayer-Straße 16<br>
        68169 Mannheim<br>
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +49 176 43493281<br>
        E-Mail: info@dsmediasolutions.de
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        Daniel Sartison<br>
        Carl-Zuckmayer-Straße 16<br>
        68169 Mannheim
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE455366729</p>

      <h2>Haftung für Inhalte</h2>
      <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen entfernen wir diese Inhalte umgehend.</p>

      <h2>Haftung für Links</h2>
      <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.</p>

      <h2>Urheberrecht</h2>
      <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.</p>
    `, 
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', 
    category: 'Page', 
    author: 'Daniel Sartison', 
    publishedAt: new Date().toISOString(), 
    featured: false, 
    views: 0, 
    shares: 0, 
    readTime: 0 
  },
  { 
    id: 'page-submit', 
    type: 'page', 
    title: 'Story einreichen', 
    summary: '', 
    // Content is minimal because we now inject a Form component in ArticleReader based on the 'page-submit' ID
    content: '<p class="lead">Haben Sie eine interessante Neuigkeit aus der Region oder ein Fachwissen, das Sie teilen möchten? Senden Sie uns Ihre Story direkt hier.</p>', 
    imageUrl: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=1200', 
    category: 'Page', 
    author: 'Redaktion', 
    publishedAt: new Date().toISOString(), 
    featured: false, 
    views: 0, 
    shares: 0, 
    readTime: 0 
  },
  { 
    id: 'page-advertising', 
    type: 'page', 
    title: 'Werben', 
    summary: '', 
    content: '<h2>Mediadaten 2025</h2><p>Erreichen Sie über 5000 Fachbetriebe in der Region.</p>', 
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200', 
    category: 'Page', 
    author: 'Sales', 
    publishedAt: new Date().toISOString(), 
    featured: false, 
    views: 0, 
    shares: 0, 
    readTime: 0 
  },
  { 
    id: 'page-jobs', 
    type: 'page', 
    title: 'Stellenmarkt', 
    summary: '', 
    content: '<h2>Jobs in der Region</h2><p>Aktuelle Angebote für Anlagenmechaniker SHK.</p>', 
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200', 
    category: 'Page', 
    author: 'HR', 
    publishedAt: new Date().toISOString(), 
    featured: false, 
    views: 0, 
    shares: 0, 
    readTime: 0 
  },
  { 
    id: 'page-privacy', 
    type: 'page', 
    title: 'Datenschutzerklärung', 
    summary: '', 
    content: `
      <h1>Datenschutzerklärung</h1>
      
      <h2>1. Datenschutz auf einen Blick</h2>
      <h3>Allgemeine Hinweise</h3>
      <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>

      <h3>Datenerfassung auf dieser Website</h3>
      <h4>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
      <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.</p>

      <h4>Wie erfassen wir Ihre Daten?</h4>
      <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
      <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.</p>

      <h4>Wofür nutzen wir Ihre Daten?</h4>
      <p>Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens oder zu Werbezwecken verwendet werden.</p>

      <!-- (Truncated privacy content for brevity) -->
      <p>Die vollständige Datenschutzerklärung finden Sie auf unserer Webseite.</p>
    `, 
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200', 
    category: 'Page', 
    author: 'Daniel Sartison', 
    publishedAt: new Date().toISOString(), 
    featured: false, 
    views: 0, 
    shares: 0, 
    readTime: 0 
  },
];

// Start with an empty directory
const MOCK_COMPANIES: Company[] = [];

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);

  // Initialize articles on mount (Static + Fetched)
  useEffect(() => {
    // 1. Set static articles immediately
    const initialArticles = [...GENERATED_ARTICLES, ...STATIC_PAGES];
    setArticles(initialArticles);

    // 2. Fetch dynamic articles from Google Sheets via App Script
    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        // Handle Articles
        if (data.articles && Array.isArray(data.articles)) {
           const fetchedArticles: Article[] = data.articles.map((item: any) => ({
             id: item.id || `sheet-${Math.random()}`,
             type: 'article',
             title: item.title,
             category: item.category,
             imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475',
             summary: item.summary,
             content: item.content,
             author: item.author || 'Contributor',
             publishedAt: item.publishedAt || new Date().toISOString(),
             featured: item.featured === true, // Check boolean
             views: 0,
             shares: 0,
             readTime: 5 * 60
           }));
           // Prepend fetched articles to the list (so they appear as newest)
           setArticles(prev => {
             // Avoid duplicates if strictly necessary, but appending fresh is fine for now
             return [...fetchedArticles, ...prev];
           });
        }

        // Handle Companies
        if (data.companies && Array.isArray(data.companies)) {
          const fetchedCompanies: Company[] = data.companies.map((item: any) => {
            // Robustly handle featuredStatus input from Google Sheet (case insensitive)
            const rawStatus = item.featuredStatus ? String(item.featuredStatus).toLowerCase() : 'none';
            const validStatus = ['featured', 'sponsored'].includes(rawStatus) ? (rawStatus as FeaturedStatus) : 'none';

            return {
              id: item.id,
              name: item.name,
              category: item.category,
              featuredStatus: validStatus, 
              logoUrl: item.logoUrl || 'https://placehold.co/100x100?text=Logo',
              description: item.description,
              contactPerson: item.contactPerson,
              phone: item.phone,
              email: item.email,
              website: item.website,
              address: {
                street: item.address?.street || '',
                city: item.address?.city || '',
                zip: item.address?.zip || ''
              },
              views: 0,
              clicks: 0
            };
          });
          setCompanies(prev => [...fetchedCompanies, ...prev]);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCompanyClick = (companyId: string) => {
    setCompanies(prevCompanies => 
      prevCompanies.map(company => 
        company.id === companyId ? { ...company, clicks: company.clicks + 1 } : company
      )
    );
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Magazine articles={articles} categories={categories} />} />
          <Route path="/article/:id" element={<ArticleReader articles={articles} categories={categories} />} />
          <Route 
            path="/directory" 
            element={<Directory companies={companies} categories={categories} onCompanyClick={handleCompanyClick} />} 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;