import React, { useState, useEffect, useMemo } from 'react';
import type { ScheduledDose, Injection } from '../types';
import { BellAlertIcon } from './icons';
import { INSULIN_TYPE_DETAILS } from '../constants';
import { useTranslation } from './LanguageProvider';

interface NextDoseCardProps {
  scheduledDose: ScheduledDose | null;
  injections: Injection[];
}

const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes

type DoseStatus =
  | { type: 'UPCOMING'; message: string; color: string; }
  | { type: 'DUE'; message: string; color: string; }
  | { type: 'TAKEN'; message: string; subMessage: string; color: string; }
  | { type: 'OVERDUE'; message: string; subMessage: string; color: string; };

const useDoseStatus = (scheduledDose: ScheduledDose | null, injections: Injection[]): DoseStatus | null => {
    const { t } = useTranslation();
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, []);

    return useMemo(() => {
        if (!scheduledDose) return null;

        const { timestamp: scheduledTime } = scheduledDose;
        const lastInjection = injections.length > 0 ? injections[0] : null;

        // Check if the scheduled dose has been taken
        if (lastInjection && Math.abs(lastInjection.timestamp - scheduledTime) < 2 * 60 * 60 * 1000) { // Check within a 2-hour window
            const diff = lastInjection.timestamp - scheduledTime;
            if (Math.abs(diff) <= GRACE_PERIOD_MS) {
                return { type: 'TAKEN', message: t('doseTakenOnTime'), subMessage: t('goodJob'), color: 'text-green-300 bg-green-500/20 border-green-500/30' };
            } else if (diff < 0) {
                return { type: 'TAKEN', message: t('doseTakenEarly'), subMessage: t('potentialOverdose'), color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' };
            } else {
                return { type: 'TAKEN', message: t('doseTakenLate'), subMessage: t('potentialUnderdose'), color: 'text-orange-300 bg-orange-500/20 border-orange-500/30' };
            }
        }

        const timeToDose = scheduledTime - now;

        if (Math.abs(timeToDose) <= GRACE_PERIOD_MS) {
            return { type: 'DUE', message: t('doseDue'), color: 'text-amber-300 bg-amber-500/20 border-amber-500/30 animate-pulse' };
        }
        
        if (timeToDose > GRACE_PERIOD_MS) {
            const hours = Math.floor(timeToDose / (1000 * 60 * 60));
            const minutes = Math.floor((timeToDose % (1000 * 60 * 60)) / (1000 * 60));
            return { type: 'UPCOMING', message: t('doseUpcoming', { hours, minutes }), color: 'text-sky-300 bg-sky-500/20 border-sky-500/30' };
        }

        return { type: 'OVERDUE', message: t('doseOverdue'), subMessage: t('consultDoctor'), color: 'text-red-300 bg-red-500/20 border-red-500/30' };
    }, [scheduledDose, injections, now, t]);
};


export const NextDoseCard: React.FC<NextDoseCardProps> = ({ scheduledDose, injections }) => {
    const status = useDoseStatus(scheduledDose, injections);
    const { t, language } = useTranslation();

    if (!scheduledDose || !status) {
        return null;
    }

    const { units, type, timestamp } = scheduledDose;
    const typeDetails = INSULIN_TYPE_DETAILS[type];
    const scheduledDate = new Date(timestamp);
    const formattedDate = scheduledDate.toLocaleDateString(language, { month: 'long', day: 'numeric' });
    const formattedTime = scheduledDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 p-6 rounded-2xl shadow-lg shadow-black/20 transition-all duration-300 hover:border-zinc-600/60 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellAlertIcon className="w-6 h-6 text-zinc-400" />
          <h3 className="text-md font-semibold uppercase tracking-wider text-zinc-300">{t('nextScheduledDose')}</h3>
        </div>
        {status && (
            <span className={`px-3 py-1 text-sm font-bold rounded-full border ${status.color}`}>
                {status.message}
            </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
            <p className="text-xl font-medium text-zinc-400">{formattedDate} at <span className="font-bold text-zinc-200">{formattedTime}</span></p>
             <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-3xl font-bold text-zinc-100">{units.toLocaleString(language)}</p>
                <span className="text-zinc-400">{t('units')} of</span>
                <span className={`px-2 py-0.5 text-sm font-semibold rounded-full ${typeDetails.colorClass}`}>{typeDetails.name}</span>
            </div>
        </div>
      </div>
      {status && 'subMessage' in status && (
        <p className={`mt-3 text-sm font-semibold text-center rounded p-2 border ${status.color}`}>
            {status.subMessage}
        </p>
      )}
    </div>
  );
};