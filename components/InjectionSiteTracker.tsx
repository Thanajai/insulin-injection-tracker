import React, { useMemo } from 'react';
import type { Injection } from '../types';
import { INJECTION_SITE_DETAILS } from '../constants';
import { useTranslation } from './LanguageProvider';
import { MapPinIcon } from './icons';

interface InjectionSiteTrackerProps {
  injections: Injection[];
}

export const InjectionSiteTracker: React.FC<InjectionSiteTrackerProps> = ({ injections }) => {
  const { t } = useTranslation();
  const recentSites = useMemo(() => {
    return injections
      .filter(i => i.site)
      .slice(0, 5) // Get the 5 most recent
      .reverse(); // To draw oldest first
  }, [injections]);

  return (
    <div className="bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 p-6 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between transition-all duration-300 hover:border-zinc-600/60 hover:scale-[1.02] h-full">
      <div>
        <div className="flex items-center space-x-2 text-zinc-400">
          <MapPinIcon className="w-5 h-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">{t('injectionSiteTracker')}</h3>
        </div>
        <div className="relative w-48 h-48 mx-auto mt-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Torso outline */}
            <path d="M30,10 C30,10 15,30 25,50 C35,70 30,95 30,95 L70,95 C70,95 65,70 75,50 C85,30 70,10 70,10 Z" className="fill-zinc-700/20 stroke-zinc-600" strokeWidth="2" />
            {/* Center line */}
            <line x1="50" y1="20" x2="50" y2="95" className="stroke-zinc-700" strokeWidth="1" strokeDasharray="2,2" />
            {/* Mid line */}
            <line x1="25" y1="50" x2="75" y2="50" className="stroke-zinc-700" strokeWidth="1" strokeDasharray="2,2" />
            {/* Navel */}
            <circle cx="50" cy="50" r="3" className="fill-zinc-700" />
            
            {/* Injection site markers */}
            {recentSites.map((injection, index) => {
                if (!injection.site) return null;
                const details = INJECTION_SITE_DETAILS[injection.site];
                const opacity = 0.4 + (index / recentSites.length) * 0.6; // from 0.4 to 1.0
                return (
                    <circle
                        key={injection.id}
                        cx={details.coords.cx}
                        cy={details.coords.cy}
                        r="5"
                        className="fill-blue-400 stroke-blue-200"
                        strokeWidth="1.5"
                        style={{ opacity, transition: 'opacity 0.3s ease' }}
                    >
                      <title>
                        {`${t(details.nameKey as any)} - ${new Date(injection.timestamp).toLocaleString()}`}
                      </title>
                    </circle>
                )
            })}
          </svg>
        </div>
      </div>
       <div className="mt-4 text-xs text-center text-zinc-500">
         {recentSites.length > 0
            ? t('mostRecentInjection')
            : t('noSiteData')
         }
      </div>
    </div>
  );
};
