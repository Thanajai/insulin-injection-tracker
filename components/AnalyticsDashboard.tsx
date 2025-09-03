import React, { useMemo, useState, useEffect } from 'react';
import type { Injection } from '../types';
import { useTranslation } from './LanguageProvider';
import { ChartBarIcon, BloodDropIcon, CubeTransparentIcon, SyringeIcon } from './icons';

interface AnalyticsDashboardProps {
  injections: Injection[];
}

const StatCard: React.FC<{ title: string; value: string; unit: string; icon: React.ReactNode; }> = ({ title, value, unit, icon }) => (
    <div className="flex-1 text-center">
        <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-zinc-700/50 mb-1 text-zinc-300">
            {icon}
        </div>
        <p className="text-xs text-zinc-400">{title}</p>
        <p className="font-bold text-zinc-100">{value} <span className="text-xs text-zinc-400">{unit}</span></p>
    </div>
);

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ injections }) => {
  const { t, language } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after component mounts
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const weeklyData = useMemo(() => {
    const data: Array<{
      date: Date;
      units: number;
      glucoseSum: number;
      glucoseCount: number;
      carbsSum: number;
      carbsCount: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      data.push({ date, units: 0, glucoseSum: 0, glucoseCount: 0, carbsSum: 0, carbsCount: 0 });
    }

    injections.forEach(inj => {
      const injDate = new Date(inj.timestamp);
      injDate.setHours(0, 0, 0, 0);
      const dayData = data.find(d => d.date.getTime() === injDate.getTime());
      if (dayData) {
        dayData.units += inj.units;
        if (inj.glucoseLevel) {
          dayData.glucoseSum += inj.glucoseLevel;
          dayData.glucoseCount++;
        }
        if (inj.carbs) {
          dayData.carbsSum += inj.carbs;
          dayData.carbsCount++;
        }
      }
    });
    
    const processedData = data.map(d => ({
        label: d.date.toLocaleDateString(language, { weekday: 'short' }),
        units: d.units,
        avgGlucose: d.glucoseCount > 0 ? d.glucoseSum / d.glucoseCount : 0,
        avgCarbs: d.carbsCount > 0 ? d.carbsSum / d.carbsCount : 0,
    }));
    
    const maxUnits = Math.max(10, ...processedData.map(d => d.units));
    const maxGlucose = Math.max(100, ...processedData.map(d => d.avgGlucose));

    return { processedData, maxUnits, maxGlucose };
  }, [injections, language]);

  const { processedData, maxUnits, maxGlucose } = weeklyData;

  const overallStats = useMemo(() => {
      const recentInjections = injections.filter(inj => inj.timestamp >= new Date().setDate(new Date().getDate() - 7));
      const totalUnits = recentInjections.reduce((sum, inj) => sum + inj.units, 0);
      const glucoseReadings = recentInjections.filter(inj => inj.glucoseLevel).map(inj => inj.glucoseLevel!);
      const avgGlucose = glucoseReadings.length > 0 ? glucoseReadings.reduce((a,b) => a+b, 0) / glucoseReadings.length : 0;
      return { avgUnits: totalUnits / 7, avgGlucose };
  }, [injections]);


  return (
    <div className="bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 p-6 rounded-2xl shadow-lg shadow-black/20 transition-all duration-300 hover:border-zinc-600/60 hover:scale-[1.02] h-full">
      <div className="flex items-center space-x-2 text-zinc-400">
        <ChartBarIcon className="w-5 h-5" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">{t('trendsLast7Days')}</h3>
      </div>
      
      {injections.length === 0 ? (
         <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-zinc-500">{t('noDataForChart')}</p>
        </div>
      ) : (
      <>
        {/* Summary Stats */}
        <div className="flex justify-around items-center my-4 p-2 bg-zinc-900/30 rounded-lg">
            <StatCard title={t('avgDailyUnits')} value={overallStats.avgUnits.toFixed(1)} unit={t('units')} icon={<SyringeIcon className="w-4 h-4" />} />
             <div className="w-px h-10 bg-zinc-700/50"></div>
            <StatCard title={t('avgGlucose')} value={overallStats.avgGlucose.toFixed(0)} unit={t('glucoseUnit')} icon={<BloodDropIcon className="w-4 h-4" />} />
        </div>

        {/* Chart Area */}
        <div className="w-full h-48 flex items-end justify-between space-x-2 pt-2">
            {processedData.map((day, index) => (
                <div key={index} className="flex-1 h-full flex flex-col items-center justify-end">
                    <div className="w-full h-full flex items-end justify-center space-x-1">
                         {/* Glucose Bar */}
                        <div 
                            className="w-1/2 bg-rose-500/50 rounded-t-sm hover:bg-rose-500/80 transition-all duration-700 ease-out"
                            style={{ height: isMounted ? `${(day.avgGlucose / maxGlucose) * 100}%` : '0%' }}
                            title={`${t('avgGlucose')}: ${day.avgGlucose.toFixed(0)} ${t('glucoseUnit')}`}
                        />
                        {/* Insulin Bar */}
                        <div 
                            className="w-1/2 bg-sky-500/50 rounded-t-sm hover:bg-sky-500/80 transition-all duration-700 ease-out"
                            style={{ height: isMounted ? `${(day.units / maxUnits) * 100}%` : '0%' }}
                            title={`${t('totalInsulin')}: ${day.units.toFixed(1)} ${t('units')}`}
                        />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{day.label}</p>
                </div>
            ))}
        </div>
        <div className="flex justify-center items-center space-x-4 text-xs mt-2">
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500/50"></div><span>{t('avgGlucose')}</span></div>
            <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 rounded-sm bg-sky-500/50"></div><span>{t('totalInsulin')}</span></div>
        </div>
      </>
      )}

    </div>
  );
};