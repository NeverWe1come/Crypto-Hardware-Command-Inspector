/**
 * @packageDocumentation
 * Official Brand Identity Logo component for Crypto Hardware Command Inspector (`@chci/explorer`).
 * Features a high-precision cryptographic hardware security shield, silicon microchip circuit traces,
 * golden contact pads, and secure terminal prompt cursor.
 */

import React from 'react';

export interface BrandLogoProps {
  /** Size in pixels (width and height). Defaults to 28. */
  readonly size?: number;
  /** Optional additional CSS classes. */
  readonly className?: string;
  /** Whether to show full brand text next to the emblem. */
  readonly showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 28,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        aria-hidden="true"
      >
        <defs>
          {/* Shield Outer Gradient */}
          <linearGradient id="chciShieldGrad" x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Shield Border Gradient */}
          <linearGradient id="chciBorderGrad" x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Golden Chip Glow */}
          <linearGradient id="chciGoldGrad" x1="44" y1="44" x2="84" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Circuit Traces Cyan */}
          <linearGradient id="chciCircuitGrad" x1="28" y1="28" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Center Glow Filter */}
          <filter id="chciGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield Outer Path */}
        <path
          d="M64 10 L108 26 C108 72 88 108 64 120 C40 108 20 72 20 26 Z"
          fill="url(#chciShieldGrad)"
          stroke="url(#chciBorderGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Accent Contour */}
        <path
          d="M64 18 L100 31 C100 68 84 98 64 109 C44 98 28 68 28 31 Z"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
        />

        {/* Hardware Circuit Traces (Horizontal & Vertical Bus) */}
        {/* Top bus */}
        <line x1="64" y1="18" x2="64" y2="38" stroke="url(#chciCircuitGrad)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="64" cy="22" r="2" fill="#38bdf8" />

        {/* Left bus */}
        <path d="M30 46 L46 46 L50 50" fill="none" stroke="url(#chciCircuitGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="34" cy="46" r="1.8" fill="#38bdf8" />

        {/* Right bus */}
        <path d="M98 46 L82 46 L78 50" fill="none" stroke="url(#chciCircuitGrad)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="94" cy="46" r="1.8" fill="#38bdf8" />

        {/* Bottom bus */}
        <line x1="64" y1="90" x2="64" y2="108" stroke="url(#chciCircuitGrad)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="64" cy="104" r="2" fill="#38bdf8" />

        {/* Silicon HSM Microchip (Square angled in center) */}
        <rect
          x="44"
          y="44"
          width="40"
          height="40"
          rx="6"
          fill="#090d16"
          stroke="url(#chciGoldGrad)"
          strokeWidth="2.5"
        />

        {/* Microchip Contact Pins (2 on each edge) */}
        {/* Top pins */}
        <line x1="52" y1="40" x2="52" y2="44" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="76" y1="40" x2="76" y2="44" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bottom pins */}
        <line x1="52" y1="84" x2="52" y2="88" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="76" y1="84" x2="76" y2="88" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left pins */}
        <line x1="40" y1="52" x2="44" y2="52" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="76" x2="44" y2="76" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Right pins */}
        <line x1="84" y1="52" x2="88" y2="52" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="84" y1="76" x2="88" y2="76" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Central Terminal / Cryptographic Lock Prompt `>_` */}
        {/* Cyan command prompt `>` */}
        <path
          d="M54 57 L62 64 L54 71"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Gold blinking cursor `_` */}
        <line
          x1="67"
          y1="71"
          x2="75"
          y2="71"
          stroke="#f59e0b"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
            CHCI
            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-normal">
              v1.0
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            Crypto Hardware Command Inspector
          </span>
        </div>
      )}
    </div>
  );
};
