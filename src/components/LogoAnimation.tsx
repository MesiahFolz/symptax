"use client";

import React, { useState, useEffect } from "react";

const LogoAnimation: React.FC = () => {
  const [animationKey, setAnimationKey] = useState(0);

  const replayAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-12" key={animationKey}>
      <style>{`
        .logo-scene {
          display: flex;
          align-items: center;
          gap: 28px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards 0.2s;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hex-group {
          transform-origin: 120px 190px;
          animation: hexPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards 0.3s;
          opacity: 0;
          transform: scale(0.3);
        }
        @keyframes hexPop {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }

        .cross-v {
          transform-origin: 120px 195px;
          animation: growV 0.4s ease forwards 0.95s;
          transform: scaleY(0);
          opacity: 0;
        }
        @keyframes growV {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }

        .cross-h {
          transform-origin: 120px 187px;
          animation: growH 0.4s ease forwards 1.2s;
          transform: scaleX(0);
          opacity: 0;
        }
        @keyframes growH {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }

        .pulse-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawPulse 1s ease forwards 1.55s;
        }
        @keyframes drawPulse {
          to { stroke-dashoffset: 0; }
        }

        .brand-symp {
          animation: slideRight 0.5s ease forwards 0.7s;
          opacity: 0;
          transform: translateX(-20px);
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .brand-tax {
          animation: slideRight 0.5s ease forwards 0.9s;
          opacity: 0;
          transform: translateX(-20px);
        }

        .divider-line {
          animation: expandLine 0.5s ease forwards 1.3s;
          transform-origin: left center;
          transform: scaleX(0);
          opacity: 0;
        }
        @keyframes expandLine {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }

        .tagline-text {
          animation: fadeIn 0.6s ease forwards 1.6s;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .hex-main {
          animation: hexGlow 2.5s ease-in-out infinite 2.5s;
        }
        @keyframes hexGlow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.82; }
        }

        .brand-name-fill { fill: #0d9488; }
        .brand-tax-fill { fill: #0369a1; }
        .tagline-fill { fill: #94a3b8; }
        .divider-stroke { stroke: #e2e8f0; }

        .dark .brand-name-fill  { fill: #2dd4bf; }
        .dark .brand-tax-fill   { fill: #38bdf8; }
        .dark .tagline-fill     { fill: #94a3b8; }
        .dark .divider-stroke   { stroke: #334155; }
      `}</style>

      <div className="logo-scene">
        {/* Icon SVG */}
        <svg width="200" height="200" viewBox="60 100 130 170" role="img" xmlns="http://www.w3.org/2000/svg">
          <title>SympTax icon</title>
          <desc>Teal hexagon with a white medical cross and a heartbeat pulse line</desc>

          {/* Shadow */}
          <polygon fill="#0f766e" opacity="0.15"
            points="120,275 48,233 48,147 120,105 192,147 192,233"
            transform="translate(3,5)"/>

          <g className="hex-group">
            {/* Hex body */}
            <polygon className="hex-main" fill="#0d9488"
              points="120,275 48,233 48,147 120,105 192,147 192,233"/>

            {/* Cross vertical */}
            <rect className="cross-v" fill="#ffffff"
              x="106" y="152" width="28" height="86" rx="5"/>

            {/* Cross horizontal */}
            <rect className="cross-h" fill="#ffffff"
              x="85" y="173" width="70" height="28" rx="5"/>

            {/* Pulse line */}
            <polyline className="pulse-line"
              fill="none" stroke="#ffffff" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"
              points="48,190 75,190 88,165 100,215 112,178 125,178 136,190 192,190"/>
          </g>
        </svg>

        {/* Wordmark SVG */}
        <svg width="320" height="100" viewBox="0 0 320 100" role="img" xmlns="http://www.w3.org/2000/svg">
          <title>SympTax wordmark</title>

          <text className="brand-symp brand-name-fill"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontWeight="500" fontSize="52px"
            x="0" y="66">Symp</text>

          <text className="brand-tax brand-tax-fill"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontWeight="500" fontSize="52px"
            x="153" y="66">Tax</text>

          <line className="divider-line divider-stroke"
            x1="0" y1="76" x2="302" y2="76"
            strokeWidth="1"/>

          <text className="tagline-text tagline-fill"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontWeight="400" fontSize="11px"
            letterSpacing="2.5" x="1" y="95">SMART HEALTH CONSULTATIONS</text>
        </svg>
      </div>

      <button 
        className="px-7 py-2.5 bg-transparent border-[1.5px] border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 rounded-full text-sm font-medium tracking-wide transition-all hover:bg-teal-600 hover:text-white dark:hover:bg-teal-400 dark:hover:text-slate-900"
        onClick={replayAnimation}
      >
        Replay animation
      </button>
    </div>
  );
};

export default LogoAnimation;
