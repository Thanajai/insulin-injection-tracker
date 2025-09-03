import React from 'react';
import type { Injection, User } from '../types';
import { INSULIN_TYPE_DETAILS, GLUCOSE_TYPE_DETAILS, GLUCOSE_THRESHOLDS, INJECTION_SITE_DETAILS } from '../constants';
import { TrashIcon, PencilIcon, BloodDropIcon, CubeTransparentIcon, ExclamationTriangleIcon, MapPinIcon } from './icons';
import { useTranslation } from './LanguageProvider';


interface InjectionListProps {
  injections: Injection[];
  onDelete: (id: string) => void;
  onEdit: (injection: Injection) => void;
  currentPatientId: string | null;
  currentUser: User | null;
}

interface InjectionListItemProps {
    injection: Injection;
    onDelete: (id:string) => void;
    onEdit: (injection: Injection) => void;
    currentUser: User | null;
}

/**
 * Extracts the patient's name from a patient ID string.
 * e.g., "John Doe (doc1)" -> "John Doe"
 * @param patientId The full patient ID string.
 * @returns The extracted patient name.
 */
const getPatientName = (patientId: string | null): string => {
  if (!patientId) return '';
  const match = patientId.match(/^(.*?)\s*\(/);
  return match ? match[1].trim() : patientId;
};

const InjectionListItem: React.FC<InjectionListItemProps> = ({ injection, onDelete, onEdit, currentUser }) => {
    const { id, timestamp, type, units, notes, glucoseLevel, glucoseType, carbs, site } = injection;
    const typeDetails = INSULIN_TYPE_DETAILS[type];
    const date = new Date(timestamp);
    const { t, language } = useTranslation();

    const getGlucoseStatus = (level: number | undefined): { status: 'normal' | 'hypo' | 'hyper', className: string, labelKey: string } | null => {
        if (level === undefined) return null;
        if (level < GLUCOSE_THRESHOLDS.HYPO) return { status: 'hypo', className: 'text-sky-400', labelKey: 'hypo' };
        if (level > GLUCOSE_THRESHOLDS.HYPER) return { status: 'hyper', className: 'text-amber-400', labelKey: 'hyper' };
        return { status: 'normal', className: '', labelKey: 'normal' };
    };
    const glucoseStatus = getGlucoseStatus(glucoseLevel);

    const formattedDate = date.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString(language, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const isDoctor = currentUser?.role === 'Doctor';

    return (
        <li className="bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 transition-all duration-300 hover:shadow-xl hover:border-zinc-600/60 hover:scale-[1.02] animate-fade-in-fast">
            <div className="flex-grow w-full">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${typeDetails.colorClass}`}>
                        {typeDetails.name}
                    </span>
                    <p className="text-zinc-400 font-medium">{formattedDate} at {formattedTime}</p>
                </div>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-zinc-100">{units.toLocaleString(language)}</p>
                    <span className="text-zinc-400">{t('units')}</span>
                </div>
                
                {(glucoseLevel || carbs || site) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {glucoseLevel && (
                            <div className="flex items-center space-x-1.5 text-rose-300">
                                <BloodDropIcon className="w-4 h-4" />
                                <span className="font-semibold">{glucoseLevel} {t('glucoseUnit')}</span>
                                {glucoseType && <span className="text-rose-400/80">({t(GLUCOSE_TYPE_DETAILS[glucoseType].nameKey as any)})</span>}
                                {glucoseStatus && (glucoseStatus.status === 'hypo' || glucoseStatus.status === 'hyper') && (
                                    <span className={`ml-1 flex items-center text-xs font-bold ${glucoseStatus.className}`}>
                                        <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-0.5" />
                                        {t(glucoseStatus.labelKey as any)}
                                    </span>
                                )}
                            </div>
                        )}
                        {carbs && (
                             <div className="flex items-center space-x-1.5 text-amber-300">
                                <CubeTransparentIcon className="w-4 h-4" />
                                <span className="font-semibold">{carbs} {t('carbsUnit')}</span>
                            </div>
                        )}
                        {site && (
                             <div className="flex items-center space-x-1.5 text-teal-300">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="font-semibold">{t(INJECTION_SITE_DETAILS[site].nameKey as any)}</span>
                            </div>
                        )}
                    </div>
                )}
                {notes && <p className="mt-3 text-zinc-300 italic border-l-2 border-zinc-600 pl-3">"{notes}"</p>}
            </div>
            <div className="flex items-center self-end sm:self-center">
              {isDoctor && (
                  <>
                    <button 
                        onClick={() => onEdit(injection)}
                        className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors"
                        aria-label={t('edit')}
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onDelete(id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                        aria-label={t('delete')}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
              )}
            </div>
        </li>
    );
}

export const InjectionList: React.FC<InjectionListProps> = ({ injections, onDelete, onEdit, currentPatientId, currentUser }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">{t('injectionHistory')}</h2>
      {injections.length > 0 ? (
        <ul className="space-y-4">
          {injections.map((injection) => (
            <InjectionListItem key={injection.id} injection={injection} onDelete={onDelete} onEdit={onEdit} currentUser={currentUser} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 px-6 bg-zinc-800/30 backdrop-blur-lg border border-zinc-700/50 rounded-2xl">
            <p className="text-zinc-400">
              {currentPatientId 
                ? t('noInjectionsForPatient', { patientName: getPatientName(currentPatientId) })
                : t('noInjectionsYet')
              }
            </p>
            {currentUser?.role === 'Doctor' && (
                <p className="mt-2 text-sm text-zinc-500">{t('addNewInjectionHint')}</p>
            )}
        </div>
      )}
    </div>
  );
};