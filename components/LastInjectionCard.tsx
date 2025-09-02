import React, { useState, useEffect } from 'react';
import type { Injection } from '../types';
import { ClockIcon } from './icons';
import { useTranslation } from './LanguageProvider';

interface LastInjectionCardProps {
  lastInjection: Injection | null;
}

const useTimeAgo = (timestamp: number | null): string => {
    const { t } = useTranslation();
    const [timeAgo, setTimeAgo] = useState('');

    const formatTimeAgo = (ts: number): string => {
        const now = Date.now();
        const seconds = Math.floor((now - ts) / 1000);

        if (seconds < 60) return t('secondsAgo', { count: seconds });
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('minutesAgo', { count: minutes });
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('hoursAgo', { count: hours });
        
        const days = Math.floor(hours / 24);
        if (days < 30) return t('daysAgo', { count: days });
        
        const months = Math.floor(days / 30);
        if (months < 12) return t('monthsAgo', { count: months });
        
        const years = Math.floor(days / 365);
        return t('yearsAgo', { count: years });
    };

    useEffect(() => {
        if (!timestamp) {
            setTimeAgo('');
            return;
        };

        const interval = setInterval(() => {
            setTimeAgo(formatTimeAgo(timestamp));
        }, 60000); // Update every minute

        setTimeAgo(formatTimeAgo(timestamp)); // Initial format

        return () => clearInterval(interval);
    }, [timestamp, t]);

    return timeAgo;
};

export const LastInjectionCard: React.FC<LastInjectionCardProps> = ({ lastInjection }) => {
  const timeAgo = useTimeAgo(lastInjection?.timestamp ?? null);
  const { t, language } = useTranslation();

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div>
        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
          <ClockIcon className="w-5 h-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">{t('lastInjection')}</h3>
        </div>
        {lastInjection ? (
          <p className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-500 mt-3">{timeAgo}</p>
        ) : (
          <p className="text-3xl font-bold text-zinc-700 dark:text-zinc-300 mt-3">{t('noInjectionsLogged')}</p>
        )}
      </div>
      {lastInjection && (
        <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
           {t('atTime', { time: new Date(lastInjection.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) })}
        </div>
      )}
    </div>
  );
};