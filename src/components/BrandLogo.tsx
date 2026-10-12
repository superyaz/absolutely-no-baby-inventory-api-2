import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  orientation = 'horizontal'
}) => {
  const sizeMap = {
    sm: { symbol: 28, text: 'text-sm' },
    md: { symbol: 42, text: 'text-lg' },
    lg: { symbol: 64, text: 'text-2xl' },
    xl: { symbol: 96, text: 'text-3xl' }
  };

  const { symbol, text } = sizeMap[size];

  // SVG representation of the Absolutely No Baby symbol
  const symbolSvg = (
    <svg
      width={symbol}
      height={symbol}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md select-none"
    >
      {/* Outer subtle grunge / splatters */}
      <circle cx="15" cy="58" r="1.8" fill="#DC2626" />
      <circle cx="81" cy="69" r="2.1" fill="#DC2626" />
      <circle cx="70" cy="30" r="1.5" fill="#DC2626" />
      <circle cx="30" cy="86" r="2.2" fill="#DC2626" />
      <circle cx="24" cy="83" r="1.2" fill="#DC2626" />
      
      {/* Red Prohibition Ring */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="#DC2626"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Inner baby icon (stylized silhouette) */}
      <g fill="#171717" className="dark:fill-white">
        {/* Head */}
        <circle cx="50" cy="36" r="11" />
        {/* Torso */}
        <path d="M43 46 C41 46 38 49 38 54 C38 60 41 64 45 66 L55 66 C59 64 62 60 62 54 C62 49 59 46 57 46 Z" />
        {/* Left Arm */}
        <path d="M40 48 L32 58 C30 60 33 63 35 62 L43 53 Z" />
        {/* Right Arm */}
        <path d="M60 48 L68 58 C70 60 67 63 65 62 L57 53 Z" />
        {/* Left Leg (chubby toddler posture) */}
        <path d="M42 65 C39 67 36 71 37 77 C38 81 42 82 45 78 C47 74 46 69 46 65 Z" />
        {/* Right Leg */}
        <path d="M58 65 C61 67 64 71 63 77 C62 81 58 82 55 78 C53 74 54 69 54 65 Z" />
      </g>
      {/* Diagonal Prohibition Slash */}
      <line
        x1="22"
        y1="22"
        x2="78"
        y2="78"
        stroke="#DC2626"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {showText && (
          <span className={`font-black tracking-tighter uppercase font-sans mb-1 text-neutral-900 dark:text-neutral-50 ${text}`}>
            ABSOLUTELY
          </span>
        )}
        {symbolSvg}
        <span className="text-[10px] tracking-widest font-extrabold uppercase text-neutral-400 mt-1">
          NO BABY
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {symbolSvg}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-wider uppercase font-sans text-neutral-900 dark:text-neutral-50 ${text}`}>
            ABSOLUTELY
          </span>
          <span className="text-[10px] tracking-widest font-extrabold uppercase text-red-600 dark:text-red-500">
            NO BABY · INVENTARIO
          </span>
        </div>
      )}
    </div>
  );
};
