import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-20 w-auto", variant = 'dark' }) => {
  // Brand Colors
  // Dark Blue: #0f172a (Slate 900)
  // Copper: #b45309 (Amber 700)
  
  const textColor = variant === 'light' ? '#ffffff' : '#0f172a';
  const subTextColor = variant === 'light' ? '#94a3b8' : '#475569';
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 400" 
      className={className} 
      aria-label="SHK Rhein-Neckar Logo"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      
      {/* Background Container (Optional) - keeping it clean for now */}
      
      {/* ICON SECTION (Top) */}
      <g transform="translate(75, 20)">
         {/* Outer Box Shape */}
         <rect x="0" y="0" width="150" height="150" rx="24" fill={variant === 'light' ? 'rgba(255,255,255,0.1)' : '#0f172a'} />
         
         {/* Flame/Water Drop Stylized S-Curve */}
         <path 
           d="M75 35 C 75 35, 40 35, 40 65 C 40 95, 75 95, 75 125 C 75 125, 110 125, 110 95 C 110 65, 75 65, 75 35" 
           fill="none" 
           stroke="url(#brandGradient)" 
           strokeWidth="12" 
           strokeLinecap="round" 
           strokeLinejoin="round"
         />
         
         {/* Center Dot Accent */}
         <circle cx="75" cy="80" r="8" fill="#b45309" />
      </g>
      
      {/* TEXT SECTION (Middle) */}
      <text 
        x="150" 
        y="250" 
        fontFamily="Inter, sans-serif" 
        fontWeight="900" 
        fontSize="90" 
        fill={textColor} 
        textAnchor="middle" 
        letterSpacing="-2"
      >
        SHK
      </text>
      
      {/* SUBTITLE SECTION (Bottom) */}
      <text 
        x="150" 
        y="300" 
        fontFamily="Montserrat, sans-serif" 
        fontWeight="600" 
        fontSize="24" 
        fill={subTextColor} 
        textAnchor="middle" 
        letterSpacing="4"
      >
        RHEIN
      </text>
      <text 
        x="150" 
        y="335" 
        fontFamily="Montserrat, sans-serif" 
        fontWeight="600" 
        fontSize="24" 
        fill={subTextColor} 
        textAnchor="middle" 
        letterSpacing="4"
      >
        NECKAR
      </text>
      
      {/* Decorative Line */}
      <rect x="100" y="360" width="100" height="6" rx="3" fill="url(#brandGradient)" />
      
    </svg>
  );
};

export default Logo;