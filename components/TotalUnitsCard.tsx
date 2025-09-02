import React, { useMemo } from 'react';
import type { Injection } from '../types';
import { SyringeIcon } from './icons';
import { useTranslation } from './LanguageProvider';


interface TotalUnitsCardProps {
    injections: Injection[];
}

export const TotalUnitsCard: React.FC<TotalUnitsCardProps> = ({ injections }) => {
    const { t, language } = useTranslation();

    const totalUnitsToday = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return injections
            .filter(injection => injection.timestamp >= today.getTime())
            .reduce((total, injection) => total + injection.units, 0);
    }, [injections]);

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div>
                <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
                    <SyringeIcon className="w-5 h-5" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">{t('totalUnitsToday')}</h3>
                </div>
                <div className="flex items-baseline space-x-2 mt-3">
                    <p className="text-4xl lg:text-5xl font-bold text-emerald-600 dark:text-emerald-500">
                        {totalUnitsToday.toLocaleString(language, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                    </p>
                    <span className="text-xl text-zinc-500 dark:text-zinc-400">{t('units')}</span>
                </div>
            </div>
             <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                {t('sinceMidnight')}
            </div>
        </div>
    );
};