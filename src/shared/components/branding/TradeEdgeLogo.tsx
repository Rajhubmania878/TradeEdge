import React from 'react';

interface TradeEdgeLogoProps {
  size?: number;
  className?: string;
}

export const TradeEdgeLogo: React.FC<TradeEdgeLogoProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
      stroke="#2563eb"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path
      d="M12 6L7.5 8.5V13.5L12 16L16.5 13.5V8.5L12 6Z"
      fill="#2563eb"
      fillOpacity="0.18"
      stroke="#2563eb"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11" r="2.2" fill="#2563eb" />
  </svg>
);

export default TradeEdgeLogo;
