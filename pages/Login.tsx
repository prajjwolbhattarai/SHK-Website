import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, AlertTriangle } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate Google OAuth Popup & Logic
    setTimeout(() => {
        // Mock prompt to simulate selecting an account. 
        // In a real app, this would be handled by the Google Identity Services SDK.
        const email = window.prompt("Google Login Simulation\n\nPlease enter your Google email address to proceed:\n(Use 'admin@shk-rhein-neckar.de' or similar)", "admin@shk-rhein-neckar.de");

        setIsLoading(false);

        if (email) {
            // Check for "Approved" domains or specific emails
            const approvedDomains = ['shk-rhein-neckar.de', 'google.com', 'gmail.com']; // Relaxed for demo
            const domain = email.split('@')[1];

            if (approvedDomains.includes(domain) || email === 'admin@shk-rhein-neckar.de') {
                onLogin();
                navigate('/cms');
            } else {
                setError('Access Denied: Your Google Account is not authorized for this CMS.');
            }
        } else {
            // User cancelled prompt
        }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
             <Logo className="h-24 w-auto mx-auto mb-4" />
             <p className="text-brand-steel text-xs uppercase tracking-widest mt-1">Internal CMS</p>
          </div>

          <div className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 text-xs rounded-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-sm font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center shadow-sm relative"
            >
              {isLoading ? (
                  <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                  <>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Sign in with Google
                  </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                Authentication is delegated to Google Identity Services. <br/>
                Only authorized accounts can access the dashboard.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400">Authorized Personnel Only</p>
        </div>
      </div>
      
      <button 
        className="mt-8 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition cursor-pointer z-10" 
        onClick={() => navigate('/')}
      >
        ← Back to Magazine
      </button>
    </div>
  );
};

export default Login;