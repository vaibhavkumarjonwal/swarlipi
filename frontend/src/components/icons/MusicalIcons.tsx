// Musical SVG icons for SwarLipi
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const TrebleClefIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.5 2c-1.5 0-2.8 0.5-3.7 1.4C7.9 4.3 7.5 5.6 7.5 7c0 1.4 0.4 2.7 1.3 3.6 0.9 0.9 2.2 1.4 3.7 1.4s2.8-0.5 3.7-1.4c0.9-0.9 1.3-2.2 1.3-3.6 0-1.4-0.4-2.7-1.3-3.6C15.3 2.5 14 2 12.5 2zM12.5 10c-0.8 0-1.5-0.3-2-0.8C10 8.7 9.7 8 9.7 7.2c0-0.8 0.3-1.5 0.8-2 0.5-0.5 1.2-0.8 2-0.8s1.5 0.3 2 0.8c0.5 0.5 0.8 1.2 0.8 2 0 0.8-0.3 1.5-0.8 2C14 9.7 13.3 10 12.5 10zM8.5 12c-0.8 0-1.5 0.7-1.5 1.5v6c0 0.8 0.7 1.5 1.5 1.5s1.5-0.7 1.5-1.5v-6C10 12.7 9.3 12 8.5 12zM16.5 14c-0.8 0-1.5 0.7-1.5 1.5v4c0 0.8 0.7 1.5 1.5 1.5s1.5-0.7 1.5-1.5v-4C18 14.7 17.3 14 16.5 14z"/>
  </svg>
);

export const SitarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M4 4c-1.1 0-2 0.9-2 2v12c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2H4zm16 14H4V6h16v12zM6 8v8h2V8H6zm4 0v8h2V8h-2zm4 2v6h2v-6h-2zm4-2v8h2V8h-2z"/>
  </svg>
);

export const NotesIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 3v10.55c-0.59-0.34-1.27-0.55-2-0.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    <circle cx="18" cy="5" r="1"/>
    <circle cx="10" cy="17" r="2"/>
  </svg>
);

export const RagaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-2.36L12 14.5l5.36-4.86c0.58 1.15 0.64 2.5 0.64 2.36 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-1.66 0.67-3.16 1.76-4.24L6.64 9.64z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const TranslateIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    <path d="M12 11l-2 2h4l-2-2zm0-3v6h2v-6h2l-3-3-3 3h2z"/>
  </svg>
);

export const ProcessIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    <path d="M12 17l3-3h-2v-4h-2v4H9l3 3z"/>
  </svg>
);

export const StaffLinesIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <g>
      <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1"/>
      <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
      <line x1="2" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1"/>
      <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1"/>
      <circle cx="8" cy="12" r="2" fill="currentColor"/>
      <circle cx="16" cy="9" r="2" fill="currentColor"/>
    </g>
  </svg>
);
