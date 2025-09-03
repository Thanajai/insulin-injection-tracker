import React from 'react';
import { InjectionSite } from '../types';
import { INJECTION_SITE_DETAILS } from '../constants';

interface InjectionSiteSelectorProps {
  selectedSite: InjectionSite | undefined;
  onSelectSite: (site: InjectionSite) => void;
}

export const InjectionSiteSelector: React.FC<InjectionSiteSelectorProps> = ({ selectedSite, onSelectSite }) => {
  return (
    <div className="relative w-40 h-40 mx-auto bg-zinc-900/30 rounded-full p-2">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Torso outline */}
        <path d="M30,10 C30,10 15,30 25,50 C35,70 30,95 30,95 L70,95 C70,95 65,70 75,50 C85,30 70,10 70,10 Z" className="fill-transparent stroke-zinc-600" strokeWidth="2" />
        {/* Center line */}
        <line x1="50" y1="20" x2="50" y2="95" className="stroke-zinc-700" strokeWidth="1" strokeDasharray="2,2" />
        {/* Mid line */}
        <line x1="25" y1="50" x2="75" y2="50" className="stroke-zinc-700" strokeWidth="1" strokeDasharray="2,2" />
        {/* Navel */}
        <circle cx="50" cy="50" r="3" className="fill-zinc-700" />

        {/* Clickable Areas */}
        {Object.entries(INJECTION_SITE_DETAILS).map(([key, { area }]) => (
          <rect
            key={key}
            x={area.x}
            y={area.y}
            width={area.width}
            height={area.height}
            onClick={() => onSelectSite(key as InjectionSite)}
            className={`cursor-pointer transition-colors ${selectedSite === key ? 'fill-blue-500/40' : 'fill-transparent hover:fill-blue-500/20'}`}
          />
        ))}
      </svg>
    </div>
  );
};
